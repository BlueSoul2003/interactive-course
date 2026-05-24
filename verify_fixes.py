import os
import re

content_dir = 'content'
results = []
for root, dirs, files in os.walk(content_dir):
    for fn in files:
        if fn != 'index.html':
            continue
        path = os.path.join(root, fn)
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            text = f.read()
        if 'progress-tracker.js' not in text:
            continue
        has_autosave = 'autoSave' in text or 'ProgressTracker.save(' in text
        has_load     = 'tracker.load' in text or 'ProgressTracker.load(' in text
        has_init     = 'ProgressTracker.init' in text
        has_cdn      = 'supabase-js@2' in text
        has_auth     = 'auth-access.js' in text
        mid_match    = re.search(r'data-module-id="([^"]+)"', text)
        mid          = mid_match.group(1) if mid_match else 'MISSING'
        results.append({
            'path': path.replace('content' + os.sep, '').replace(os.sep, '/'),
            'cdn': has_cdn,
            'auth': has_auth,
            'id': mid,
            'init': has_init,
            'autosave': has_autosave,
            'load': has_load,
        })

print(f"{'Module':<65} CDN  Auth Init Save Load  Module ID")
print('-' * 130)
for r in results:
    status = 'OK  ' if (r['cdn'] and r['auth'] and r['autosave']) else 'WARN'
    print(f"[{status}] {r['path']:<63} {str(r['cdn'])[0]:^4} {str(r['auth'])[0]:^4} {str(r['init'])[0]:^4} {str(r['autosave'])[0]:^4} {str(r['load'])[0]:^4}  {r['id']}")

print(f'\nTotal: {len(results)} modules with progress-tracker.js')
modules_with_save = [r for r in results if r['autosave']]
modules_without_save = [r for r in results if not r['autosave']]
print(f'Has save logic: {len(modules_with_save)}')
print(f'Missing save logic: {len(modules_without_save)}')
if modules_without_save:
    print('\nModules WITHOUT save logic:')
    for r in modules_without_save:
        print(f'  - {r["path"]}  (id={r["id"]})')
