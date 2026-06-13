import os
import shutil
import glob
import re

src_dir = os.path.expanduser(r"~\.gemini\antigravity\brain\508c3ce7-7856-4615-a66b-cf1eeb48ff4f")
dest_dir = os.path.join(os.path.dirname(__file__), "images")

os.makedirs(dest_dir, exist_ok=True)
files = glob.glob(os.path.join(src_dir, "silir_*.png"))

for f in files:
    filename = os.path.basename(f)
    match = re.match(r"(silir_.*)_\d+\.png", filename)
    if match:
        new_name = match.group(1) + ".png"
        shutil.copy2(f, os.path.join(dest_dir, new_name))
        print("Copied as:", new_name)
