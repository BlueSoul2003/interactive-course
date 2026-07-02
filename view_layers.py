import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

def print_layer(layer_id):
    print(f"\n--- Layer: {layer_id} ---")
    match = re.search(f'(<div id="{layer_id}" class="view-layer(?:[^"]*)">.*?)<!-- LAYER', content, flags=re.DOTALL)
    if not match:
        match = re.search(f'(<div id="{layer_id}" class="view-layer(?:[^"]*)">.*?)</div>\s*</div>\s*<script', content, flags=re.DOTALL)
    if match:
        print(match.group(1)[:1500] + "\n...[truncated]...")
    else:
        print("Not found")

print_layer("kssr-english")
print_layer("kssr-english-y3")
print_layer("kssr-english-y6")
