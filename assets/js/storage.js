(function(){
const KEY='schoolImprovementV3State';
const DB_NAME='schoolImprovementV3Files';
const DB_VERSION=1;
const STORE='files';
const emptyState=()=>({
 version:APP_VERSION,
 settings:{...DEFAULT_SETTINGS},
 assessment:{},
 evidence:[],
 improvements:[],
 nafs:[],
 treatmentPlans:[],
 schoolPlans:[],
 sectionPlans:{guidance:{},activity:{},gifted:{},health:{}},
 operationalPlan:[],
 manualSwot:{strengths:[],weaknesses:[],opportunities:[],threats:[]},
 analysisHistory:[],
 professional:[],
 events:[],
 satisfaction:[],
 achievements:[],
 library:[]
});
function safeParse(v){try{return JSON.parse(v)}catch{return null}}
function mergeState(s){const base=emptyState(); if(!s)return base; return {...base,...s,settings:{...base.settings,...(s.settings||{})},sectionPlans:{...base.sectionPlans,...(s.sectionPlans||{})}}}
function loadState(){return mergeState(safeParse(localStorage.getItem(KEY)))}
let state=loadState();
function saveState(){state.version=APP_VERSION;localStorage.setItem(KEY,JSON.stringify(state));return state}
function setState(next){state=mergeState(next);saveState();return state}
function uid(prefix='id'){return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`}
function openDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,DB_VERSION);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'id'})};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function putFile(id,file){if(!file)return null;const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put({id,name:file.name,type:file.type,size:file.size,lastModified:file.lastModified,blob:file});tx.oncomplete=()=>{db.close();resolve(id)};tx.onerror=()=>{db.close();reject(tx.error)}})}
async function getFile(id){if(!id)return null;const db=await openDB();return new Promise((resolve,reject)=>{const req=db.transaction(STORE).objectStore(STORE).get(id);req.onsuccess=()=>{db.close();resolve(req.result||null)};req.onerror=()=>{db.close();reject(req.error)}})}
async function deleteFile(id){if(!id)return;const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(id);tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}})}
async function getAllFiles(){const db=await openDB();return new Promise((resolve,reject)=>{const req=db.transaction(STORE).objectStore(STORE).getAll();req.onsuccess=()=>{db.close();resolve(req.result||[])};req.onerror=()=>{db.close();reject(req.error)}})}
async function clearFiles(){const db=await openDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).clear();tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}})}
function fileToBase64(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(blob)})}
function dataUrlToBlob(dataUrl){const [meta,data]=dataUrl.split(',');const mime=(meta.match(/data:(.*?);/)||[])[1]||'application/octet-stream';const bin=atob(data);const arr=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);return new Blob([arr],{type:mime})}
async function buildBackup(){const files=await getAllFiles();const packed=[];for(const f of files){packed.push({id:f.id,name:f.name,type:f.type,size:f.size,lastModified:f.lastModified,data:await fileToBase64(f.blob)})}return {product:'school-improvement-v3',exportedAt:new Date().toISOString(),state,files:packed}}
async function restoreBackup(payload){if(!payload||payload.product!=='school-improvement-v3'||!payload.state)throw new Error('ملف النسخة الاحتياطية غير صالح');await clearFiles();for(const f of (payload.files||[])){const blob=dataUrlToBlob(f.data);const file=new File([blob],f.name||'file',{type:f.type||blob.type,lastModified:f.lastModified||Date.now()});await putFile(f.id,file)}setState(payload.state);return state}
async function resetAll(){localStorage.removeItem(KEY);await clearFiles();state=emptyState();saveState();return state}
window.Store={get state(){return state},save:saveState,setState,uid,putFile,getFile,deleteFile,getAllFiles,buildBackup,restoreBackup,resetAll};
})();
