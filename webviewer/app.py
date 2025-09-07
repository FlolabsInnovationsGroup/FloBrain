# Tiny CAIPO Web Viewer — Streamlit single-file app (sprint-ready)
# ----------------------------------------------------------------
# One-page UI: list uploads -> media player (video/audio) -> transcript -> search
# Search: local text OR backend embeddings (/query/embeddings with base64 q_vector)
# Extras: /healthz indicator, filters (device_id, time_range), "limit to selected file"
#
# Quick start:
#   pip install streamlit requests numpy python-dotenv
#   streamlit run webviewer/app.py

from __future__ import annotations

import os
import base64
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import List, Optional, Any, Dict, Tuple

import numpy as np
import requests
import streamlit as st
from streamlit.components.v1 import html as st_html

# ----------------------------
# Page / Theme
# ----------------------------
st.set_page_config(page_title="CAIPO Tiny Web Viewer", layout="wide")

st.markdown(
    """
    <style>
      .seg { padding: .6rem .75rem; border-bottom: 1px solid #eee; cursor: pointer; }
      .seg:hover { background: #fafafa; }
      .seg.active { background: #fff3cd; }
      .seg-time { color: #666; font-size: 12px; margin-bottom: 2px; }
      .seg-text { font-size: 14px; line-height: 1.35; white-space: pre-wrap; }
      .pill { display:inline-block; background:#111; color:#fff; padding:3px 8px; border-radius:999px; font-size:12px; }
    </style>
    """,
    unsafe_allow_html=True,
)

# ----------------------------
# Config / Endpoints
# ----------------------------
API_BASE_URL = (
    (st.secrets.get("API_BASE_URL") if hasattr(st, "secrets") else None)
    or os.getenv("API_BASE_URL", "")
).strip()

ENDPOINTS = {
    "list_files": lambda limit=20: f"{API_BASE_URL}/files?limit={limit}",
    "list_uploads": lambda limit=20: f"{API_BASE_URL}/uploads?limit={limit}",
    "get_transcript": lambda fid: f"{API_BASE_URL}/transcripts/{fid}",
    "query_embeddings": lambda: f"{API_BASE_URL}/query/embeddings",
    "health": lambda: f"{API_BASE_URL}/healthz",
}

# ----------------------------
# Data models
# ----------------------------
@dataclass
class Upload:
    id: str
    kind: Optional[str] = None          # "video" | "audio" | None
    device_id: Optional[str] = None
    title: Optional[str] = None
    created_at: Optional[str] = None
    duration: Optional[float] = None
    media_url: Optional[str] = None     # video_url | audio_url | generic
    transcript_url: Optional[str] = None
    thumbnail_url: Optional[str] = None

@dataclass
class TranscriptSegment:
    start: float
    end: float
    text: str
    embedding_base64: Optional[str] = None
    _embedding_cache: Optional[np.ndarray] = None

@dataclass
class SearchHit:
    file_id: str
    start: float
    end: float
    text: str
    score: float

# ----------------------------
# Mock data for no-API tests
# ----------------------------
MOCK_UPLOADS: List[Upload] = [
    Upload(
        id="demo-1",
        kind="video",
        title="CAIPO Demo Call — Vision Overview",
        device_id="SIM-001",
        created_at=datetime.now(timezone.utc).isoformat(),
        duration=5,
        media_url="https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
    )
]

MOCK_TRANSCRIPT: List[TranscriptSegment] = [
    TranscriptSegment(1, 2.5, "Welcome to the CAIPO demo. Today we outline the tiny web viewer."),
    TranscriptSegment(2.5, 4.2, "It lists recent uploads, plays video/audio, shows transcript, and supports search."),
    TranscriptSegment(4.2, 5.0, "Paste a base64 q_vector to run similarity search."),
]

# ----------------------------
# HTTP helpers
# ----------------------------
def http_get_json(url: str):
    r = requests.get(url, timeout=30)
    r.raise_for_status()
    return r.json()

def http_post_json(url: str, body: dict):
    r = requests.post(url, json=body, timeout=60)
    r.raise_for_status()
    return r.json()

# ----------------------------
# Adapters (tolerant to field names)
# ----------------------------
def _to_upload(x: Dict[str, Any]) -> Upload:
    fid = str(x.get("id") or x.get("file_id") or x.get("uuid") or x.get("_id"))
    kind = x.get("kind") or x.get("type") or x.get("media_type")
    title = x.get("title") or x.get("name") or fid
    created_at = x.get("created_at") or x.get("uploaded_at") or x.get("ts")
    duration = x.get("duration") or x.get("length") or x.get("length_sec")
    device_id = x.get("device_id") or x.get("source_device")
    transcript_url = x.get("transcript_url")
    media_url = (
        x.get("media_url")
        or x.get("video_url")
        or x.get("audio_url")
        or (f"{API_BASE_URL}/files/{fid}/download" if API_BASE_URL else None)
    )
    thumb = x.get("thumbnail_url") or x.get("thumb")
    return Upload(
        id=fid,
        kind=kind,
        device_id=device_id,
        title=title,
        created_at=created_at,
        duration=float(duration) if duration is not None else None,
        media_url=media_url,
        transcript_url=transcript_url,
        thumbnail_url=thumb,
    )

