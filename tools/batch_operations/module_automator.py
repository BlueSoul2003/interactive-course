import os
import shutil
import re
from pathlib import Path

# ==========================================
# 🚀 AUTOMATIC MODULE INTEGRATOR 2.0 (AI-Powered)
# ==========================================

def extract_ai_metadata(html_content):
    """從 HTML 中自動提取 AI 生成的 meta 標籤"""
    path = re.search(r'<meta\s+name="ai-path"\s+content="([^"]+)">', html_content, re.I)
    folder = re.search(r'<meta\s+name="ai-folder"\s+content="([^"]+)">', html_content, re.I)
    title = re.search(r'<meta\s+name="ai-title"\s+content="([^"]+)">', html_content, re.I)
    desc = re.search(r'<meta\s+name="ai-desc"\s+content="([^"]+)">', html_content, re.I)

    return {
        "path": path.group(1).strip() if path else None,
        "folder": folder.group(1).strip() if folder else None,
        "title": title.group(1).strip() if title else None,
        "desc": desc.group(1).strip() if desc else None
    }

def main():
    print("🧪 Interactive Course Module Automator v2.0")
    print("-" * 50)
    
    base_dir = Path.cwd()
    drafts_dir = base_dir / "_drafts"
    root_index = base_dir / "index.html"
    
    if not drafts_dir.exists():
        print("❌ Error: '_drafts' folder not found. Please create it.")
        return
        
    html_files = list(drafts_dir.glob("*.html"))
    pdf_files = list(drafts_dir.glob("*.pdf"))
    
    if not html_files:
        print("❌ Error: No HTML file found in '_drafts'. Please put your generated code there.")
        return
        
    draft_html = html_files[0]
    
    # 讀取 HTML 內容
    with open(draft_html, "r", encoding="utf-8") as f:
        html_content = f.read()

    # 1. 嘗試讓 AI 自動提取資訊
    print("🤖 正在掃描 AI 建議的命名與路徑...")
    ai_meta = extract_ai_metadata(html_content)
    
    # 2. 決定參數 (如果 AI 有建議，詢問用戶是否使用；否則手動輸入)
    if all(ai_meta.values()):
        print(f"\n✨ 發現 AI 建議配置：")
        print(f"   📂 路徑 (Path):   {ai_meta['path']}")
        print(f"   📁 資料夾 (Folder): {ai_meta['folder']}")
        print(f"   🏷️ 標題 (Title):   {ai_meta['title']}")
        print(f"   📝 描述 (Desc):    {ai_meta['desc']}")
        
        use_ai = input("\n👉 是否使用上述 AI 建議？ (Y/n): ").strip().lower()
        if use_ai == 'n':
            subject_path = input("Enter Syllabus Path: ").strip()
            topic_folder = input("Enter Topic Folder Name: ").strip()
            module_title = input("Enter Display Title: ").strip()
            module_desc = input("Enter Short Description: ").strip()
        else:
            subject_path = ai_meta['path']
            topic_folder = ai_meta['folder']
            module_title = ai_meta['title']
            module_desc = ai_meta['desc']
    else:
        print("⚠️ 未檢測到 AI 完整的 meta 標籤，請手動輸入：")
        subject_path = input("Enter Syllabus Path (e.g., SPM_Syllabus/Form5/BM): ").strip()
        topic_folder = input("Enter Topic Folder Name (e.g., Kesalahan_Ejaan): ").strip()
        module_title = input("Enter Display Title: ").strip()
        module_desc = input("Enter Short Description: ").strip()

    module_id = f"{subject_path.split('/')[-1]}_{topic_folder}".replace(" ", "_")
    target_dir = base_dir / "content" / subject_path / topic_folder
    
    # 建立目錄
    target_dir.mkdir(parents=True, exist_ok=True)
    depth = len(Path("content" + "/" + subject_path + "/" + topic_folder).parts)
    rel_path_to_root = "../" * depth
    
    # 注入 Home 按鈕
    home_btn = f'\n<a href="{rel_path_to_root}index.html" class="home-btn" style="position: fixed; top: 20px; left: 20px; z-index: 1000; text-decoration: none; font-size: 24px;">🏠</a>\n'
    html_content = re.sub(r'(<body[^>]*>)', r'\1' + home_btn, html_content, count=1, flags=re.IGNORECASE)
    
    # 注入 SDK
    sdk_script = f"""
    <!-- Auto-Injected SDK -->
    <script src="{rel_path_to_root}js/progress-tracker.js"
            data-module-id="{module_id}"
            data-module-name="{module_title}"
            data-module-url="content/{subject_path}/{topic_folder}/index.html">
    </script>
    <script>
        window.addEventListener('load', async () => {{
            if(typeof ProgressTracker !== 'undefined') {{
                const saved = await ProgressTracker.load();
                if (saved && saved.progress_data) {{
                    console.log("Progress loaded", saved.progress_data);
                }}
            }}
        }});
    </script>
</body>"""
    html_content = re.sub(r'</body>', sdk_script, html_content, flags=re.IGNORECASE)
    
    # 儲存新的 index.html
    new_index_path = target_dir / "index.html"
    with open(new_index_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    
    # 移動 PDF
    pdf_links_html = ""
    for pdf in pdf_files:
        shutil.move(str(pdf), str(target_dir / pdf.name))
        pdf_links_html += f'\n      <a href="content/{subject_path}/{topic_folder}/{pdf.name}" download style="display:block; font-size:14px; margin-top:5px;">📥 Download {pdf.stem}</a>'

    os.remove(draft_html)
    
    # 更新主頁
    new_card = f"""
    <!-- Module: {module_title} -->
    <div class="module-card" style="border:1px solid #ccc; padding:15px; border-radius:8px; margin-bottom:15px;">
       <a href="content/{subject_path}/{topic_folder}/index.html" style="text-decoration:none; color:inherit;">
          <h3>{module_title}</h3>
          <p>{module_desc}</p>
       </a>
       <div class="resource-links" style="margin-top: 10px;">{pdf_links_html}
       </div>
    </div>
    <!-- MODULES_INSERTION_POINT -->"""

    if root_index.exists():
        with open(root_index, "r", encoding="utf-8") as f:
            root_content = f.read()
        
        if "<!-- MODULES_INSERTION_POINT -->" in root_content:
            root_content = root_content.replace("<!-- MODULES_INSERTION_POINT -->", new_card)
            with open(root_index, "w", encoding="utf-8") as f:
                f.write(root_content)
            print("✅ Grand Landing Page updated.")
        else:
            print("⚠️ 未找到 <!-- MODULES_INSERTION_POINT -->，請手動將以下代碼貼入主頁：\n" + new_card)

    print("-" * 50)
    print(f"🎉 成功！模組 '{module_title}' 已自動化部署。")
    print(f"📂 存放位置: {target_dir}")

if __name__ == "__main__":
    main()