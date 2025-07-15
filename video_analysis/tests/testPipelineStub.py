import os
import json
from visual_caption import extract_frames, caption_frames_llava, embed_and_index

def test_pipeline_works_with_stub(tmp_path):
    video_path = "test_clip.mp4"
    frame_folder = tmp_path / "frames"
    metadata_file = tmp_path / "metadata.json"
    index_file = tmp_path / "faiss.index"

    extract_frames(video_path, str(frame_folder), fps=0.1)
    captions = caption_frames_llava(str(frame_folder))

    # Ensure stub captions fallback works
    assert all(c.startswith("Stub caption") for c in captions)

    embed_and_index(captions)

    assert metadata_file.exists()
    assert index_file.exists()

    with open(metadata_file, "r") as f:
        meta = json.load(f)
    assert isinstance(meta, list)
    assert len(meta) == len(captions)