def list_uploads(limit=20) -> List[Upload]:
    if not API_BASE_URL:
        return MOCK_UPLOADS
    data = None
    try:
        data = http_get_json(ENDPOINTS["list_files"](limit))
    except Exception:
        data = http_get_json(ENDPOINTS["list_uploads"](limit))
    out: List[Upload] = []
    if isinstance(data, dict) and "items" in data:
        data = data["items"]
    for x in (data or []):
        out.append(_to_upload(x))
    return out

def get_transcript(u: Upload) -> List[TranscriptSegment]:
    if not API_BASE_URL:
        return MOCK_TRANSCRIPT
    if u.transcript_url:
        data = http_get_json(u.transcript_url)
    else:
        data = http_get_json(ENDPOINTS["get_transcript"](u.id))
    out: List[TranscriptSegment] = []
    for x in data:
        out.append(
            TranscriptSegment(
                start=float(x.get("start", x.get("ts_start", 0))),
                end=float(x.get("end", x.get("ts_end", 0))),
                text=str(x.get("text", x.get("segment_text", ""))),
                embedding_base64=x.get("embedding_base64"),
            )
        )
    return out

def backend_embedding_search(
    *, qvec_b64: str, top_k: int, file_scope: Optional[str], device_id: Optional[str], time_range: Optional[Tuple[float, float]]
) -> List[SearchHit]:
    if not API_BASE_URL:
        raise RuntimeError("Backend embedding search unavailable in mock mode.")
    payload: Dict[str, Any] = {
        "q_vector": qvec_b64,     # allow either name server-side
        "qvec_base64": qvec_b64,
        "top_k": top_k,
    }
    if file_scope:
        payload["file_id"] = file_scope
    if device_id:
        payload["device_id"] = device_id
    if time_range and all(isinstance(t, (int, float)) for t in time_range):
        payload["time_range"] = [float(time_range[0]), float(time_range[1])]

    data = http_post_json(ENDPOINTS["query_embeddings"](), payload)
    out: List[SearchHit] = []
    for x in (data or []):
        file_id = str(x.get("file_id") or x.get("video_id") or "")
        if "ts_range" in x and isinstance(x["ts_range"], (list, tuple)) and len(x["ts_range"]) == 2:
            start, end = float(x["ts_range"][0]), float(x["ts_range"][1])
        else:
            start = float(x.get("start", x.get("ts_start", 0)))
            end = float(x.get("end", x.get("ts_end", 0)))
        text = str(x.get("text", x.get("segment_text", "")))
        score = float(x.get("score", x.get("similarity", 0)))
        out.append(SearchHit(file_id=file_id, start=start, end=end, text=text, score=score))
    out.sort(key=lambda h: h.score, reverse=True)
    return out

# ----------------------------
# Local text search
# ----------------------------
def decode_base64_float32(b64: str) -> np.ndarray:
    s = (b64 or "").strip()
    if "," in s:
        s = s.split(",")[-1]
    raw = base64.b64decode(s)
    return np.frombuffer(raw, dtype=np.float32)

def cosine_sim(a: np.ndarray, b: np.ndarray) -> float:
    if a.size == 0 or b.size == 0:
        return 0.0
    n = min(a.size, b.size)
    a = a[:n]
    b = b[:n]
    na = np.linalg.norm(a)
    nb = np.linalg.norm(b)
    if na == 0 or nb == 0:
        return 0.0
    return float(np.dot(a, b) / (na * nb))

def local_text_search(segments: List[TranscriptSegment], query: str, file_id: str, top_k=10) -> List[SearchHit]:
    q = (query or "").strip().lower()
    if not q:
        return []
    hits: List[SearchHit] = []
    for s in segments:
        t = s.text.lower()
        if q in t:
            base = min(1.0, (len(q) / max(1, len(s.text))))
            bonus = 0.1 if t.startswith(q) else 0.0
            hits.append(SearchHit(file_id, s.start, s.end, s.text, base + bonus))
    hits.sort(key=lambda x: x.score, reverse=True)
    return hits[:top_k]

