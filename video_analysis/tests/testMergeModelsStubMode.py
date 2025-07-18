import subprocess
import json
import faiss
import os

def testMergeModelsStubMode(tmp_path):
    """
    Runs mergeModels.py with stub mode on a 10-second video at 8 FPS,
    expects exactly 80 stub captions and a valid FAISS index with 80 entries.
    """

    # Adjust these paths as needed
    test_video = "test_clip.mp4"
    output_folder = tmp_path / "frames"
    metadata_path = tmp_path / "metadata.json"
    index_path = tmp_path / "faiss.index"

    # Run the pipeline as a subprocess
    result = subprocess.run([
        "python", "mergeModels.py",
        "--video", test_video,
        "--model", "stub",
        "--fps", "8.0",
        "--output", str(output_folder)
    ], capture_output=True, text=True)

    assert result.returncode == 0, f"Script failed: {result.stderr}"

    # Check metadata.json exists and has 80 captions
    assert os.path.exists("metadata.json"), "metadata.json not found"
    with open("metadata.json") as f:
        captions = json.load(f)
    assert isinstance(captions, list)
    assert len(captions) == 80, f"Expected 80 captions, got {len(captions)}"
    assert all(c.startswith("Stub caption") for c in captions)

    # Check faiss.index exists and contains 80 vectors
    assert os.path.exists("faiss.index"), "faiss.index not found"
    index = faiss.read_index("faiss.index")
    assert index.ntotal == 80, f"FAISS index contains {index.ntotal} vectors, expected 80"
