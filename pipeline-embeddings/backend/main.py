import os, base64, json, pathlib, time
from datetime import datetime, date
from typing import List, Optional, Tuple

from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, conlist
from dotenv import load_dotenv

import numpy as np
import faiss

from sqlalchemy import (create_engine, Column, String, Integer, Float, Text,
                        DateTime, ForeignKey, LargeBinary)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

from openai import OpenAI

# ---------- Config ----------
load_dotenv()
DATA_DIR = pathlib.Path(os.getenv("DATA_DIR", "./storage"))
DATA_DIR.mkdir(parents=True, exist_ok=True)

DB_URL = os.getenv("DB_URL", "sqlite:///./caipo.db")
EMBED_MODEL = os.getenv("EMBED_MODEL", "text-embedding-3-small")
FAISS_INDEX_PATH = os.getenv("FAISS_INDEX_PATH", str(DATA_DIR / "faiss.index"))

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ---------- DB setup ----------
Base = declarative_base()
engine = create_engine(DB_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)

class File(Base):
    __tablename__ = "files"
    id = Column(String, primary_key=True)                  # uuid string (external id)
    kind = Column(String, nullable=False)                  # "audio" | "video"
    device_id = Column(String, nullable=True)
    path = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    transcripts = relationship("Transcript", back_populates="file")

class Transcript(Base):
    __tablename__ = "transcripts"
    id = Column(Integer, primary_key=True, autoincrement=True)
    file_id = Column(String, ForeignKey("files.id"), index=True)
    # store Whisper segments as JSON: [{"start":float,"end":float,"text":str}, ...]
    segments_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    file = relationship("File", back_populates="transcripts")

