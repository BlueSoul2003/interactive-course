with open('content/KSSR_Syllabus/Primary6/English/Revision1/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    
for i, line in enumerate(lines):
    if "function selectAnswer" in line:
        for j in range(i, i+40):
            print(f"{j+1}: {lines[j].rstrip()}")
        break
