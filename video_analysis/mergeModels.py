import os
import json
import torch
import faiss
import argparse
import numpy as np
from PIL import Image
from tqdm import tqdm
from moviepy.video.io.VideoFileClip import VideoFileClip
from sentence_transformers import SentenceTransformer
from transformers import (
    AutoProcessor,
    LlavaForConditionalGeneration,
    BlipProcessor,
    BlipForConditionalGeneration,
)


def extract_frames(video_path, frame_folder, fps):
    os.makedirs(frame_folder, exist_ok=True)
    clip = VideoFileClip(video_path)
    print(
        f"Extracting ~{int(clip.duration * fps)} frames "
        f"at {fps} fps..."
    )
    for t, frame in enumerate(clip.iter_frames(fps=fps, dtype="uint8")):
        Image.fromarray(frame).save(f"{frame_folder}/frame_{t:04}.jpg")


def caption_frames_stub(folder):
    return [
        f"Stub caption for {filename}"
        for filename in sorted(os.listdir(folder))
        if filename.endswith(".jpg")
    ]


def caption_frames_blip(folder):
    processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
    model = BlipForConditionalGeneration.from_pretrained(
        "Salesforce/blip-image-captioning-base"
    ).eval()
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


def caption_frames_llava(folder):
    try:
        processor = AutoProcessor.from_pretrained("llava-hf/llava-1.5-7b-hf")
        model = LlavaForConditionalGeneration.from_pretrained(
            "llava-hf/llava-1.5-7b-hf",
            torch_dtype=torch.float16,
            low_cpu_mem_usage=True,
            device_map="auto"
        ).eval()
    except Exception as e:
        print(f"⚠️ Llava failed, falling back to stub. Error: {e}")
        return caption_frames_stub(folder)

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


def embed_and_index(captions, embed_model, metadata_path, index_path):
    model = SentenceTransformer(embed_model)
    embeddings = model.encode(captions)
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(embeddings))
    with open(metadata_path, "w") as f:
        json.dump(captions, f)
    faiss.write_index(index, index_path)
    print(
        f"Saved {len(captions)} visual chunks "
        f"to FAISS index + metadata."
    )


def main():
    parser = argparse.ArgumentParser(description="Build FAISS index from video")
    parser.add_argument("--video", type=str, default="test_clip.mp4")
    parser.add_argument("--model", type=str, choices=["blip", "llava", "stub"], default="stub")
    parser.add_argument("--fps", type=float, default=0.1)
    parser.add_argument("--output", type=str, default="frames")
    args = parser.parse_args()

    extract_frames(args.video, args.output, args.fps)

    if args.model == "blip":
        captions = caption_frames_blip(args.output)
    elif args.model == "llava":
        captions = caption_frames_llava(args.output)
    else:
        captions = caption_frames_stub(args.output)

    embed_and_index(
        captions,
        embed_model="all-MiniLM-L6-v2",
        metadata_path="metadata.json",
        index_path="faiss.index"
    )


if __name__ == "__main__":
    main()
