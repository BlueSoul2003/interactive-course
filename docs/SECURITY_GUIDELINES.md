# 🛡️ Security Guidelines & Best Practices

在開發與維護本專案 (Interactive Course) 時，請務必遵守以下安全規範，以防止隱私外洩、敏感資料暴露以及系統被惡意竄改。

## 1. 隱私與個人資料保護 (PII)

* **絕對禁止寫死本地端路徑**：
  在編寫 Python 腳本或其他自動化工具時，**絕對不要**在程式碼中寫死包含你個人使用者名稱的絕對路徑（例如：`C:\Users\hong0\...`）。
  * ❌ **錯誤示範**：`ROOT = r"C:\Users\hong0\Desktop\interactive-course-main"`
  * ✅ **正確示範**：使用相對路徑或動態獲取路徑：
    ```python
    import os
    ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    ```
* **避免提交包含敏感設定的檔案**：
  確保 `.env`、個人憑證檔、或是包含本機測試資料的暫存檔不會被推送到 GitHub。

## 2. API 金鑰與 Supabase 憑證

本專案使用 Supabase 作為後端與資料庫。

* **Anon Key 算是安全的，但仍需謹慎**：
  目前專案在前端 (`js/auth-access.js`) 寫死了 `AUTH_SUPABASE_KEY` (Anon Key)。對於 Supabase 架構而言，只要資料庫的 **Row Level Security (RLS)** 設定夠嚴謹，Anon Key 暴露在前端是正常的（因為它只是用來識別匿名或已登入的客戶端）。
* **絕對禁止暴露 Service Role Key**：
  Supabase 的 `Service Role Key` 擁有繞過所有 RLS 權限的「上帝模式」。**這把金鑰絕對不能出現在前端程式碼中**。如果你未來需要寫後端 API，這把金鑰只能存放在後端伺服器的環境變數 (Environment Variables) 中。
* **定期檢查 RLS (Row Level Security) 政策**：
  每當你在 Supabase 新增 Table 時，請務必啟用 RLS，並確保 `SELECT`, `INSERT`, `UPDATE`, `DELETE` 權限有正確綁定使用者的 UUID（例如：用戶只能看到自己的 Profile 或 Progress）。

## 3. 版本控制與 Git 衛生

* **保持 `.gitignore` 更新**：
  請確保 `.gitignore` 檔案一直存在於專案根目錄，並包含所有不需要被追蹤的資料夾與檔案：
  * `node_modules/`
  * `.env`
  * `.DS_Store` (macOS 系統檔)
  * `*.log`
* **不小心提交敏感資料時的處理**：
  如果你不小心把密碼或 Service Role Key `git push` 到了公開的 GitHub 倉庫，**不要只是刪除代碼然後再 push** (因為歷史紀錄中還是看得到)。你應該：
  1. **立刻前往服務提供商 (如 Supabase) 撤銷/更換 (Rotate) 該金鑰。**
  2. 使用 BFG Repo-Cleaner 或 `git filter-repo` 來清除歷史紀錄。

## 4. 惡意輸入與 XSS 防護

* **慎防 HTML 注入**：
  由於本專案會動態生成 HTML（例如讀取 Markdown 轉換成 HTML），如果未來的 Markdown 內容允許外部使用者或學生上傳，必須進行過濾 (Sanitization) 防止 XSS（跨站指令碼攻擊）。
* **使用 `textContent` 而非 `innerHTML`**：
  在操作 DOM 顯示使用者輸入（如學生的名字、作答內容）時，請盡量使用 `.textContent` 或 `.innerText`，避免直接使用 `.innerHTML` 導致惡意腳本被執行。

## 5. 授權與 PIN 碼安全

* **PIN 碼管理**：
  目前解鎖模組的機制是依賴 Admin 生成的 PIN 碼。請確保生成 PIN 碼的 API (或 stored procedure `redeem_activation_pin`) 有正確的防爆破機制或嚴格的權限檢查，避免有心人士寫腳本暴力破解 PIN 碼。
* **確保解鎖邏輯在伺服器端驗證**：
  前端 UI 顯示「模組已解鎖」只能作為視覺效果，任何存取被鎖定內容的 API 請求，都必須在 Supabase RLS 政策中再次確認該使用者確實擁有該 `module_id` 的權限。
