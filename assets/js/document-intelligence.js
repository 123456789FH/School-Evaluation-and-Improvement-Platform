(function(){
'use strict';
const MAX_TEXT=180000;
const STOP=new Set('في من على الى إلى عن او أو و ثم مع لدى عند بما بما التي الذي الذين المدرسة المتعلمين المتعلم منسوبيها جميع بشكل بانتظام وفق بما لدى نحو يتم يتمثل تحقيق تحقق'.split(/\s+/));
const enc=new TextDecoder('utf-8',{fatal:false});
const latin=new TextDecoder('latin1',{fatal:false});
function clamp(v,a=0,b=100){return Math.max(a,Math.min(b,v))}
function norm(v=''){return String(v).toLowerCase().replace(/[أإآ]/g,'ا').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[ـًٌٍَُِّْ]/g,'').replace(/[^\u0600-\u06ff0-9a-zA-Z%\s]/g,' ').replace(/\s+/g,' ').trim()}
function tokens(v=''){return norm(v).split(/\s+/).filter(x=>x.length>2&&!STOP.has(x)).map(x=>x.startsWith('ال')&&x.length>4?x.slice(2):x).filter(x=>x.length>2&&!['مدرسه','متعلمين','متعلم','منسوبيها'].includes(x))}
function unique(a){return [...new Set(a.filter(Boolean))]}
function tokenCoverage(query,text){const q=unique(tokens(query)),arr=tokens(text),s=new Set(arr);if(!q.length)return 0;const eq=(x,t)=>x===t||x==='و'+t||x==='ف'+t||t==='و'+x||t==='ف'+x||x.startsWith(t)||t.startsWith(x);let hit=0;q.forEach(t=>{if(s.has(t)||arr.some(x=>eq(x,t)))hit++});return hit/q.length*100}
function hasAny(text,arr){const n=norm(text);return arr.some(x=>n.includes(norm(x)))}
function context(id){for(const d of (window.SCHOOL_STANDARDS_2026||[]))for(const s of d.standards)for(const i of s.indicators)if(i.id===id)return{indicator:i,domain:d,standard:s};return null}
function allIndicators(){const type=window.Store?.state?.settings?.schoolType||'government';const out=[];for(const d of (window.SCHOOL_STANDARDS_2026||[]))for(const s of d.standards)for(const i of s.indicators){if(i.appliesTo==='private'&&type==='government')continue;out.push({...i,domainTitle:d.title,standardTitle:s.title})}return out}

const OVERRIDES={
 '1_1_1_1':[
  ['وجود خطة تشغيلية موثقة',['خطة تشغيلية','الخطة التشغيلية']],
  ['ارتباط الخطة بتحليل الواقع والاحتياجات',['تحليل الواقع','الاحتياجات','تشخيص الواقع']],
  ['أهداف تطويرية محددة وقابلة للقياس',['اهداف تطويرية','قابلة للقياس','مستهدف']],
  ['مؤشرات أداء واضحة لقياس تحقق الأهداف',['مؤشرات الاداء','مؤشر اداء','kpi']],
  ['أدوار ومسؤوليات محددة',['ادوار','مسؤوليات','المسؤول']],
  ['برامج أو مبادرات مرتبطة بجدول زمني',['برامج','مبادرات','جدول زمني','المدة']]
 ],
 '1_1_1_2':[
  ['متابعة تنفيذ الخطة وفق الجدول الزمني',['متابعة','الخطة الزمنية','الجدول الزمني']],
  ['قياس مؤشرات الأداء والنتائج',['مؤشرات الاداء','نتائج','نسبة الانجاز']],
  ['رصد تحديات التنفيذ ومعالجتها',['تحديات','مشكلات','حلول','بدائل']],
  ['تقويم الخطة ومراجعة فاعليتها',['تقييم الخطة','تقويم الخطة','مراجعة']],
  ['تحديث الخطة أو تطويرها بناء على النتائج',['تحديث الخطة','تطوير الخطة','بناء على النتائج']]
 ],
 '1_4_1_5':[
  ['تحليل الاحتياجات المهنية لمنسوبي المدرسة',['احتياجات تدريبية','تحليل الاحتياج','الاحتياجات المهنية']],
  ['خطة تطوير مهني مرتبطة بالاحتياج',['خطة التطوير المهني','خطة تدريبية']],
  ['تنوع أساليب التطوير المهني',['دورات','ورش','زيارات تبادلية','حصص تطبيقية','مجتمعات التعلم']],
  ['توثيق التنفيذ والمشاركة',['تنفيذ','حضور','مستفيدين','مشاركة']],
  ['قياس أثر التطوير في الممارسة أو الأداء',['قياس الاثر','اثر التدريب','قبلي','بعدي']],
  ['متابعة مستمرة وتطوير للخطة',['متابعة','تطوير الخطة','نتائج المتابعة']]
 ],
 '1_4_1_6':[
  ['تطبيق التقويم الذاتي وفق المعايير',['التقويم الذاتي','المعايير','التقييم الذاتي']],
  ['وجود فريق أو مسؤوليات واضحة للتقويم',['فريق التقويم','مسؤوليات','فريق التقييم']],
  ['جمع أدلة وشواهد مرتبطة بالمؤشرات',['شواهد','ادلة','المؤشرات']],
  ['تحليل النتائج وتحديد القوة وفرص التحسين',['نقاط القوة','فرص التحسين','تحليل النتائج']],
  ['مشاركة المجتمع المدرسي في العملية أو النتائج',['المعلمين','الطلاب','اولياء الامور','المجتمع المدرسي']]
 ],
 '1_4_1_7':[
  ['بناء الخطة من نتائج التقويم المدرسي',['نتائج التقويم','التقييم الذاتي','التقويم الذاتي']],
  ['تحديد الأولويات والفجوات',['اولويات','فجوات','فرص التحسين']],
  ['إجراءات واضحة ومسؤوليات وزمن للتنفيذ',['اجراءات','مسؤول','مدة','زمن']],
  ['مؤشرات إنجاز ومستهدفات قابلة للقياس',['مؤشر الانجاز','مؤشرات الاداء','مستهدف']],
  ['متابعة التنفيذ ومعالجة التعثر',['متابعة','تعثر','تحديات','حلول']],
  ['قياس أثر التحسين قبل وبعد',['قياس الاثر','قبلي','بعدي','نتيجة']]
 ],
 '2_2_1_3':[
  ['وجود نتائج تقويم قابلة للتحليل',['نتائج التقويم','نتائج الاختبارات','النتائج']],
  ['تحليل الفجوات ومواطن القوة والضعف',['تحليل','فجوة','نقاط القوة','الضعف']],
  ['تحديد أسباب قابلة للتدخل',['اسباب','سبب جذري','تشخيص']],
  ['تحويل النتائج إلى خطط علاجية أو إثرائية',['خطة علاجية','خطط علاجية','اثراء']],
  ['متابعة تنفيذ التدخلات',['متابعة','تنفيذ الخطة']],
  ['قياس التحسن بعد التدخل',['بعدي','قياس الاثر','تحسن','مقارنة']]
 ],
 '4_2_1_1':[
  ['توثيق استيفاء متطلبات الأمن والسلامة',['الامن والسلامة','تقرير السلامة','اشتراطات السلامة']],
  ['جاهزية وسائل وخطط الاستجابة والإخلاء',['اخلاء','طفايات','مخارج الطوارئ','خطة الطوارئ']],
  ['متابعة دورية للصلاحية والجاهزية',['فحص دوري','متابعة','صلاحية','صيانة']],
  ['مراعاة احتياجات جميع المتعلمين',['ذوي الاعاقة','اتاحة','احتياجات المتعلمين']],
  ['توعية المجتمع المدرسي بالمخاطر والإجراءات',['توعية','تدريب','تعليمات السلامة']]
 ]
};
function requirement(label,keywords,weight=1,kind='content'){return{id:'r_'+Math.random().toString(36).slice(2,8),label,keywords:unique(keywords),weight,kind}}
function verificationMatrix(ind){
 const fixed=OVERRIDES[ind.id];
 if(fixed)return fixed.map(x=>requirement(x[0],x[1],1.15));
 const n=norm(ind.text),out=[];
 out.push(requirement('وجود دليل مباشر يطابق مضمون المؤشر',unique(tokens(ind.text).slice(0,8)),1.3,'relevance'));
 if(/خطه|خطة/.test(n))out.push(requirement('وجود خطة أو إطار عمل واضح',['خطة','اهداف','اجراءات','مسؤوليات','زمن'],1.1));
 if(/تنفذ|تطبق|تفعل|تعزز|تنمي|تدعم|توفر|تتيح/.test(n))out.push(requirement('توثيق التنفيذ أو التطبيق الفعلي',['تنفيذ','تطبيق','برنامج','نشاط','اجراء','سجل'],1));
 if(/تتابع|متابعه|باستمرار|بانتظام|دوري/.test(n))out.push(requirement('وجود متابعة دورية موثقة',['متابعة','دوري','تقدم','محضر','تقرير متابعة','سجل متابعة'],1.1));
 if(/تحلل|نتائج|يحقق|تقدم|تقويم|تقييم/.test(n))out.push(requirement('وجود نتائج أو بيانات قابلة للتحليل',['نتائج','نسبة','بيانات','تحليل','مقارنة','مؤشر'],1.05));
 if(/تحسن|تطوير|تطور|علاجي|اثر|أثر/.test(n))out.push(requirement('وجود إجراء تحسين أو قياس أثر',['تحسين','تطوير','قياس الاثر','قبلي','بعدي','مستهدف'],1));
 if(/اسره|الأسرة|المجتمع|مشاركه|شراكه/.test(n))out.push(requirement('إثبات المشاركة أو التواصل مع الفئة المستهدفة',['مشاركة','تواصل','حضور','شراكة','مستفيدين','استبانة'],1));
 if(/امن|سلامه|صيانة|نظافه|مبنى|مرافق/.test(n))out.push(requirement('إثبات الجاهزية والمتابعة الميدانية',['فحص','جاهزية','صيانة','سلامة','جولة','تقرير','سجل'],1));
 if(/حقوق|حمايه|امنًا|آمنا|نفسي/.test(n))out.push(requirement('إثبات إجراءات الحماية والمناخ الآمن',['حماية','آمن','سياسة','إجراء','توعية','مناخ','بلاغ'],1));
 out.push(requirement('توثيق المصدر والتاريخ أو الفترة الزمنية',['تاريخ','الفترة','العام','الفصل','صادر','اعتماد','محضر'],.7,'metadata'));
 return out.slice(0,7)
}

function decodeXmlText(xml,tags=['t']){try{const d=new DOMParser().parseFromString(xml,'application/xml');const vals=[];for(const tag of tags){const nodes=[...d.getElementsByTagName(tag),...d.getElementsByTagNameNS('*',tag)];nodes.forEach(n=>{const v=(n.textContent||'').trim();if(v)vals.push(v)})}return vals.join('\n')}catch{return xml.replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')}}
function u16(dv,o){return dv.getUint16(o,true)} function u32(dv,o){return dv.getUint32(o,true)}
async function inflate(bytes,raw=true){if(!('DecompressionStream'in window))throw new Error('المتصفح لا يدعم فك ضغط مستندات Office محليًا');const ds=new DecompressionStream(raw?'deflate-raw':'deflate');return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(ds)).arrayBuffer())}
function zipIndex(ab){const dv=new DataView(ab),bytes=new Uint8Array(ab);let eocd=-1;for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65558);i--){if(u32(dv,i)===0x06054b50){eocd=i;break}}if(eocd<0)throw new Error('بنية الملف المضغوط غير مدعومة');const count=u16(dv,eocd+10),off=u32(dv,eocd+16),entries=[];let p=off;for(let i=0;i<count&&p+46<=bytes.length;i++){if(u32(dv,p)!==0x02014b50)break;const method=u16(dv,p+10),csize=u32(dv,p+20),usize=u32(dv,p+24),nlen=u16(dv,p+28),elen=u16(dv,p+30),clen=u16(dv,p+32),loff=u32(dv,p+42),name=enc.decode(bytes.slice(p+46,p+46+nlen));entries.push({name,method,csize,usize,loff});p+=46+nlen+elen+clen}return entries}
async function zipRead(ab,entry){const dv=new DataView(ab),bytes=new Uint8Array(ab),p=entry.loff;if(u32(dv,p)!==0x04034b50)throw new Error('تعذر قراءة جزء من المستند');const nlen=u16(dv,p+26),elen=u16(dv,p+28),start=p+30+nlen+elen,data=bytes.slice(start,start+entry.csize);if(entry.method===0)return data;if(entry.method===8)return inflate(data,true);throw new Error('نوع ضغط غير مدعوم في هذا المستند')}
async function extractDocx(ab){const idx=zipIndex(ab),targets=idx.filter(e=>/^word\/(document|header\d*|footer\d*)\.xml$/i.test(e.name));let text='';for(const e of targets){const xml=enc.decode(await zipRead(ab,e));text+='\n'+decodeXmlText(xml,['t'])}return text.trim()}
async function extractPptx(ab){const idx=zipIndex(ab),targets=idx.filter(e=>/^ppt\/slides\/slide\d+\.xml$/i.test(e.name));let text='';for(const e of targets){const xml=enc.decode(await zipRead(ab,e));text+='\n'+decodeXmlText(xml,['t'])}return text.trim()}
async function extractXlsx(ab){const idx=zipIndex(ab),sharedEntry=idx.find(e=>e.name==='xl/sharedStrings.xml'),shared=[];if(sharedEntry){const xml=enc.decode(await zipRead(ab,sharedEntry));try{const d=new DOMParser().parseFromString(xml,'application/xml');[...d.getElementsByTagNameNS('*','si')].forEach(si=>shared.push([...si.getElementsByTagNameNS('*','t')].map(t=>t.textContent||'').join('')))}catch{for(const m of xml.matchAll(/<si[^>]*>([\s\S]*?)<\/si>/g))shared.push((m[1].match(/<t[^>]*>([\s\S]*?)<\/t>/g)||[]).map(x=>x.replace(/<[^>]+>/g,'')).join(' '))}}
 const sheets=idx.filter(e=>/^xl\/worksheets\/sheet\d+\.xml$/i.test(e.name));const vals=[];for(const e of sheets){const xml=enc.decode(await zipRead(ab,e));try{const d=new DOMParser().parseFromString(xml,'application/xml');[...d.getElementsByTagNameNS('*','c')].forEach(c=>{const typ=c.getAttribute('t'),v=c.getElementsByTagNameNS('*','v')[0]?.textContent||'',inline=[...c.getElementsByTagNameNS('*','t')].map(t=>t.textContent||'').join('');let x=inline||v;if(typ==='s'&&shared[Number(v)]!==undefined)x=shared[Number(v)];if(x)vals.push(x)})}catch{for(const m of xml.matchAll(/<c([^>]*)>([\s\S]*?)<\/c>/g)){const typ=(m[1].match(/t="([^"]+)"/)||[])[1]||'',v=(m[2].match(/<v[^>]*>([\s\S]*?)<\/v>/)||[])[1]||'',inline=(m[2].match(/<t[^>]*>([\s\S]*?)<\/t>/)||[])[1]||'';let x=inline||v;if(typ==='s'&&shared[Number(v)]!==undefined)x=shared[Number(v)];if(x)vals.push(x)}}}return vals.join('\n')}
function ascii85Decode(bytes){let s=latin.decode(bytes).replace(/\s+/g,'').replace(/^<~/,'').replace(/~>$/,'');const out=[];let group='';for(const c of s){if(c==='z'&&!group){out.push(0,0,0,0);continue}if(c<'!'||c>'u')continue;group+=c;if(group.length===5){let v=0;for(const ch of group)v=v*85+(ch.charCodeAt(0)-33);out.push((v>>>24)&255,(v>>>16)&255,(v>>>8)&255,v&255);group=''}}if(group.length){const n=group.length;while(group.length<5)group+='u';let v=0;for(const ch of group)v=v*85+(ch.charCodeAt(0)-33);const b=[(v>>>24)&255,(v>>>16)&255,(v>>>8)&255,v&255];out.push(...b.slice(0,n-1))}return new Uint8Array(out)}
function pdfHexUnicode(hex){const b=[];for(let i=0;i+1<hex.length;i+=2)b.push(parseInt(hex.slice(i,i+2),16));if(b[0]===0xfe&&b[1]===0xff)b.splice(0,2);let s='';for(let i=0;i+1<b.length;i+=2)s+=String.fromCharCode((b[i]<<8)|b[i+1]);return s}
function parseCMaps(s){const maps=[];const blocks=s.match(/begincmap[\s\S]*?endcmap/g)||[s];for(const b of blocks){const m=new Map();const chars=b.match(/beginbfchar[\s\S]*?endbfchar/g)||[];for(const c of chars)for(const x of c.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g))m.set(x[1].toUpperCase(),pdfHexUnicode(x[2]));const ranges=b.match(/beginbfrange[\s\S]*?endbfrange/g)||[];for(const r of ranges)for(const x of r.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)){let a=parseInt(x[1],16),z=parseInt(x[2],16),dst=parseInt(x[3],16),w=x[1].length;for(let k=a;k<=z&&k-a<1000;k++)m.set(k.toString(16).toUpperCase().padStart(w,'0'),pdfHexUnicode((dst+k-a).toString(16).padStart(x[3].length,'0')))}if(m.size)maps.push(m)}return maps}
function textQuality(s){const good=(s.match(/[\u0600-\u06ffA-Za-z0-9]/g)||[]).length,bad=(s.match(/[\u0000-\u0008\u000e-\u001f�]/g)||[]).length;return good-bad*2}
function decodePdfHex(hex,maps){const cand=[];for(const m of maps){for(const w of [2,4,6,8]){let s='',hit=0;if(hex.length%w)continue;for(let i=0;i<hex.length;i+=w){const k=hex.slice(i,i+w).toUpperCase();if(m.has(k)){s+=m.get(k);hit++}else s+=' '}if(hit)cand.push(s)}}cand.push(pdfHexUnicode(hex));try{const b=new Uint8Array(hex.match(/../g).map(x=>parseInt(x,16)));cand.push(enc.decode(b))}catch{}return cand.sort((a,b)=>textQuality(b)-textQuality(a))[0]||''}
function decodePdfLiteral(s,maps=[]){let out=[],escp=false;for(let i=0;i<s.length;i++){const c=s[i];if(escp){escp=false;if(/[0-7]/.test(c)){let oct=c;for(let j=0;j<2&&/[0-7]/.test(s[i+1]||'');j++)oct+=s[++i];out.push(parseInt(oct,8));continue}const map={n:10,r:13,t:9,b:8,f:12};out.push(map[c]??c.charCodeAt(0));continue}if(c==='\\'){escp=true;continue}out.push(c.charCodeAt(0)&255)}const b=new Uint8Array(out),cand=[];if(b[0]===0xfe&&b[1]===0xff){let x='';for(let i=2;i+1<b.length;i+=2)x+=String.fromCharCode((b[i]<<8)|b[i+1]);cand.push(x)}cand.push(enc.decode(b));if(maps.length){const hex=[...b].map(v=>v.toString(16).padStart(2,'0')).join('');cand.push(decodePdfHex(hex,maps))}return cand.sort((a,b)=>textQuality(b)-textQuality(a))[0]||''}
async function extractPdf(ab){const bytes=new Uint8Array(ab),raw=latin.decode(bytes),streams=[];const re=/<<(.*?)>>\s*stream\r?\n/gms;let m;while((m=re.exec(raw))&&streams.length<250){const start=re.lastIndex,end=raw.indexOf('endstream',start);if(end<0)break;let data=bytes.slice(start,end-(raw[end-1]==='\r'?1:0));try{const dict=m[1];if(/ASCII85Decode/.test(dict))data=ascii85Decode(data);if(/FlateDecode/.test(dict)){try{data=await inflate(data,false)}catch{data=await inflate(data,true)}}streams.push(latin.decode(data))}catch{}re.lastIndex=end+9}const joined=(raw.slice(0,MAX_TEXT/3)+'\n'+streams.join('\n')).slice(0,MAX_TEXT*2),maps=parseCMaps(joined),chunks=[];for(const block of [raw,...streams]){const areas=block.match(/BT[\s\S]*?ET/g)||[block];for(const a of areas){for(const x of a.matchAll(/\(([^()]*(?:\\.[^()]*)*)\)\s*Tj/g))chunks.push(decodePdfLiteral(x[1],maps));for(const x of a.matchAll(/<([0-9A-Fa-f]{2,})>\s*Tj/g))chunks.push(decodePdfHex(x[1],maps));for(const x of a.matchAll(/\[([\s\S]*?)\]\s*TJ/g)){for(const y of x[1].matchAll(/\(([^()]*(?:\\.[^()]*)*)\)|<([0-9A-Fa-f]{2,})>/g))chunks.push(y[1]!==undefined?decodePdfLiteral(y[1],maps):decodePdfHex(y[2],maps))}}}return chunks.join(' ').replace(/\s+/g,' ').trim()}
async function extractFile(file){if(!file)return{ok:false,text:'',method:'metadata',message:'لا يوجد ملف مرفق'};const name=(file.name||'').toLowerCase(),type=(file.type||'').toLowerCase();try{if(type.startsWith('image/')||/\.(png|jpe?g|webp|gif|heic)$/i.test(name))return{ok:false,text:'',method:'image',message:'الصورة محفوظة محليًا، لكن V3.3 لا تستخدم OCR؛ التحليل يعتمد على الوصف والبيانات المرافقة.'};if(/\.(txt|csv|md|json|html?|xml)$/i.test(name)||/^text\//.test(type)){const t=(await file.text()).slice(0,MAX_TEXT);return{ok:!!t,text:t,method:'text',message:t?'تم استخراج النص محليًا.':'الملف النصي فارغ.'}}const ab=await file.arrayBuffer();let t='',method='';if(/\.docx$/i.test(name)){t=await extractDocx(ab);method='docx'}else if(/\.pptx$/i.test(name)){t=await extractPptx(ab);method='pptx'}else if(/\.xlsx$/i.test(name)){t=await extractXlsx(ab);method='xlsx'}else if(/\.pdf$/i.test(name)||type==='application/pdf'){t=await extractPdf(ab);method='pdf'}else if(/\.(doc|xls|ppt)$/i.test(name))return{ok:false,text:'',method:'legacy-office',message:'صيغة Office القديمة لا يمكن قراءتها محليًا بأمان. احفظيها بصيغة DOCX/XLSX/PPTX أو PDF.'};else return{ok:false,text:'',method:'unsupported',message:'نوع الملف غير مدعوم للتحليل النصي، وسيستخدم العقل العنوان والوصف فقط.'};t=(t||'').slice(0,MAX_TEXT);if(!t||tokens(t).length<4)return{ok:false,text:t,method,message:method==='pdf'?'لم يظهر نص قابل للاستخراج من PDF؛ قد يكون ممسوحًا كصورة أو يستخدم ترميزًا غير قابل للقراءة. لن تدّعي المنصة قراءة محتواه.':'لم يظهر نص كافٍ للتحليل في المستند.'};return{ok:true,text:t,method,message:`تم استخراج النص محليًا من ${method.toUpperCase()} دون رفع الملف إلى خادم.`}}catch(err){return{ok:false,text:'',method:'error',message:`تعذر استخراج النص محليًا: ${err?.message||'خطأ غير معروف'}`}}
}
function requirementStatus(req,text,metaText){const source=req.kind==='metadata'?metaText:`${text} ${metaText}`;if(req.kind==='relevance'){const cov=tokenCoverage(req.keywords.join(' '),source);return{matched:cov>=28,score:cov}}let hits=req.keywords.filter(k=>hasAny(source,[k])||tokenCoverage(k,source)>=66).length;const score=req.keywords.length?hits/Math.min(req.keywords.length,3)*100:0;return{matched:hits>0,score:clamp(score)}}
function analyze(ind,{title='',desc='',filename='',date='',text='',extractionOk=false}={}){const meta=`${title} ${desc} ${filename} ${date}`,source=`${meta} ${text}`,matrix=verificationMatrix(ind),direct=tokenCoverage(`${ind.text} ${(ind.expected||[]).join(' ')}`,source),checks=matrix.map(r=>{const s=requirementStatus(r,text,meta);return{label:r.label,matched:s.matched,score:Math.round(s.score),weight:r.weight}}),weights=checks.reduce((n,x)=>n+x.weight,0)||1,coverage=checks.reduce((n,x)=>n+(x.matched?x.weight:0),0)/weights*100;let metadata=0;if(title)metadata+=5;if(desc&&desc.length>=25)metadata+=5;if(date)metadata+=4;if(filename)metadata+=3;if(extractionOk)metadata+=3;let score=direct*.35+coverage*.45+metadata;if(!extractionOk)score=Math.min(score,68);score=clamp(score);const missing=checks.filter(x=>!x.matched).map(x=>x.label),met=checks.filter(x=>x.matched).map(x=>x.label);let label='ضعيف أو غير كافٍ';if(score>=80)label='شاهد قوي ومتكامل';else if(score>=65)label='شاهد مناسب مع استكمال محدود';else if(score>=45)label='مرتبط لكنه يحتاج استكمالًا';const confidence=extractionOk?(tokens(text).length>80?'مرتفعة':'متوسطة'):'محدودة';const analysis=extractionOk?`فُحص محتوى الملف محليًا. ظهر ${met.length} من ${checks.length} عناصر تحقق استرشادية، وبلغ الارتباط النصي بالمؤشر ${Math.round(direct)}٪.`:`لم يتوفر نص موثوق من داخل الملف؛ اعتمد التحليل على العنوان والوصف وبيانات الملف، لذلك درجة الثقة ${confidence}.`;return{score:Math.round(score*10)/10,label,confidence,direct:Math.round(direct),coverage:Math.round(coverage),checks,missing,met,analysis}}
function candidateScore(ind,text,meta=''){const q=`${ind.text} ${(ind.expected||[]).join(' ')}`,direct=tokenCoverage(q,`${text} ${meta}`),expected=(ind.expected||[]).filter(e=>hasAny(`${text} ${meta}`,tokens(e).slice(0,3))).length;return clamp(direct*.8+Math.min(20,expected*6))}
function suggest(text,meta='',exclude=[]){const ex=new Set(exclude),rows=allIndicators().filter(i=>!ex.has(i.id)).map(i=>({id:i.id,code:i.code,text:i.text,domainTitle:i.domainTitle,standardTitle:i.standardTitle,score:Math.round(candidateScore(i,text,meta))})).filter(x=>x.score>=30).sort((a,b)=>b.score-a.score).slice(0,6);return rows}
function analysisForEvidence(e,indicatorId){return e?.analyses?.[indicatorId]||((e?.indicatorId===indicatorId||e?.indicatorIds?.includes?.(indicatorId))?{score:e.score,label:e.label,analysis:e.analysis,missing:e.missing||[],checks:e.checks||[]}:null)}
window.DocumentBrain={norm,tokens,tokenCoverage,context,allIndicators,verificationMatrix,extractFile,analyze,suggest,analysisForEvidence};
})();
