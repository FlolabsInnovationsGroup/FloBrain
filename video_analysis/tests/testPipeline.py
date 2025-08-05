# testPipelineStub.py
from mergeModels import (extract_frames,caption_frames_stub, caption_frames_blip, caption_frames_llava,
embed_and_index)
import json


def test_stub_captioning_pipeline(tmp_path):
    frame_folder = tmp_path / "frames"
    metadata_file = tmp_path / "metadata.json"
    index_file = tmp_path / "faiss.index"

    extract_frames("test_clip.mp4", str(frame_folder), fps=0.1)
    captions = caption_frames_stub(str(frame_folder))
    assert all("Stub caption" in c for c in captions)

    embed_and_index(
        captions,
        embed_model="all-MiniLM-L6-v2",
        metadata_path=str(metadata_file),
        index_path=str(index_file),
    )

    assert metadata_file.exists()
    assert index_file.exists()


def test_blip_captioning_pipeline(tmp_path):
    frame_folder = tmp_path / "frames"
    metadata_file = tmp_path / "metadata.json"
    index_file = tmp_path / "faiss.index"

    extract_frames("test_clip.mp4", str(frame_folder), fps=0.1)
    captions = caption_frames_blip(str(frame_folder))
    assert all(isinstance(c, str) and len(c) > 5 for c in captions)

    embed_and_index(
        captions,
        embed_model="all-MiniLM-L6-v2",
        metadata_path=str(metadata_file),
        index_path=str(index_file),
    )

    assert metadata_file.exists()
    assert index_file.exists()


def test_llava_captioning_pipeline(tmp_path):
    frame_folder = tmp_path / "frames"
    metadata_file = tmp_path / "metadata.json"
    index_file = tmp_path / "faiss.index"

    extract_frames("test_clip.mp4", str(frame_folder), fps=0.1)
    captions = caption_frames_llava(str(frame_folder))

    # Either real or fallback
    assert all(isinstance(c, str) for c in captions)

    embed_and_index(
        captions,
        embed_model="all-MiniLM-L6-v2",
        metadata_path=str(metadata_file),
        index_path=str(index_file),
    )

    assert metadata_file.exists()
    assert index_file.exists()
