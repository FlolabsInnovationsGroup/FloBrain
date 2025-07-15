import os
import shutil
from visual_caption import extract_frames

def test_extract_frames_creates_images(tmp_path):
    video_path = "test_clip.mp4"
    frame_folder = tmp_path / "frames"
    
    # Use a very short test clip or generate one beforehand
    assert os.path.exists(video_path), "Missing test video."

    extract_frames(video_path, str(frame_folder), fps=0.5)
    
    files = list(frame_folder.glob("*.jpg"))
    assert len(files) > 0, "No frames extracted."
