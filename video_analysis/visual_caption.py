# moviepy: extracts frames from the video.
# BLIP: generates scene-level captions for each frame.
# sentence-transformers: turns text into embeddings.
# faiss: allows fast similarity search between embeddings.

import os
import json
import torch
import faiss
import numpy as np
from PIL import Image
from tqdm import tqdm
from moviepy.video.io.VideoFileClip import VideoFileClip
from transformers import BlipProcessor, BlipForConditionalGeneration
from sentence_transformers import SentenceTransformer


VIDEO_PATH = "/content/test_clip.mp4"
FRAME_FOLDER = "frames"
CAPTIONS_FILE = "captions.json"
METADATA_FILE = "metadata.json"
INDEX_FILE = "faiss.index"
EMBED_MODEL = "all-MiniLM-L6-v2"
FPS = 0.1  # One frame every 10 seconds


def extract_frames(video_path, frame_folder, fps=1):
    os.makedirs(frame_folder, exist_ok=True)
    clip = VideoFileClip(video_path)
    print(
        f"Extracting ~{int(clip.duration * fps)} frames "
        f"at {fps} fps..."
    )
    for t, frame in enumerate(clip.iter_frames(fps=fps, dtype="uint8")):
        Image.fromarray(frame).save(f"{frame_folder}/frame_{t:04}.jpg")


def caption_frames(folder):
    processor = BlipProcessor.from_pretrained(
        "Salesforce/blip-image-captioning-base"
    )
    model = BlipForConditionalGeneration.from_pretrained(
        "Salesforce/blip-image-captioning-base"
    )
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model.to(device)

    captions = []
    for filename in tqdm(sorted(os.listdir(folder))):
        if filename.endswith(".jpg"):
            image = Image.open(os.path.join(folder, filename)).convert("RGB")
            inputs = processor(images=image, return_tensors="pt").to(device)
            out = model.generate(**inputs)
            caption = processor.decode(out[0], skip_special_tokens=True)
            captions.append(caption)
    return captions


def embed_and_index(captions):
    model = SentenceTransformer(EMBED_MODEL)
    embeddings = model.encode(captions)
    dim = embeddings.shape[1]

    index = faiss.IndexFlatL2(dim)
    index.add(np.array(embeddings))

    with open(METADATA_FILE, "w") as f:
        json.dump(captions, f)

    faiss.write_index(index, INDEX_FILE)

    print(
        f"Saved {len(captions)} visual chunks to "
        f"FAISS index + metadata."
    )


def main():
    extract_frames(VIDEO_PATH, FRAME_FOLDER, fps=FPS)

    if os.path.exists(CAPTIONS_FILE):
        with open(CAPTIONS_FILE, "r") as f:
            captions = json.load(f)
        print(f"Loaded cached captions ({len(captions)} frames)")
    else:
        print("Captioning frames...")
        captions = caption_frames(FRAME_FOLDER)
        with open(CAPTIONS_FILE, "w") as f:
            json.dump(captions, f)
        print(f"Saved captions to {CAPTIONS_FILE}")

    embed_and_index(captions)

    print(f"\n📼 Captions for {VIDEO_PATH}:")
    for i, cap in enumerate(captions):
        print(f"  Frame {i:02}: {cap}")


if __name__ == "__main__":
    main()
