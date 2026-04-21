import glob
import re

files = glob.glob('content/**/index.html', recursive=True)
fixed_count = 0

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        
    original = content
    
    # We are looking for the final window.addEventListener('load', ...) block near the end of the script.
    
    # 1. Regex to isolate the whole block up to </script>
    match = re.search(r"(window\.addEventListener\('load',.*?)(\s*</script>)", content, re.DOTALL)
    if not match:
        continue
        
    block = match.group(1)
    post_block = match.group(2)
    
    if "if (saved && saved)" not in block:
        continue
        
    print(f"Processing: {f}")
    
    # We want to extract two main parts from this block:
    # PART_PRE: Everything before the ProgressTracker stuff
    # PART_INNER: The code inside if (saved && saved) { ... }
    
    # Find start of ProgressTracker logic
    pt_idx = -1
    markers = ["if (typeof ProgressTracker", "if (window.ProgressTracker)", "ProgressTracker.init("]
    for m in markers:
        idx = block.find(m)
        if idx != -1:
            if pt_idx == -1 or idx < pt_idx:
                pt_idx = idx
                
    if pt_idx == -1:
        # Maybe it just has 'const saved = await tracker.load();'
        pt_idx = block.find('const saved = await tracker.load();')
        
    if pt_idx == -1:
        continue
        
    part_pre = block[block.find('{')+1:pt_idx].strip()
    
    # Now extract the inner part
    inner_start = block.find("if (saved && saved) {") + len("if (saved && saved) {")
    inner_text = block[inner_start:]
    
    # Clean up the inner text to remove all the premature closing braces / parens
    # It might end with `}); } };` or `} } };` etc.
    lines = inner_text.split('\n')
    clean_lines = []
    
    # Keep lines until we hit lines that are clearly closing the ProgressTracker / window.addEventListener block
    for line in lines:
        stripped = line.strip()
        # Any line that is just a variation of closing the block
        if stripped in ["});", "}", "};", "}); }", "} };", "} }", "}); } };"]:
            continue
        clean_lines.append(line)
        
    # Reconstruct inner inner logic
    part_inner = '\n'.join(clean_lines).rstrip()

    # Build the proper replacement!
    new_block = "window.addEventListener('load', function() {\n"
    if part_pre:
        for pre_line in part_pre.split('\n'):
            # maintain some spacing if possible, but simpler to just append
            if pre_line.strip():
                new_block += f"            {pre_line.strip()}\n"
                
    new_block += """            if (typeof ProgressTracker !== 'undefined') {
                ProgressTracker.init(async function(tracker) {
                    const saved = await tracker.load();
                    if (saved && saved) {"""
    new_block += "\n" + part_inner + "\n"
    new_block += """                    }
                });
            }
        });"""

    new_content = content[:match.start()] + new_block + post_block
    
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        fixed_count += 1
        print(" -> Fixed!")

print(f"Total fixed: {fixed_count}")