# ----------------------------
# Media component (HTML+JS with escaped braces)
# ----------------------------
def media_player(url: str, start: float, kind: Optional[str]):
    start = max(0.0, float(start or 0.0))
    tag = "audio" if (kind or "").lower() == "audio" else "video"
    style = "width:100%; max-height:40vh; background:#000; border:1px solid #e5e7eb; border-radius:8px;"
    html = f"""
<{tag} id="media" src="{url}" controls playsinline style="{style}"></{tag}>
<script>
  const v = document.getElementById('media');
  const target = {start};
  function seekAndPlay() {{
    try {{ v.currentTime = Math.max(0, target - 0.2); }} catch (e) {{}}
    if (v.play) {{ v.play().catch(()=>{{}}); }}
  }}
  if (v.readyState >= 2) {{ seekAndPlay(); }}
  else {{ v.addEventListener('loadedmetadata', seekAndPlay); }}
</script>
"""
    st_html(html, height=360, scrolling=False)

# ----------------------------
# Session state (no type annotations here)
# ----------------------------
if "seek_time" not in st.session_state:
    st.session_state.seek_time = 0.0
if "selected_id" not in st.session_state:
    st.session_state.selected_id = None
if "results" not in st.session_state:
    st.session_state.results = []
if "segments" not in st.session_state:
    st.session_state.segments = []
if "highlight_start" not in st.session_state:
    st.session_state.highlight_start = None

# ----------------------------
# Sidebar: uploads, health, search
# ----------------------------
with st.sidebar:
    st.header("Recent uploads")
    st.caption(f"Mode: {'Live' if API_BASE_URL else 'Mock'}")

    if API_BASE_URL:
        try:
            _ = http_get_json(ENDPOINTS["health"]())
            st.write("Health:", "✅ ok")
        except Exception:
            st.write("Health:", "❌ unreachable")

    c1, c2 = st.columns([1, 1])
    with c1:
        refresh = st.button("Refresh list")
    with c2:
        limit = st.number_input("Limit", min_value=1, max_value=100, value=20, step=1)

    try:
        uploads = list_uploads(limit=limit)
    except Exception as e:
        st.error(f"Failed to load uploads: {e}")
        uploads = []

    selected: Optional[Upload] = None
    if uploads:
        labels = [
            (
                f"{u.title or u.id} — "
                f"{(datetime.fromisoformat(u.created_at).strftime('%Y-%m-%d %H:%M') if u.created_at else '')}"
                f"{(' — '+u.device_id) if u.device_id else ''}"
            ) for u in uploads
        ]
        idx_default = 0
        if st.session_state.selected_id:
            try:
                idx_default = next(i for i, u in enumerate(uploads) if u.id == st.session_state.selected_id)
            except StopIteration:
                idx_default = 0
        choice = st.radio("Select upload", labels, index=idx_default, label_visibility="collapsed")
        selected = uploads[labels.index(choice)]
        st.session_state.selected_id = selected.id

    st.divider()
    st.subheader("Search")

    top_k = st.slider("Top K", min_value=1, max_value=50, value=10)
    mode = st.radio("Mode", ["Text (local)", "Embeddings (backend)"], horizontal=False)

    device_filter = st.text_input("device_id (optional)")
    t1, t2 = st.columns(2)
    with t1:
        ts_from = st.text_input("time_range start (sec, optional)")
    with t2:
        ts_to = st.text_input("time_range end (sec, optional)")

    limit_to_selected = st.toggle("Limit to selected file", value=True)

    text_query = ""
    qvec_b64 = ""
    if mode.startswith("Text"):
        text_query = st.text_input("Query", placeholder="Type phrase…")
    else:
        qvec_b64 = st.text_area(
            "Base64 Float32 q_vector",
            placeholder="Paste base64 of a Float32Array buffer",
            height=120,
        )

    if st.button("Search", use_container_width=True):
        st.session_state.results = []
        if not selected and limit_to_selected:
            st.warning("Select an upload first or disable 'Limit to selected file'.")
        else:
            try:
                time_range = None
                try:
                    if ts_from.strip() and ts_to.strip():
                        time_range = (float(ts_from), float(ts_to))
                except Exception:
                    st.warning("Invalid time_range values; ignoring.")

                if mode.startswith("Embeddings"):
                    if not (qvec_b64 or "").strip():
                        raise ValueError("Paste a base64 Float32 q_vector")
                    file_scope = selected.id if (limit_to_selected and selected) else None
                    hits = backend_embedding_search(
                        qvec_b64=(qvec_b64 or "").strip(),
                        top_k=int(top_k),
                        file_scope=file_scope,
                        device_id=(device_filter or None),
                        time_range=time_range,
                    )
                else:
                    if not selected:
                        raise ValueError("Local text search needs a selected file.")
                    segs = st.session_state.segments or get_transcript(selected)
                    st.session_state.segments = segs
                    hits = local_text_search(segs, text_query, selected.id, int(top_k))
                st.session_state.results = hits
            except Exception as e:
                st.error(f"Search failed: {e}")

