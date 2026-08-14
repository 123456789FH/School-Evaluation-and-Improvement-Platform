(function(){
'use strict';
const N=v=>Number.isFinite(+v)?+v:0;
const has=v=>v!==''&&v!==null&&v!==undefined&&!Number.isNaN(+v);
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,N(v)));
const avg=a=>a.length?a.reduce((s,v)=>s+N(v),0)/a.length:0;
const daysBetween=(a,b)=>{if(!a||!b)return 0;return Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000)};
const today=()=>new Date().toISOString().slice(0,10);
const SCHOOL_BANDS=[
 {min:90,label:'التميز',tone:'excellent'},
 {min:75,label:'التقدم',tone:'good'},
 {min:50,label:'الانطلاق',tone:'developing'},
 {min:0,label:'التهيئة',tone:'critical'}
];
const OUTCOME_BANDS=[
 {min:80,label:'قوة وإثراء',decision:'استدامة الممارسة مع إثراء المتعلمين المتقنين',tone:'excellent'},
 {min:70,label:'مستقر يحتاج تثبيتًا',decision:'تثبيت المهارة ومتابعة الفئات الأقل إتقانًا',tone:'good'},
 {min:60,label:'فرصة تحسين',decision:'تدخل تحسيني قصير مع قياس بعدي',tone:'developing'},
 {min:0,label:'أولوية علاجية',decision:'تشخيص تفصيلي وخطة علاجية مركزة وقياس بعدي',tone:'critical'}
];
function band(score,bands=SCHOOL_BANDS){const s=clamp(score);return bands.find(x=>s>=x.min)||bands[bands.length-1]}
function schoolClassification(score,completion=100){const b=band(score);if(completion===0)return{label:'لم يبدأ',official:null,tone:'neutral',message:'لم تدخل بيانات كافية لإصدار قراءة.'};if(completion<100)return{label:'قراءة أولية غير مكتملة',band:b.label,official:null,tone:b.tone,message:`أُنجز ${Math.round(completion)}٪ من التقويم. أداء المؤشرات المقيمة يقع مبدئيًا في نطاق «${b.label}»، لكن لا يعتمد التصنيف النهائي قبل اكتمال المؤشرات.`};return{label:b.label,official:b.label,tone:b.tone,message:`اكتمل التقويم وتدخل النتيجة ضمن نطاق «${b.label}» وفق جدول التصنيف المرجعي المحفوظ في المنصة.`}}
function flattenIndicators(standards,schoolType='government'){
 return standards.flatMap(d=>d.standards.flatMap(s=>s.indicators.map(i=>({...i,domainId:d.id,domainTitle:d.title,standardId:s.id,standardTitle:s.title})))).filter(i=>i.appliesTo!=='private'||schoolType!=='government');
}
function assessmentSummary(state,standards){
 const inds=flattenIndicators(standards,state.settings?.schoolType||'government');
 const rows=inds.map(i=>({i,level:N(state.assessment?.[i.id]?.level),evidence:(state.evidence||[]).filter(e=>e.indicatorId===i.id)}));
 const answered=rows.filter(x=>x.level>0); const completion=inds.length?answered.length/inds.length*100:0;
 const performance=answered.length?avg(answered.map(x=>x.level/4*100)):0;
 const readiness=performance*completion/100;
 const evidenceCoverage=answered.length?answered.filter(x=>x.evidence.length).length/answered.length*100:0;
 const weakEvidence=rows.reduce((n,x)=>n+x.evidence.filter(e=>N(e.score)<45).length,0);
 const classification=schoolClassification(performance,completion);
 const domains=standards.map(d=>{
   const ids=new Set(d.standards.flatMap(s=>s.indicators.map(i=>i.id)));
   const all=rows.filter(x=>ids.has(x.i.id)); const a=all.filter(x=>x.level>0);
   const comp=all.length?a.length/all.length*100:0; const score=a.length?avg(a.map(x=>x.level/4*100)):0;
   return{id:d.id,title:d.title,icon:d.icon,score,completion:comp,readiness:score*comp/100,classification:schoolClassification(score,comp)};
 });
 return{total:inds.length,answered:answered.length,completion,performance,score:performance,readiness,evidenceCoverage,weakEvidence,classification,domains,rows};
}
function outcomeClassification(score){return band(score,OUTCOME_BANDS)}
function nafsRecord(r){
 const school=N(r.schoolScore),prev=has(r.previousScore)?N(r.previousScore):null,national=has(r.nationalScore)?N(r.nationalScore):null,target=has(r.targetScore)?N(r.targetScore):null;
 const outcomes=(r.outcomes||[]).filter(o=>has(o.score)).map(o=>({name:o.name||o.title||'ناتج تعلم',score:N(o.score),...outcomeClassification(o.score)}));
 const weak=[...outcomes].sort((a,b)=>a.score-b.score).slice(0,5);
 const delta=prev===null?null:school-prev,gapNational=national===null?null:school-national,gapTarget=target===null?null:school-target;
 let severity=0,reasons=[];
 if(gapTarget!==null&&gapTarget<0){severity+=Math.min(45,Math.abs(gapTarget)*2);reasons.push(`النتيجة أقل من المستهدف بـ ${Math.abs(gapTarget).toFixed(1)} نقطة.`)}
 if(delta!==null&&delta<0){severity+=Math.min(25,Math.abs(delta)*3);reasons.push(`يوجد تراجع عن القياس السابق بمقدار ${Math.abs(delta).toFixed(1)} نقطة.`)}
 else if(delta!==null&&delta>0)reasons.push(`تحسن عن القياس السابق بمقدار ${delta.toFixed(1)} نقطة.`);
 const critical=outcomes.filter(o=>o.score<60); if(critical.length){severity+=Math.min(35,critical.length*12);reasons.push(`${critical.length} من نواتج التعلم المدخلة تقع في أولوية علاجية.`)}
 let status='قراءة أولية';
 if(target!==null&&school>=target&&(!delta||delta>=0))status='حقق المستهدف';
 else if(delta!==null&&delta>0&&gapTarget!==null&&gapTarget<0)status='تحسن مع بقاء فجوة';
 else if(delta!==null&&delta<0)status='تراجع يحتاج تدخلًا';
 else if(critical.length)status='أولوية علاجية';
 const confidence=[has(r.schoolScore),prev!==null,national!==null,target!==null,outcomes.length>0].filter(Boolean).length;
 return{school,prev,national,target,delta,gapNational,gapTarget,outcomes,weakest:weak,severity:clamp(severity),status,reasons,confidence:confidence>=4?'مرتفعة':confidence>=2?'متوسطة':'محدودة'};
}
function improvementImpact(x){
 const pre=has(x.pre)?N(x.pre):null,post=has(x.post)?N(x.post):null,target=has(x.target)?N(x.target):null;
 const delta=pre!==null&&post!==null?post-pre:null; const achieved=post!==null&&target!==null?post>=target:false;
 let effectiveness='غير مقاس'; if(post!==null&&target!==null){if(achieved)effectiveness='فعّال وحقق المستهدف';else if(delta!==null&&delta>=10)effectiveness='فعّال جزئيًا';else if(delta!==null&&delta>0)effectiveness='تحسن محدود';else effectiveness='لم يظهر أثر إيجابي';}
 return{pre,post,target,delta,achieved,effectiveness};
}
function operationalItem(x){
 const baseline=has(x.baseline)?N(x.baseline):null,target=has(x.target)?N(x.target):null,actual=has(x.actual)?N(x.actual):null,direction=x.direction||'up';
 let achievement=null;
 if(actual!==null&&target!==null){
  if(direction==='down'&&baseline!==null&&baseline!==target){achievement=(baseline-actual)/(baseline-target)*100;}
  else if(direction==='down'){achievement=actual<=target?100:(target/Math.max(actual,0.0001))*100;}
  else achievement=target===0?(actual===0?100:0):(actual/target*100);
 }
 if(achievement!==null)achievement=Math.max(-100,Math.min(180,achievement));
 const overdue=!!(x.end&&x.status!=='done'&&x.end<today());
 let risk=0,reasons=[];
 if(achievement===null){risk+=35;reasons.push('لا توجد قيمة فعلية للمؤشر حتى الآن.');}
 else if(achievement<50){risk+=65;reasons.push('تحقق أقل من نصف المستهدف.');}
 else if(achievement<75){risk+=45;reasons.push('تحقق المؤشر دون المستوى الآمن.');}
 else if(achievement<90){risk+=25;reasons.push('التقدم جيد لكنه ما زال دون المستهدف.');}
 if(overdue){risk+=25;reasons.push('انتهى الموعد المستهدف والبند غير مكتمل.');}
 if(!x.evidence&&x.status==='done'){risk+=10;reasons.push('البند مكتمل لكن الشاهد غير موثق في الوصف.');}
 let label='لم يبدأ';
 if(achievement!==null){label=achievement>=100?'متحقق/متجاوز':achievement>=90?'قريب جدًا من المستهدف':achievement>=75?'تقدم جيد':achievement>=50?'متعثر':'حرج';}
 const action=risk>=70?'إجراء تصحيحي عاجل مع تحليل سبب جذري وقياس أسبوعي':risk>=45?'تعديل الإجراء وتحديد نقطة متابعة قصيرة':risk>=25?'متابعة لصيقة واستكمال الشواهد':'استدامة الإجراء وتوثيق الممارسة الناجحة';
 return{baseline,target,actual,achievement,risk:clamp(risk),overdue,label,reasons,action};
}
function operationalSummary(state){
 const items=state.operationalPlan||[]; const analyses=items.map(x=>({item:x,analysis:operationalItem(x)}));
 const weighted=analyses.filter(x=>x.analysis.achievement!==null); const sumW=weighted.reduce((s,x)=>s+Math.max(1,N(x.item.weight)||1),0);
 const achievement=sumW?weighted.reduce((s,x)=>s+clamp(x.analysis.achievement,0,120)*Math.max(1,N(x.item.weight)||1),0)/sumW:0;
 return{items:analyses,achievement,completed:items.filter(x=>x.status==='done').length,atRisk:analyses.filter(x=>x.analysis.risk>=45).length,overdue:analyses.filter(x=>x.analysis.overdue).length};
}
function satisfactionSummary(state){
 const rows=state.satisfaction||[]; if(!rows.length)return{avg:0,responses:0,low:null,trend:null};
 const responses=rows.reduce((n,x)=>n+N(x.responses),0); const score=responses?rows.reduce((n,x)=>n+N(x.score)*N(x.responses),0)/responses:avg(rows.map(x=>N(x.score)));
 const sorted=[...rows].sort((a,b)=>(a.date||'').localeCompare(b.date||'')); let trend=null;if(sorted.length>=2)trend=N(sorted.at(-1).score)-N(sorted.at(-2).score);
 return{avg:score,responses,low:[...rows].sort((a,b)=>N(a.score)-N(b.score))[0],trend};
}
function manualSwot(state,type){return(state.manualSwot?.[type]||[]).map(x=>typeof x==='string'?x:x.text).filter(Boolean)}
function swot(state,standards){
 const A=assessmentSummary(state,standards),O=operationalSummary(state),Sat=satisfactionSummary(state);
 const strengths=[],weaknesses=[],opportunities=[],threats=[];
 A.domains.forEach(d=>{if(d.completion>=60&&d.score>=80)strengths.push(`قوة في مجال ${d.title} (${d.score.toFixed(1)}٪) مع مستوى بيانات يسمح بقراءة موثوقة نسبيًا.`);if(d.completion>=40&&d.score<65)weaknesses.push(`انخفاض في مجال ${d.title} (${d.score.toFixed(1)}٪) يحتاج تحليل المؤشرات الأدنى داخله.`)});
 (state.nafs||[]).forEach(r=>{const a=nafsRecord(r);if(a.delta!==null&&a.delta>=5&&a.gapTarget!==null&&a.gapTarget>=-5)strengths.push(`تحسن ملحوظ في نافس (${r.grade||''} / ${r.subject||''}) بمقدار ${a.delta.toFixed(1)} نقطة.`);if(a.severity>=55)weaknesses.push(`فجوة ذات أولوية في نتائج نافس (${r.grade||''} / ${r.subject||''}): ${a.status}.`)});
 if(Sat.avg>=85&&Sat.responses>0)strengths.push(`رضا المستفيدين مرتفع (${Sat.avg.toFixed(1)}٪) ويمكن استثمار الممارسات الأعلى تقييمًا.`); else if(Sat.avg>0&&Sat.avg<80)weaknesses.push(`رضا المستفيدين (${Sat.avg.toFixed(1)}٪) يكشف فرصة تحسين في الخدمات أو التواصل.`);
 if(O.achievement>=90&&O.items.length)strengths.push(`الخطة التشغيلية تحقق متوسطًا مرتفعًا (${O.achievement.toFixed(1)}٪).`);if(O.atRisk)weaknesses.push(`يوجد ${O.atRisk} بند/بنود تشغيلية متعثرة أو عالية المخاطر.`);
 const pd=state.professional||[];if(pd.length)opportunities.push(`استثمار ${pd.length} نشاطًا من أنشطة التطوير المهني لربط التدريب مباشرة بالفجوات ذات الأولوية وقياس أثره.`);
 const successful=(state.improvements||[]).filter(x=>improvementImpact(x).achieved);if(successful.length)opportunities.push(`توسيع الممارسات التي أثبتت نجاحها في ${successful.length} خطة تحسين وتطبيقها على مشكلات مشابهة.`);
 const completedPrograms=(state.schoolPlans||[]).filter(x=>x.status==='done'&&has(x.post)&&has(x.pre)&&N(x.post)>N(x.pre));if(completedPrograms.length)opportunities.push(`استثمار البرامج المدرسية التي أظهرت أثرًا إيجابيًا وتكرار عناصر نجاحها.`);
 if(O.overdue)threats.push(`استمرار ${O.overdue} بند/بنود تشغيلية متأخرة قد يؤثر في تحقيق مستهدفات نهاية الفترة.`);
 const declining=(state.nafs||[]).filter(r=>{const a=nafsRecord(r);return a.delta!==null&&a.delta<0});if(declining.length)threats.push(`وجود ${declining.length} سجل/سجلات نافس متراجعة عن الدورة السابقة يستلزم تدخلًا مبكرًا.`);
 const unmeasured=(state.improvements||[]).filter(x=>x.status==='done'&&!has(x.post));if(unmeasured.length)threats.push(`وجود ${unmeasured.length} إجراء/إجراءات تحسين مكتملة دون قياس بعدي يضعف القدرة على إثبات الأثر.`);
 strengths.push(...manualSwot(state,'strengths'));weaknesses.push(...manualSwot(state,'weaknesses'));opportunities.push(...manualSwot(state,'opportunities'));threats.push(...manualSwot(state,'threats'));
 const unique=a=>[...new Set(a)].slice(0,12);return{strengths:unique(strengths),weaknesses:unique(weaknesses),opportunities:unique(opportunities),threats:unique(threats)};
}
function priorities(state,standards){
 const list=[];const A=assessmentSummary(state,standards);
 A.rows.filter(x=>x.level>0&&x.level<=2).forEach(x=>list.push({id:`assessment:${x.i.id}`,source:'assessment',sourceId:x.i.id,title:x.i.text,score:x.level===1?86:68,reason:`التقدير الداخلي ${x.level}/٤${x.evidence.length?'':' ولا توجد شواهد مرتبطة.'}`,action:'تحليل الفجوة والشواهد، تحديد السبب الجذري، ثم إنشاء إجراء تحسين بقبلي ومستهدف وبعدي.',pre:x.level*25,target:80}));
 (state.nafs||[]).forEach(r=>{const a=nafsRecord(r);if(a.severity>=35)list.push({id:`nafs:${r.id}`,source:'nafs',sourceId:r.id,title:`نافس: ${r.grade||''} — ${r.subject||''}`,score:Math.max(45,a.severity),reason:a.reasons.join(' '),action:'تحليل نواتج التعلم الأدنى، بناء تدخل علاجي متدرج، ودعم المعلمين بتطوير مهني مرتبط ثم قياس بعدي.',pre:a.school,target:a.target||75})});
 operationalSummary(state).items.forEach(({item,analysis})=>{if(analysis.risk>=35)list.push({id:`operational:${item.id}`,source:'operational',sourceId:item.id,title:`الخطة التشغيلية: ${item.title}`,score:analysis.risk,reason:analysis.reasons.join(' '),action:analysis.action,pre:analysis.actual??'',target:analysis.target??''})});
 const Sat=satisfactionSummary(state);if(Sat.avg>0&&Sat.avg<82)list.push({id:'satisfaction:overall',source:'satisfaction',sourceId:Sat.low?.id||'',title:'تحسين رضا المستفيدين',score:clamp((85-Sat.avg)*4+35),reason:`متوسط الرضا ${Sat.avg.toFixed(1)}٪ وأقل قياس هو ${Sat.low?.title||'غير محدد'}.`,action:'تحليل الملاحظات المتكررة، اختيار سبب قابل للتدخل، تنفيذ تحسين خدمي، ثم إعادة القياس.',pre:Sat.avg,target:85});
 (state.improvements||[]).forEach(x=>{const im=improvementImpact(x);if(x.status==='done'&&im.post!==null&&!im.achieved)list.push({id:`improvement:${x.id}`,source:'improvement',sourceId:x.id,title:`مراجعة خطة تحسين: ${x.title}`,score:im.delta!==null&&im.delta<=0?80:55,reason:`الخطة اكتملت ولكن ${im.effectiveness}.`,action:'مراجعة السبب الجذري وملاءمة الإجراء والفئة المستهدفة وتعديل التدخل قبل تكراره.',pre:im.post,target:im.target})});
 (state.schoolPlans||[]).forEach(x=>{const ratio=has(x.targetCount)&&N(x.targetCount)>0&&has(x.actualCount)?N(x.actualCount)/N(x.targetCount)*100:null;const delta=has(x.pre)&&has(x.post)?N(x.post)-N(x.pre):null;const overdue=!!(x.date&&x.status!=='done'&&x.date<today());let score=0,why=[];if(ratio!==null&&ratio<75){score+=45;why.push(`المستفيدون الفعليون حققوا ${ratio.toFixed(1)}٪ فقط من المستهدف.`)}if(delta!==null&&delta<=0){score+=40;why.push('القياس البعدي لم يظهر تحسنًا عن القبلي.')}else if(delta!==null&&delta<10){score+=20;why.push(`الأثر محدود (+${delta.toFixed(1)} نقطة).`)}if(overdue){score+=25;why.push('موعد التنفيذ مضى والبرنامج غير مكتمل.')}if(score>=30)list.push({id:`schoolplan:${x.id}`,source:'schoolplan',sourceId:x.id,title:`برنامج مدرسي: ${x.title}`,score:clamp(score),reason:why.join(' '),action:'مراجعة تصميم البرنامج والفئة المستهدفة ومؤشر النجاح، ثم تعديل التنفيذ وإعادة القياس.',pre:has(x.post)?N(x.post):has(x.pre)?N(x.pre):'',target:80})});
 (state.professional||[]).forEach(x=>{const delta=has(x.pre)&&has(x.post)?N(x.post)-N(x.pre):null;const overdue=!!(x.date&&x.status!=='done'&&x.date<today());let score=0,why=[];if(x.status==='done'&&!has(x.post)){score+=35;why.push('تم تنفيذ النشاط دون قياس بعدي؛ لا يمكن إثبات أثره بعد.')}if(delta!==null&&delta<=0){score+=55;why.push('لم يظهر تحسن في القياس بعد النشاط المهني.')}else if(delta!==null&&delta<10){score+=25;why.push(`الأثر المعرفي محدود (+${delta.toFixed(1)} نقطة).`)}if(overdue){score+=25;why.push('موعد النشاط مضى ولم يسجل كمنفذ.')}if(score>=30)list.push({id:`professional:${x.id}`,source:'professional',sourceId:x.id,title:`تطوير مهني: ${x.title}`,score:clamp(score),reason:why.join(' '),action:'ربط النشاط بحاجة مهنية محددة، قياس التطبيق في الممارسة، ثم إعادة القياس بدل الاكتفاء بالحضور.',pre:has(x.post)?N(x.post):has(x.pre)?N(x.pre):'',target:85})});
 (state.events||[]).forEach(x=>{const ratio=has(x.targetCount)&&N(x.targetCount)>0&&has(x.actualCount)?N(x.actualCount)/N(x.targetCount)*100:null;const impact=has(x.impactScore)?N(x.impactScore):null;const sat=has(x.satisfactionScore)?N(x.satisfactionScore):null;const overdue=!!(x.date&&x.status!=='done'&&x.date<today());let score=0,why=[];if(ratio!==null&&ratio<70){score+=35;why.push(`المشاركة بلغت ${ratio.toFixed(1)}٪ من المستهدف.`)}if(impact!==null&&impact<70){score+=45;why.push(`تحقق الهدف منخفض (${impact.toFixed(1)}٪).`)}if(sat!==null&&sat<80){score+=25;why.push(`رضا المستفيدين منخفض نسبيًا (${sat.toFixed(1)}٪).`)}if(overdue){score+=25;why.push('موعد الفعالية مضى ولم تكتمل.')}if(score>=30)list.push({id:`event:${x.id}`,source:'event',sourceId:x.id,title:`فعالية: ${x.title}`,score:clamp(score),reason:why.join(' '),action:'تحليل أسباب المشاركة/الأثر، تعديل أسلوب التفعيل، وتحديد مؤشر نجاح واضح للدورة القادمة.',pre:impact??sat??'',target:85})});
 (state.evidence||[]).filter(e=>N(e.score)<45).slice(0,8).forEach(e=>list.push({id:`evidence:${e.id}`,source:'evidence',sourceId:e.id,title:`شاهد يحتاج مراجعة: ${e.title}`,score:52,reason:`درجة ملاءمة الشاهد ${N(e.score).toFixed(1)}٪؛ قد لا يثبت المؤشر بصورة كافية.`,action:'تحديد ما يثبته الشاهد وما ينقصه، ثم استكمال سلسلة الدليل بنتيجة أو متابعة أو قياس أثر.',pre:N(e.score),target:70}));
 (state.treatmentPlans||[]).forEach(x=>{if(x.status==='done'){const post=has(x.post)?N(x.post):null,target=has(x.target)?N(x.target):null;if(post===null)list.push({id:`treatment:${x.id}`,source:'treatment',sourceId:x.id,title:`خطة علاجية بلا قياس بعدي: ${x.outcome}`,score:55,reason:'الخطة مسجلة كمكتملة دون نتيجة بعدية؛ لا يمكن الحكم على فاعليتها.',action:'تنفيذ قياس بعدي مطابق قدر الإمكان للقبلي ثم اتخاذ قرار الاستمرار أو تعديل التدخل.',pre:x.baseline,target:x.target});else if(target!==null&&post<target)list.push({id:`treatment:${x.id}`,source:'treatment',sourceId:x.id,title:`خطة علاجية لم تحقق المستهدف: ${x.outcome}`,score:post<=N(x.baseline)?82:60,reason:`النتيجة البعدية ${post.toFixed(1)}٪ مقابل مستهدف ${target.toFixed(1)}٪.`,action:'تحليل أخطاء الطلاب، إعادة تجميع الفئة المستهدفة وتغيير التدخل ثم قياس قصير المدى.',pre:post,target})}});
 return list.sort((a,b)=>b.score-a.score).slice(0,30);
}
function solutionFor(p){
 const base={title:p.title,problem:p.reason,priority:p.score>=75?'عاجلة':p.score>=55?'مرتفعة':'متوسطة',target:p.target||80,baseline:p.pre,owner:'فريق التحسين',duration:'أسبوعان إلى أربعة أسابيع',kpi:'تحسن القياس البعدي وتحقيق المستهدف مع شاهد موثق'};
 const templates={
  assessment:['تدقيق المؤشر والشواهد المرتبطة وتحديد الفجوة الدقيقة.','تنفيذ إجراء تطويري واحد محدد قابل للقياس بدل مجموعة إجراءات عامة.','إعادة التقدير بعد اكتمال الشاهد وقياس الأثر.'],
  nafs:['تفكيك النتيجة إلى نواتج تعلم وتحديد الطلاب/المهارات ذات الأولوية.','تنفيذ تعليم علاجي متدرج مع تدريب قصير للمعلمين عند الحاجة.','اختبار بعدي ومقارنة النتيجة بالقبلي والمستهدف.'],
  operational:['إجراء تحليل سبب جذري (لماذا لم يتحقق المؤشر؟).','تعديل الإجراء أو الموارد أو المسؤولية أو الجدول الزمني وفق السبب.','تحديد نقطة متابعة قريبة وقياس مرحلي قبل موعد الإغلاق.'],
  satisfaction:['تصنيف الملاحظات المتكررة إلى أسباب قابلة للتدخل.','تنفيذ تحسين واحد واضح في الخدمة/التواصل وإبلاغ المستفيدين به.','إعادة قياس الرضا ومقارنة النتيجة قبل وبعد.'],
  improvement:['تحديد سبب ضعف أثر التدخل السابق وعدم تكراره بالشكل نفسه.','اختيار بديل علاجي أو تغيير الجرعة/الفئة/مدة التنفيذ.','إعادة القياس خلال فترة قصيرة واتخاذ قرار الاستمرار أو الإيقاف.'],
  schoolplan:['مراجعة الهدف ومؤشر النجاح ومدى وصول البرنامج للفئة المستهدفة.','تعديل الإجراء أو أسلوب التنفيذ بناءً على سبب الفجوة.','قياس الأثر بعد التعديل ومقارنته بالمستهدف.'],
  professional:['ربط النشاط بحاجة مهنية محددة بدل التدريب العام.','متابعة تطبيق المهارة عبر زيارة/حصة تطبيقية أو أثر في أداء الطلاب.','إجراء قياس بعدي واتخاذ قرار الاستدامة أو تغيير التدخل.'],
  event:['تحليل المشاركة وتحقيق الهدف وتعليقات المستفيدين.','تعديل تصميم الفعالية أو قنوات الوصول والشراكات.','اعتماد مؤشر أثر واضح وقياسه في التفعيل التالي.'],
  evidence:['مطابقة الشاهد بعبارة المؤشر وتحديد العنصر غير المثبت.','استكمال الشاهد بنتيجة أو متابعة أو أثر بدل الاكتفاء بإثبات التنفيذ.','إعادة تحليل الملاءمة بعد الاستكمال.'],
  treatment:['تحليل أخطاء الفئة المستهدفة وتحديد المهارة الدقيقة المتعثرة.','تغيير استراتيجية العلاج أو مدته أو تجميع الطلاب بحسب الاحتياج.','قياس بعدي قصير واتخاذ قرار الاستمرار أو التعديل.']
 };
 return{...base,actions:templates[p.source]||templates.operational};
}
function reading(state,standards){const ps=priorities(state,standards),A=assessmentSummary(state,standards),O=operationalSummary(state),Sat=satisfactionSummary(state);let headline='تحتاج المنصة إلى مزيد من البيانات لبناء قراءة مدرسية موثوقة.';if(ps.length)headline=`أعلى أولوية حاليًا: ${ps[0].title}. ${ps[0].reason}`;else if(A.completion>=80&&O.items.length)headline='البيانات الحالية لا تكشف أولوية حرجة؛ التركيز الأنسب على الاستدامة واستكمال قياس الأثر.';return{headline,priorities:ps,assessment:A,operational:O,satisfaction:Sat,swot:swot(state,standards)}}
window.SchoolBrain={config:{schoolBands:SCHOOL_BANDS,outcomeBands:OUTCOME_BANDS},schoolClassification,outcomeClassification,assessmentSummary,nafsRecord,improvementImpact,operationalItem,operationalSummary,satisfactionSummary,swot,priorities,solutionFor,reading};
})();
