with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "kssr-p6-en-revision1" in line or "kssr-p6-en-revision2" in line:
        start = max(0, i-5)
        end = min(len(lines), i+15)
        print("--- Line {} ---".format(i))
        for j in range(start, end):
            print(f"{j+1}: {lines[j].rstrip()}")
