from bs4 import BeautifulSoup
import subprocess
import tempfile
import os

with open('content/KSSR_Syllabus/Primary6/English/Revision1/index.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

scripts = soup.find_all('script')

for i, script in enumerate(scripts):
    if not script.string:
        continue
    js_code = script.string.strip()
    if not js_code:
        continue
        
    fd, temp_path = tempfile.mkstemp(suffix='.js')
    with os.fdopen(fd, 'w', encoding='utf-8') as temp_file:
        temp_file.write(js_code)
    
    print(f"--- Checking Script block {i+1} ---")
    result = subprocess.run(['node', '-c', temp_path], capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error in block {i+1}:")
        print(result.stderr)
    else:
        print("Syntax OK")
        
    os.remove(temp_path)
