// Account-bound cloud snapshots. See docs/MODULE_ACCESS_BOUNDARY.md for merge/conflict semantics.
(function(){
'use strict';
    const SUPABASE_URL = 'https://ycsixsyssbdovpmmhefz.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inljc2l4c3lzc2Jkb3ZwbW1oZWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTcyNTEsImV4cCI6MjA5MDk3MzI1MX0.5Ofa771ewzMip8mZaXA09B9O2HPF3ZGoTk3qGkdTkmE';
    const PROGRESS_TABLE = 'student_progress';

    // ── Get or create the Supabase client ────────────────────────────────────
    // Reuse the client from auth-access.js if already loaded, otherwise
    // create our own so this file can work standalone.
    function _getClient() {
        if (window.supabaseClient) return window.supabaseClient;
        if (window.supabase && window.supabase.createClient) {
            // Self-initialize if supabase-js CDN is loaded but client wasn't created yet
            window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            return window.supabaseClient;
        }
        return null;
    }

    // ── Read module config from the <script> tag ─────────────────────────────
    function _getModuleConfig() {
        // currentScript works during synchronous execution; fall back to data attr
        const tag = document.currentScript ||
            document.querySelector('script[data-module-id]');
        if (!tag) return null;
        return {
            id:   tag.dataset.moduleId   || null,
            name: tag.dataset.moduleName || tag.dataset.moduleId || 'Unknown Module',
            url:  tag.dataset.moduleUrl  || location.pathname
        };
    }

    // Cache the module config at parse time (currentScript only works here)
    const _moduleConfig = _getModuleConfig();

    // ── Get authenticated user ID ─────────────────────────────────────────────
    async function _getUserId() {
        const client = _getClient();
        if (!client) return null;
        try {
            const { data: { user }, error } = await client.auth.getUser();
            if (error || !user || user.is_anonymous) return null;
            return user.id;
        } catch (e) {
            return null;
        }
    }


    let version, owner, pending=null, timer=null, serial=Promise.resolve(), failed=null, outstanding=0, loadBlocked=false;
    const identity = _getUserId().then(id => { owner=id; return id; });
    let statusNode;
    function status(state,text){
        window.dispatchEvent(new CustomEvent('learning-save-status',{detail:{state,text}}));
        if(!_moduleConfig?.id||!document.body)return;
        if(!statusNode){
            statusNode=document.createElement('div');statusNode.setAttribute('role','status');
            statusNode.style.cssText='position:fixed;bottom:12px;right:12px;z-index:100;max-width:min(360px,90vw);padding:9px 13px;background:#302747;color:#fff;border-radius:10px;font:13px/1.5 system-ui;box-shadow:0 3px 18px #0002';
            document.body.append(statusNode);
        }
        statusNode.replaceChildren(document.createTextNode(text));
        if(state==='error'){
            const retry=document.createElement('button');retry.textContent='重试保存';retry.style.cssText='margin-left:8px;padding:3px 7px;cursor:pointer';
            retry.onclick=()=>{if(failed)ProgressTracker.save(failed)};statusNode.append(retry);
        }
    }
    function snapshot(data){
        if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Progress must be an object');
        return JSON.parse(JSON.stringify(data));
    }
    async function sameAccount(){const first=await identity;return first&&first===await _getUserId();}
    async function write(data){
        data={...(failed||{}),...data};
        if(loadBlocked){failed=data;status('conflict','云端记录未能载入。请重新打开课程后再保存。');return {saved:false};}
        if(!await sameAccount()){
            failed=owner?data:null;
            status(owner?'error':'guest',owner?'未保存：请检查连接，并使用原账号重新打开课程。':'访客模式：登录后重新打开课程，才能保存到云端。');
            return {saved:false};
        }
        const cfg=_moduleConfig,client=_getClient();if(!cfg?.id||!client)return {saved:false};
        try{
            status('saving','正在保存学习记录…');
            if(version===undefined){
                const {data:row,error}=await client.from(PROGRESS_TABLE).select('updated_at').eq('user_id',owner).eq('module_id',cfg.id).maybeSingle();
                if(error)throw error;version=row?.updated_at??null;
            }
            if(!await sameAccount())throw Error('account_changed');
            const {data:result,error}=await client.rpc('save_learning_progress',{p_module_id:cfg.id,p_module_name:cfg.name,p_module_url:cfg.url,p_data:data,p_expected_at:version});
            if(error)throw error;const row=Array.isArray(result)?result[0]:result;if(!row?.updated_at)throw Error('No save confirmation');
            version=row.updated_at;failed=null;status('saved','已保存到云端');return {saved:true};
        }catch(error){
            failed={...(failed||{}),...data};
            const conflict=error.code==='40001'||error.message==='progress_conflict';
            status(conflict?'conflict':'error',conflict?'另一页面已有新记录。请重新载入课程，避免覆盖。':'未保存到云端，请保持此页并重试。');
            return {saved:false,error};
        }
    }
    const ProgressTracker={
        init(callback){if(typeof callback==='function')identity.then(()=>callback(this)).catch(e=>console.error('[ProgressTracker] init:',e));},
        save(data){
            let copy;try{copy=snapshot(data)}catch(error){status('error','此课程的保存格式有误。');return Promise.resolve({saved:false,error})}
            // A manual save supersedes the timer without dropping pending fields.
            clearTimeout(timer);copy={...(failed||{}),...(pending||{}),...copy};pending=null;
            outstanding++;serial=serial.catch(()=>{}).then(()=>write(copy)).finally(()=>outstanding--);return serial;
        },
        autoSave(data,delayMs=2000){
            // A few legacy lessons used autoSave(moduleId, data).
            if(typeof data==='string'&&delayMs&&typeof delayMs==='object'){data=delayMs;delayMs=2000;}
            try{pending={...(pending||{}),...snapshot(data)}}catch(e){status('error','此课程的保存格式有误。');return;}
            status('pending','有更改等待保存…');clearTimeout(timer);
            timer=setTimeout(()=>{const next=pending;pending=null;if(next)this.save(next);},Math.max(0,Number(delayMs)||0));
        },
        async load(){
            if(!await sameAccount()||!_moduleConfig?.id)return null;
            try{
                const {data,error}=await _getClient().from(PROGRESS_TABLE).select('progress_data,updated_at').eq('user_id',owner).eq('module_id',_moduleConfig.id).maybeSingle();
                if(error)throw error;
                version=data?.updated_at??null;return data?.progress_data??null;
            }catch(error){loadBlocked=true;status('conflict','无法载入云端记录，请检查连接后重新打开课程。');return null;}
        },
        async getAllProgress(){
            const userId=await _getUserId();if(!userId)return [];
            const {data,error}=await _getClient().from(PROGRESS_TABLE).select('module_id,module_name,module_url,progress_data,updated_at').eq('user_id',userId).order('updated_at',{ascending:false});
            if(error)throw error;return data||[];
        },
        getAllProgressForStudent(){return this.getAllProgress()},
        setActiveStudent(){},getActiveStudent(){return null},clearActiveStudent(){}
    };
    window.addEventListener('beforeunload',event=>{if(pending||failed||outstanding){event.preventDefault();event.returnValue='';}});
    window.ProgressTracker=ProgressTracker;
})();