class Embedding(Base):
    __tablename__ = "embeddings"
    id = Column(Integer, primary_key=True, autoincrement=True)
    file_id = Column(String, index=True)
    segment_id = Column(Integer)
    start_s = Column(Float)
    end_s = Column(Float)
    text = Column(Text)
    # (optional) keep raw vector if you want (not required when persisting FAISS separately)
    vec = Column(LargeBinary, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class FaissMap(Base):
    """
    Persistent mapping from faiss_id -> embeddings.id
    """
    __tablename__ = "faiss_map"
    faiss_id = Column(Integer, primary_key=True)
    embedding_id = Column(Integer, index=True)

Base.metadata.create_all(engine)

# ---------- FAISS index manager ----------
class FaissStore:
    def __init__(self, path: str, dim: int):
        self.path = path
        self.dim = dim
        self.index = None
        self._load_or_init()

    def _load_or_init(self):
        p = pathlib.Path(self.path)
        if p.exists():
            self.index = faiss.read_index(self.path)
        else:
            self.index = faiss.IndexFlatIP(self.dim)

    def save(self):
        faiss.write_index(self.index, self.path)

    @staticmethod
    def _normalize(v: np.ndarray) -> np.ndarray:
        # cosine similarity via inner product after L2-normalize
        norms = np.linalg.norm(v, axis=1, keepdims=True) + 1e-12
        return v / norms

    def add(self, X: np.ndarray) -> Tuple[int, int]:
        """
        Add vectors, return (start_id, count)
        """
        X = X.astype("float32")
        X = self._normalize(X)
        start_id = self.index.ntotal
        self.index.add(X)
        return start_id, X.shape[0]

    def search(self, q: np.ndarray, top_k: int):
        q = q.astype("float32")
        q = self._normalize(q)
        D, I = self.index.search(q, top_k)
        return D, I

# openai embedding util
def embed_texts(texts: List[str]) -> np.ndarray:
    if not texts:
        return np.zeros((0, 1536), dtype="float32")
    resp = client.embeddings.create(
        model=EMBED_MODEL,
        input=texts
    )
    # OpenAI v1 returns data list with .embedding
    vecs = [np.array(d.embedding, dtype="float32") for d in resp.data]
    return np.vstack(vecs)

# global FAISS
EMBED_DIM = 1536  # text-embedding-3-small
faiss_store = FaissStore(FAISS_INDEX_PATH, EMBED_DIM)

# ---------- Pydantic models ----------
class TimeRange(BaseModel):
    __root__: conlist(date, min_items=2, max_items=2)

    @property
    def start(self) -> datetime:
        return datetime.combine(self.__root__[0], datetime.min.time())

    @property
    def end(self) -> datetime:
        return datetime.combine(self.__root__[1], datetime.max.time())

class QueryFilters(BaseModel):
    device_id: Optional[str] = None
    time_range: Optional[TimeRange] = None

class QueryEmbeddingsRequest(BaseModel):
    q_vector: Optional[str] = Field(None, description="base64 float32[1536]")
    q_text:   Optional[str] = Field(None, description="optional raw text to embed")
    top_k:    int = 5
    filters:  Optional[QueryFilters] = None

class QueryResultItem(BaseModel):
    file_id: str
    segment_id: int
    score: float
    start_s: float
    end_s: float
    text: str

class QueryEmbeddingsResponse(BaseModel):
    results: List[QueryResultItem]

# ---------- Helper: decode base64 -> float32 vector ----------
def decode_b64_vec(b64: str) -> np.ndarray:
    raw = base64.b64decode(b64)
    arr = np.frombuffer(raw, dtype=np.float32)
    if arr.size != EMBED_DIM:
        raise HTTPException(status_code=400, detail=f"q_vector has dim {arr.size}, expected {EMBED_DIM}")
    return arr.reshape(1, -1)

# ---------- Backfill API (per file_id) ----------
class BackfillRequest(BaseModel):
    file_id: str

def backfill_file_embeddings(file_id: str) -> int:
    """
    Load transcript segments for file_id, compute embeddings, upsert into DB,
    add to FAISS, and persist mapping.
    Returns number of segments embedded.
    """
    db = SessionLocal()
    try:
        tr = (
            db.query(Transcript)
            .filter(Transcript.file_id == file_id)
            .order_by(Transcript.id.desc())
            .first()
        )
        if not tr:
            raise HTTPException(status_code=404, detail="Transcript not found for file_id")

        segments = json.loads(tr.segments_json)
        texts = [seg.get("text", "") for seg in segments]
        if not texts:
            return 0

        vecs = embed_texts(texts)   # [N, 1536]
        start_id, count = faiss_store.add(vecs)

        # Write Embedding metadata + mapping
        created_ids = []
        for i, seg in enumerate(segments):
            e = Embedding(
                file_id=file_id,
                segment_id=i,
                start_s=float(seg.get("start", 0.0)),
                end_s=float(seg.get("end", 0.0)),
                text=seg.get("text", ""),
                vec=None  # optional to save space
            )
            db.add(e)
            db.flush()  # get e.id
            faiss_id = start_id + i
            db.add(FaissMap(faiss_id=faiss_id, embedding_id=e.id))
            created_ids.append(e.id)

        db.commit()
        faiss_store.save()
        return len(created_ids)
    finally:
        db.close()

# ---------- Search with filters ----------
def search_with_filters(q_vec: np.ndarray, top_k: int, filters: Optional[QueryFilters]) -> List[QueryResultItem]:
    db = SessionLocal()
    try:
        # ask for more and filter down
        overshoot = max(top_k * 5, top_k)
        D, I = faiss_store.search(q_vec, overshoot)
        ids = I[0]
        scores = D[0]
        results: List[QueryResultItem] = []

        if faiss_store.index.ntotal == 0:
            return results

        # Map FAISS ids -> embedding rows
        if ids.size == 0:
            return results

        # Load mappings in bulk
        faiss_ids = [int(x) for x in ids if x >= 0]
        if not faiss_ids:
            return results

        fm_rows = db.query(FaissMap).filter(FaissMap.faiss_id.in_(faiss_ids)).all()
        map_dict = {r.faiss_id: r.embedding_id for r in fm_rows}

        emb_rows = db.query(Embedding).filter(Embedding.id.in_(map_dict.values())).all()
        emb_by_id = {e.id: e for e in emb_rows}

        # pre-load file metadata for filtering
        file_ids = list({e.file_id for e in emb_rows})
        files = db.query(File).filter(File.id.in_(file_ids)).all()
        file_by_id = {f.id: f for f in files}

        def passes_filters(emb: Embedding) -> bool:
            if not filters:
                return True
            f = file_by_id.get(emb.file_id)
            if not f:
                return False
            if filters.device_id and f.device_id != filters.device_id:
                return False
            if filters.time_range:
                if not (filters.time_range.start <= f.created_at <= filters.time_range.end):
                    return False
            return True

        for faiss_id, score in zip(ids, scores):
            if faiss_id < 0:
                continue
            emb_id = map_dict.get(int(faiss_id))
            if not emb_id:
                continue
            emb = emb_by_id.get(emb_id)
            if not emb:
                continue
            if not passes_filters(emb):
                continue
            results.append(
                QueryResultItem(
                    file_id=emb.file_id,
                    segment_id=emb.segment_id,
                    score=float(score),
                    start_s=emb.start_s,
                    end_s=emb.end_s,
                    text=emb.text
                )
            )
            if len(results) >= top_k:
                break

        return results
    finally:
        db.close()

# ---------- FastAPI app ----------
app = FastAPI(title="CAIPO Embeddings API", version="0.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

@app.get("/health")
def health():
    return {"status": "ok", "faiss_ntotal": faiss_store.index.ntotal}

@app.post("/admin/backfill", response_model=dict)
def admin_backfill(req: BackfillRequest):
    n = backfill_file_embeddings(req.file_id)
    return {"status": "ok", "embedded_segments": n}

@app.post("/query/embeddings", response_model=QueryEmbeddingsResponse)
def query_embeddings(payload: QueryEmbeddingsRequest = Body(...)):
    if payload.q_vector:
        q = decode_b64_vec(payload.q_vector)
    elif payload.q_text:
        q = embed_texts([payload.q_text])
    else:
        raise HTTPException(status_code=400, detail="Provide q_vector (base64) or q_text")

    results = search_with_filters(q, payload.top_k, payload.filters)
    return QueryEmbeddingsResponse(results=results)
