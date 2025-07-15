# moviepy: extracts frames from the video.
# Llava: generates detailed captions for each frame.
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
from transformers import AutoProcessor, LlavaForConditionalGeneration
from sentence_transformers import SentenceTransformer


VIDEO_PATH = "test_clip.mp4"
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


def caption_frames_llava(folder):
    try:
        processor = AutoProcessor.from_pretrained("llava-hf/llava-1.5-7b-hf")
        model = LlavaForConditionalGeneration.from_pretrained(
            "llava-hf/llava-1.5-7b-hf",
            torch_dtype=torch.float16,
            low_cpu_mem_usage=True,
            device_map="auto"
        )
        model.eval()
    except Exception as e:
        print(f"⚠️  Failed to load Llava model, using stub captions. Error: {e}")
        return [f"Stub caption for {fname}" for fname in sorted(os.listdir(folder)) if fname.endswith(".jpg")]

    captions = []
    for filename in tqdm(sorted(os.listdir(folder))):
        if filename.endswith(".jpg"):
            image = Image.open(os.path.join(folder, filename)).convert("RGB")
            prompt = "<image>\nDescribe this image in detail.\n"
            inputs = processor(
                text=prompt,
                images=image,
                return_tensors="pt"
            ).to(model.device)

            with torch.no_grad():
                output = model.generate(**inputs, max_new_tokens=64)

            caption = processor.decode(output[0], skip_special_tokens=True)
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
        f"Saved {len(captions)} visual chunks "
        f"to FAISS index + metadata."
    )


def main():
    extract_frames(VIDEO_PATH, FRAME_FOLDER, fps=FPS)

    if os.path.exists(CAPTIONS_FILE):
        with open(CAPTIONS_FILE, "r") as f:
            captions = json.load(f)
        print(f"Loaded cached captions ({len(captions)} frames)")
    else:
        print("Captioning frames...")
        captions = caption_frames_llava(FRAME_FOLDER)
        with open(CAPTIONS_FILE, "w") as f:
            json.dump(captions, f)
        print(f"Saved captions to {CAPTIONS_FILE}")

    embed_and_index(captions)

    print(f"\nCaptions for {VIDEO_PATH}:")
    for i, cap in enumerate(captions):
        print(f"  Frame {i:02}: {cap}")


if __name__ == "__main__":
    main()