# ----------------------------
# Main layout
# ----------------------------
container = st.container()
with container:
    c1, c2 = st.columns([1, 1])
    with c1:
        if st.session_state.selected_id:
            sel = next((u for u in (uploads or []) if u.id == st.session_state.selected_id), None)
            title = sel.title if sel and sel.title else (sel.id if sel else "Untitled Upload")
            st.subheader(title)
            meta_bits = []
            if sel and sel.created_at:
                meta_bits.append(f"Uploaded: {sel.created_at}")
            if sel and sel.device_id:
                meta_bits.append(f"device_id: {sel.device_id}")
            if sel and sel.kind:
                meta_bits.append(f"kind: {sel.kind}")
            if meta_bits:
                st.caption(" • ".join(meta_bits))
        else:
            st.subheader("No selection")

    with c2:
        st.markdown(
            f"<div style='text-align:right'><span class='pill'>{'Live' if API_BASE_URL else 'Mock'}</span></div>",
            unsafe_allow_html=True,
        )

    if st.session_state.selected_id:
        sel = next((u for u in uploads if u.id == st.session_state.selected_id), None)

        @st.cache_data(show_spinner=False)
        def _load_transcript_cached(vid: str):
            u = next((x for x in uploads if x.id == vid), None)
            if not u:
                return []
            return get_transcript(u)

        try:
            segments = _load_transcript_cached(st.session_state.selected_id)
            st.session_state.segments = segments
        except Exception as e:
            st.error(f"Failed to load transcript: {e}")
            segments = []

        start_ts = float(st.session_state.seek_time or 0.0)
        if sel and sel.media_url:
            media_player(sel.media_url, start=start_ts, kind=sel.kind)
        else:
            st.warning("No media_url for this file.")

        left, right = st.columns([1, 1])

        with left:
            st.markdown("### Results")
            hits = st.session_state.results or []
            if not hits:
                st.info("No results yet. Run a search from the sidebar.")
            else:
                for i, h in enumerate(hits):
                    label = f"{i+1}. {h.start:.2f}s – {h.end:.2f}s  (score {h.score:.3f})\n{h.text or ''}"
                    if st.button(label, key=f"hit_{i}_{h.start}", use_container_width=True):
                        st.session_state.seek_time = float(h.start)
                        st.session_state.highlight_start = float(h.start)
                        st.rerun()

        with right:
            st.markdown("### Transcript")
            if segments:
                hl = st.session_state.highlight_start
                for idx, s in enumerate(segments):
                    active = (hl is not None) and (abs(s.start - float(hl)) < 1e-3)
                    clz = "seg active" if active else "seg"
                    if st.button(
                        label=f"{s.start:.2f}s – {s.end:.2f}s\n{s.text}",
                        key=f"seg_{idx}_{s.start}",
                        use_container_width=True,
                    ):
                        st.session_state.seek_time = float(s.start)
                        st.session_state.highlight_start = float(s.start)
                        st.rerun()
                    st.markdown(
                        f"<div class='{clz}'>"
                        f"<div class='seg-time'>{s.start:.2f}–{s.end:.2f}</div>"
                        f"<div class='seg-text'>{s.text}</div>"
                        f"</div>",
                        unsafe_allow_html=True,
                    )
            else:
                st.info("Transcript is empty.")
    else:
        st.info("Select an upload from the sidebar to begin.")

# ----------------------------
# Footer: Dev helpers
# ----------------------------
with st.expander("ℹ️ Developer: API & payload inspector"):
    try:
        endpoints_preview = {
            "list_files": ENDPOINTS["list_files"]("X") if API_BASE_URL else "(mock)",
            "list_uploads": ENDPOINTS["list_uploads"]("X") if API_BASE_URL else "(mock)",
            "get_transcript": ENDPOINTS["get_transcript"]("FILE_ID") if API_BASE_URL else "(mock)",
            "query_embeddings": ENDPOINTS["query_embeddings"]() if API_BASE_URL else "(mock)",
            "health": ENDPOINTS["health"]() if API_BASE_URL else "(mock)",
        }
    except Exception:
        endpoints_preview = {}
    st.code({"API_BASE_URL": API_BASE_URL or "(mock mode)", "ENDPOINTS": endpoints_preview}, language="json")
    st.write("Selected upload id:", st.session_state.get("selected_id"))
    st.write("Seek time:", st.session_state.get("seek_time"))
    st.write("Results (top 5 shown):", [getattr(h, "__dict__", h) for h in (st.session_state.get("results") or [])[:5]])
