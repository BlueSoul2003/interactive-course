
# ⚡ 終極全自動備課工作流 (The Ultimate Lesson Prep SOP)

**目標：** 在 15 分鐘內完成「講義提取 -> 互動網頁開發 -> 考卷生成 -> 網站部署」。

**核心邏輯 (First Principles)：** 先備齊所有材料（講義 PDF、考卷 PDF、網頁草稿），再讓 Python 腳本一次性封裝與部署。

### 🟢 步驟 1：萃取知識本質 (NotebookLM)

*把原始的課本、PDF 講義丟進 NotebookLM，萃取核心知識。*

1. 在 NotebookLM 輸入 **「The LaTeX Handout Generator」** 提示詞（強制輸出 LaTeX 格式的講義）。
2. 讓它幫你把冗長的課文，總結成帶有 `\vspace{}` 留白和 `amsmath` 數學公式的完整 LaTeX 程式碼。
3. **[Action]** 將代碼貼到 VSCode (配合 LaTeX Workshop 擴充) 或 Overleaf 中，編譯成專業的 PDF 講義（例如命名為 `handout.pdf`）。

### 🟢 步驟 2：規劃與生成互動網頁 (AI Stage 1 & 2)

*打開 Gemini 或 Antigravity (Cursor) 的聊天視窗。*

1. **[Stage 1]** 貼上剛才的筆記內容與 **「STAGE 1」** 提示詞，讓 AI 提案互動模組。
2. **[Stage 2]** 確認模組後，貼上 **「STAGE 2」** 提示詞，命令 AI 寫出單一檔案的 HTML5 模擬器。
3. **[Action]** 確認代碼 `<head>` 裡有自動生成的 `<meta>` 標籤，然後將整段代碼存成 `draft.html`。

### 🟢 步驟 3：生成專業實體考卷 (AI Stage 3)

*訓練學生的應試耐力與大腦肌肉記憶。*

1. 繼續在 AI 視窗，貼上 **「STAGE 3 (The LaTeX Exam Architect)」** 提示詞。
2. 告知 AI 考試時間和格式（例如：「30分鐘，SPM 格式」）。
3. AI 會生成一份使用 `exam` document class 的完整 LaTeX 考卷程式碼。
4. **[Action]** 將代碼編譯成 PDF（例如命名為 `exam.pdf`）。記得打開剛才的網頁模擬器截圖，替換掉題目中的 `[Insert screenshot]` 佔位符。

### 🟢 步驟 4：打包準備 (The Waiting Room)

*【關鍵步驟】確保所有材料都在「等待區」，讓腳本能一次抓取。*

1. **[Action]** 將準備好的  **`draft.html`** 、**`handout.pdf`** 和 **`exam.pdf`** 這三個檔案，同時丟進專案根目錄的 `_drafts` 資料夾中。

### 🟢 步驟 5：一鍵自動化部署 (Python Automator)

*交給腳本處理所有繁瑣的路由、路徑與資料庫串接。*

1. 在 Antigravity 中打開終端機 (Terminal)。
2. 輸入指令：`python module_automator_v2.py`
3. 腳本會問你：「🤖 發現 AI 建議標題/路徑，是否使用？(Y/n)」。
4. **[Action]** 敲擊 `Y` 和 `Enter`。腳本會瞬間處理完畢，更新你的主頁 (Grand Landing Page)。

### 📦 附註：Python 到底幫你打包了什麼？

執行完步驟 5 後，Python 腳本已經自動為你建立了一個完美的「教育軟體包」，結構如下：

```
content/SPM_Syllabus/Form5/Physics/Electromagnetism_01/  <-- (🔥 Python 自動建立的新模組資料夾)
  ├── index.html        <-- (原本的 draft.html，已被注入 🏠Home按鈕 與 📡Supabase進度追蹤碼)
  ├── handout.pdf       <-- (你的 LaTeX 講義，已被自動移入)
  └── exam.pdf          <-- (你的 LaTeX 考卷，已被自動移入)

```

*(同時，腳本已經在你的 Grand Landing Page 上新增了一張課程卡片，並自動附上了這兩個 PDF 的完美下載連結！)*

### 🟢 步驟 6：安全檢查與發布上線 (Git Deploy)

*作為實驗物理學家的最後確認。*

1. 在終端機輸入 `git diff index.html`，檢查主頁的卡片和下載連結是不是完美加進去了。
2. 確認無誤後，執行發布三連擊：
   * `git add .`
   * `git commit -m "Add new interactive module and LaTeX resources"`
   * `git push origin main`
3. **[Action]** 搞定收工！去喝杯咖啡，或繼續弄你的 3D 列印機。

💡 **核心心法 (First Principles of this workflow):** **「先備齊所有料，再一鍵下鍋。」** 絕對不要跳過 Stage 1 規劃，且一定要等 PDF 都編譯好再執行 Python 腳本，這樣你的自動化系統才能發揮 100% 的威力。
