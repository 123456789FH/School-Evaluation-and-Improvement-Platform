(function(){
'use strict';
const N=v=>Number.isFinite(+v)?+v:0;
const has=v=>v!==''&&v!==null&&v!==undefined&&!Number.isNaN(+v);
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,N(v)));
const avg=a=>a.length?a.reduce((s,v)=>s+N(v),0)/a.length:0;
const unique=a=>[...new Set(a.filter(Boolean))];
function evidenceScoreForIndicator(e,id){return N(e?.analyses?.[id]?.score??e?.score)}
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
const TOPICS={
 reading:{label:'نواتج القراءة',keywords:['قراءة','القراءة','المفردات','النص','الاستنتاج','لغتي','قرائي','قرائية']},
 math:{label:'نواتج الرياضيات',keywords:['رياضيات','الرياضيات','عددي','العددية','الجبر','الهندسة','القياس','الكسور','حل المسألة']},
 science:{label:'نواتج العلوم',keywords:['علوم','العلوم','علمي','الخلية','الوراثة','المادة','القوة','الطاقة','الأرض','الكهرباء']},
 teaching:{label:'جودة التعليم والتعلم',keywords:['التعليم والتعلم','استراتيجيات','إستراتيجيات','خبرات التعلم','المناهج','التدريس','تعلمهم','الفروق الفردية']},
 assessment:{label:'التقويم واستخدام النتائج',keywords:['تقويم التعلم','نتائج التقويم','أدوات تقويم','التغذية الراجعة','تحليل النتائج','اختبارات تشخيصية']},
 operational:{label:'تنفيذ الخطة التشغيلية',keywords:['الخطة التشغيلية','تشغيلي','مؤشر الأداء','KPI','المستهدف','المبادرة']},
 evidence:{label:'جودة الأدلة والشواهد',keywords:['شاهد','الشواهد','الأدلة','الدليل','توثيق']},
 satisfaction:{label:'رضا المستفيدين',keywords:['رضا','المستفيدين','الخدمة','التواصل']},
 professional:{label:'التطوير المهني',keywords:['تطوير مهني','دورة','ورشة','زيارة تبادلية','حصة تطبيقية','مجتمع تعلم']},
 guidance:{label:'التوجيه والدعم الطلابي',keywords:['التوجيه','دعم','إرشاد','سلوك إيجابي','نفسيًا','اجتماعيًا']},
 discipline:{label:'الانضباط والحضور',keywords:['الانضباط','الغياب','التأخر','الحضور','السلوك']},
 gifted:{label:'رعاية الموهوبين',keywords:['موهوب','الموهوبين','الموهوبات','موهبة','إثرائية','ابتكار']},
 activity:{label:'النشاط والمشاركة',keywords:['النشاط','الأنشطة','مشاركة','تطوع','تطوعية','فعالية']},
 family:{label:'مشاركة الأسرة والشراكة',keywords:['الأسرة','أولياء','ولي الأمر','الشراكة','المجتمع']},
 safety:{label:'البيئة والأمن والسلامة',keywords:['سلامة','الأمن','المبنى','الصيانة','النظافة','المرافق']},
 digital:{label:'التقنية والتحول الرقمي',keywords:['تقنية','رقمية','رقمي','منصات','ذكاء اصطناعي']},
 wellbeing:{label:'النمو الشخصي والصحي',keywords:['صحي','الصحة','المناخ','العاطفية','اجتماعية','الذات']},
 planning:{label:'التخطيط والقيادة',keywords:['التخطيط','قيادة','الأهداف التطويرية','خطة تحسين']},
 general:{label:'تحسين مدرسي عام',keywords:[]}
};
function band(score,bands=SCHOOL_BANDS){const s=clamp(score);return bands.find(x=>s>=x.min)||bands[bands.length-1]}
function schoolClassification(score,completion=100){
 const b=band(score);
 if(completion===0)return{label:'لم يبدأ',official:null,tone:'neutral',message:'لم تدخل بيانات كافية لإصدار قراءة.'};
 if(completion<100)return{label:'قراءة أولية غير مكتملة',band:b.label,official:null,tone:b.tone,message:`أُنجز ${Math.round(completion)}٪ من التقويم. أداء المؤشرات المقيمة يقع مبدئيًا في نطاق «${b.label}»، لكن لا يعتمد التصنيف النهائي قبل اكتمال المؤشرات.`};
 return{label:b.label,official:b.label,tone:b.tone,message:`اكتمل التقويم وتدخل النتيجة ضمن نطاق «${b.label}» وفق جدول التصنيف المرجعي المحفوظ في المنصة.`}
}
function flattenIndicators(standards,schoolType='government'){
 return standards.flatMap(d=>d.standards.flatMap(s=>s.indicators.map(i=>({...i,domainId:d.id,domainTitle:d.title,standardId:s.id,standardTitle:s.title})))).filter(i=>i.appliesTo!=='private'||schoolType!=='government');
}
function assessmentSummary(state,standards){
 const inds=flattenIndicators(standards,state.settings?.schoolType||'government');
 const rows=inds.map(i=>({i,level:N(state.assessment?.[i.id]?.level),evidence:(state.evidence||[]).filter(e=>e.indicatorId===i.id||(e.indicatorIds||[]).includes?.(i.id))}));
 const answered=rows.filter(x=>x.level>0),completion=inds.length?answered.length/inds.length*100:0;
 const performance=answered.length?avg(answered.map(x=>x.level/4*100)):0;
 const readiness=performance*completion/100;
 const evidenceCoverage=answered.length?answered.filter(x=>x.evidence.length).length/answered.length*100:0;
 const weakEvidence=rows.reduce((n,x)=>n+x.evidence.filter(e=>evidenceScoreForIndicator(e,x.i.id)<45).length,0);
 const classification=schoolClassification(performance,completion);
 const domains=standards.map(d=>{
   const ids=new Set(d.standards.flatMap(s=>s.indicators.map(i=>i.id)));
   const all=rows.filter(x=>ids.has(x.i.id)),a=all.filter(x=>x.level>0);
   const comp=all.length?a.length/all.length*100:0,score=a.length?avg(a.map(x=>x.level/4*100)):0;
   return{id:d.id,title:d.title,icon:d.icon,score,completion:comp,readiness:score*comp/100,classification:schoolClassification(score,comp)};
 });
 return{total:inds.length,answered:answered.length,completion,performance,score:performance,readiness,evidenceCoverage,weakEvidence,classification,domains,rows};
}
function outcomeClassification(score){return band(score,OUTCOME_BANDS)}
function recommendedNafsTarget(r){
 const school=has(r.schoolScore)?N(r.schoolScore):0,national=has(r.nationalScore)?N(r.nationalScore):null,prev=has(r.previousScore)?N(r.previousScore):null;
 const step=school<50?12:school<60?10:school<75?8:5;
 let t=school+step;
 if(prev!==null&&prev>school)t=Math.max(t,Math.min(prev+5,school+12));
 if(national!==null&&national>school)t=Math.max(t,Math.min(national,school+12));
 return Math.round(clamp(t,0,100)*10)/10;
}
function recommendedOutcomeTarget(score){const s=N(score),step=s<45?15:s<60?12:s<70?10:7;return Math.round(clamp(Math.max(70,s+step),0,90)*10)/10}
function nafsRecord(r){
 const school=N(r.schoolScore),prev=has(r.previousScore)?N(r.previousScore):null,national=has(r.nationalScore)?N(r.nationalScore):null,explicitTarget=has(r.targetScore)?N(r.targetScore):null;
 const target=explicitTarget===null?recommendedNafsTarget(r):explicitTarget,targetKind=explicitTarget===null?'مستهدف داخلي مقترح':'مستهدف المدرسة';
 const outcomes=(r.outcomes||[]).filter(o=>has(o.score)).map(o=>({name:o.name||o.title||'ناتج تعلم',score:N(o.score),...outcomeClassification(o.score),recommendedTarget:recommendedOutcomeTarget(o.score)}));
 const weak=[...outcomes].sort((a,b)=>a.score-b.score).slice(0,5);
 const delta=prev===null?null:school-prev,gapNational=national===null?null:school-national,gapTarget=school-target;
 let severity=0,reasons=[];
 if(gapTarget<0){severity+=Math.min(42,Math.abs(gapTarget)*2);reasons.push(`النتيجة أقل من ${targetKind} بـ ${Math.abs(gapTarget).toFixed(1)} نقطة.`)}
 if(gapNational!==null&&gapNational<-5){severity+=Math.min(18,Math.abs(gapNational));reasons.push(`النتيجة أقل من المرجع بـ ${Math.abs(gapNational).toFixed(1)} نقطة.`)}
 if(delta!==null&&delta<0){severity+=Math.min(25,Math.abs(delta)*3);reasons.push(`يوجد تراجع عن القياس السابق بمقدار ${Math.abs(delta).toFixed(1)} نقطة.`)}
 else if(delta!==null&&delta>0)reasons.push(`تحسن عن القياس السابق بمقدار ${delta.toFixed(1)} نقطة.`);
 const critical=outcomes.filter(o=>o.score<60);if(critical.length){severity+=Math.min(35,critical.length*10);reasons.push(`${critical.length} من نواتج التعلم المدخلة تقع في أولوية علاجية.`)}
 let status='قراءة أولية';
 if(school>=target&&(delta===null||delta>=0))status='حقق المستهدف';
 else if(delta!==null&&delta>0&&gapTarget<0)status='تحسن مع بقاء فجوة';
 else if(delta!==null&&delta<0)status='تراجع يحتاج تدخلًا';
 else if(critical.length)status='أولوية علاجية';
 const confidence=[has(r.schoolScore),prev!==null,national!==null,explicitTarget!==null,outcomes.length>0].filter(Boolean).length;
 return{school,prev,national,target,explicitTarget,targetKind,delta,gapNational,gapTarget,outcomes,weakest:weak,severity:clamp(severity),status,reasons,confidence:confidence>=4?'مرتفعة':confidence>=2?'متوسطة':'محدودة'};
}
function improvementImpact(x){
 const pre=has(x.pre)?N(x.pre):null,post=has(x.post)?N(x.post):null,target=has(x.target)?N(x.target):null;
 const delta=pre!==null&&post!==null?post-pre:null,achieved=post!==null&&target!==null?post>=target:false;
 let effectiveness='غير مقاس';
 if(post!==null&&target!==null){if(achieved)effectiveness='فعّال وحقق المستهدف';else if(delta!==null&&delta>=10)effectiveness='فعّال جزئيًا';else if(delta!==null&&delta>0)effectiveness='تحسن محدود';else effectiveness='لم يظهر أثر إيجابي';}
 return{pre,post,target,delta,achieved,effectiveness};
}
function targetProgress(baseline,target,actual,direction='up'){
 if(actual===null||target===null)return{progress:null,targetAttainment:null,targetReached:false,gap:null,method:'missing'};
 const reached=direction==='down'?actual<=target:actual>=target;
 let progress=null,method='target-only';
 if(baseline!==null&&baseline!==target){
  const den=direction==='down'?(baseline-target):(target-baseline);
  const num=direction==='down'?(baseline-actual):(actual-baseline);
  if(den>0){progress=num/den*100;method='baseline-to-target';}
 }
 if(progress===null){
  if(direction==='down')progress=reached?100:(target/Math.max(Math.abs(actual),0.0001))*100;
  else progress=target===0?(actual===0?100:0):(actual/target*100);
 }
 const targetAttainment=direction==='down'?(reached?100:(target/Math.max(Math.abs(actual),0.0001))*100):(target===0?(actual===0?100:0):(actual/target*100));
 const gap=direction==='down'?actual-target:target-actual;
 return{progress:Math.max(-100,Math.min(180,progress)),targetAttainment:Math.max(-100,Math.min(180,targetAttainment)),targetReached:reached,gap,method};
}
function operationalItem(x){
 const baseline=has(x.baseline)?N(x.baseline):null,target=has(x.target)?N(x.target):null,actual=has(x.actual)?N(x.actual):null,direction=x.direction||'up';
 const tp=targetProgress(baseline,target,actual,direction),achievement=tp.progress;
 const overdue=!!(x.end&&x.status!=='done'&&x.end<today());
 let scheduleProgress=null;
 if(x.start&&x.end&&x.start<x.end){const total=Math.max(1,daysBetween(x.start,x.end)),elapsed=daysBetween(x.start,Math.min(today(),x.end));scheduleProgress=clamp(elapsed/total*100)}
 let risk=0,reasons=[];
 if(achievement===null){risk+=35;reasons.push('لا توجد قيمة فعلية للمؤشر حتى الآن.');}
 else{
  if(tp.method==='baseline-to-target')reasons.push(`تم إنجاز ${Math.round(clamp(achievement,0,180))}٪ من المسافة بين خط الأساس والمستهدف.`);
  if(achievement<25){risk+=70;reasons.push('التقدم نحو المستهدف ما زال محدودًا جدًا.');}
  else if(achievement<50){risk+=55;reasons.push('أُنجز أقل من نصف التحسن المطلوب للوصول إلى المستهدف.');}
  else if(achievement<75){risk+=40;reasons.push('التقدم موجود لكنه ما زال دون ثلاثة أرباع التحسن المطلوب.');}
  else if(achievement<90){risk+=22;reasons.push('التقدم جيد لكنه لم يصل بعد إلى المستوى القريب من المستهدف.');}
  if(scheduleProgress!==null&&achievement+20<scheduleProgress&&!tp.targetReached){risk+=15;reasons.push(`التقدم الفعلي متأخر عن التقدم الزمني المتوقع للخطة (زمنيًا ${Math.round(scheduleProgress)}٪).`)}
 }
 if(overdue){risk+=25;reasons.push('انتهى الموعد المستهدف والبند غير مكتمل.');}
 if(!x.evidence&&x.status==='done'){risk+=10;reasons.push('البند مكتمل لكن الشاهد غير موثق في الوصف.');}
 if(risk>=45&&!x.rootCause)reasons.push('لم يسجل سبب جذري بعد؛ يلزم التحقق من سبب قابل للتدخل قبل تكرار الإجراء.');
 let label='لم يبدأ';
 if(achievement!==null){label=tp.targetReached?'متحقق/متجاوز':achievement>=90?'قريب جدًا من المستهدف':achievement>=75?'تقدم جيد':achievement>=50?'متعثر':'حرج';}
 const action=risk>=70?'إجراء تصحيحي عاجل بعد تثبيت السبب الجذري، مع نقطة قياس قصيرة':risk>=45?'تعديل الإجراء وفق السبب وتحديد متابعة قريبة':risk>=25?'متابعة لصيقة واستكمال القياس والشواهد':'استدامة الإجراء وتوثيق عناصر نجاحه';
 return{baseline,target,actual,achievement,targetAttainment:tp.targetAttainment,targetReached:tp.targetReached,gap:tp.gap,calculationMethod:tp.method,scheduleProgress,risk:clamp(risk),overdue,label,reasons,action};
}
function operationalSummary(state){
 const items=state.operationalPlan||[],analyses=items.map(x=>({item:x,analysis:operationalItem(x)}));
 const weighted=analyses.filter(x=>x.analysis.achievement!==null),sumW=weighted.reduce((s,x)=>s+Math.max(1,N(x.item.weight)||1),0);
 const achievement=sumW?weighted.reduce((s,x)=>s+clamp(x.analysis.achievement,0,120)*Math.max(1,N(x.item.weight)||1),0)/sumW:0;
 return{items:analyses,achievement,completed:items.filter(x=>x.status==='done').length,atRisk:analyses.filter(x=>x.analysis.risk>=45).length,overdue:analyses.filter(x=>x.analysis.overdue).length};
}
function satisfactionSummary(state){
 const rows=state.satisfaction||[];if(!rows.length)return{avg:0,responses:0,low:null,trend:null};
 const responses=rows.reduce((n,x)=>n+N(x.responses),0),score=responses?rows.reduce((n,x)=>n+N(x.score)*N(x.responses),0)/responses:avg(rows.map(x=>N(x.score)));
 const sorted=[...rows].sort((a,b)=>(a.date||'').localeCompare(b.date||''));let trend=null;if(sorted.length>=2)trend=N(sorted.at(-1).score)-N(sorted.at(-2).score);
 return{avg:score,responses,low:[...rows].sort((a,b)=>N(a.score)-N(b.score))[0],trend};
}
function satisfactionItem(x){
 const score=has(x.score)?N(x.score):null,responses=N(x.responses),target=85;let risk=0,reasons=[];
 if(score===null){risk+=35;reasons.push('لا توجد درجة رضا قابلة للتحليل.')}else if(score<60){risk+=75;reasons.push(`الرضا منخفض (${score.toFixed(1)}٪).`)}else if(score<75){risk+=55;reasons.push(`الرضا دون المستوى المرغوب (${score.toFixed(1)}٪).`)}else if(score<85){risk+=30;reasons.push(`الرضا جيد لكنه دون المستهدف الداخلي ${target}٪.`)}
 if(responses===0){risk+=12;reasons.push('عدد الاستجابات غير موثق.')}
 return{score,responses,target,risk:clamp(risk),label:score===null?'غير مقاس':score>=90?'مرتفع جدًا':score>=85?'مرتفع':score>=75?'جيد يحتاج تحسينًا':'أولوية تحسين',reasons,action:risk>=45?'تحليل المحور الأدنى والملاحظات المتكررة وتنفيذ تحسين واحد ثم إعادة القياس':'استدامة نقاط القوة ومراقبة الاتجاه'};
}
function schoolPlanItem(x){
 const ratio=has(x.targetCount)&&N(x.targetCount)>0&&has(x.actualCount)?N(x.actualCount)/N(x.targetCount)*100:null;
 const delta=has(x.pre)&&has(x.post)?N(x.post)-N(x.pre):null,overdue=!!(x.date&&x.status!=='done'&&x.date<today());let risk=0,reasons=[];
 if(ratio!==null&&ratio<75){risk+=42;reasons.push(`الوصول للفئة المستهدفة بلغ ${ratio.toFixed(1)}٪ فقط.`)}
 if(x.status==='done'&&!has(x.post)&&has(x.pre)){risk+=32;reasons.push('البرنامج مكتمل دون قياس بعدي للأثر.')}
 if(delta!==null&&delta<=0){risk+=45;reasons.push('القياس البعدي لم يظهر تحسنًا عن القبلي.')}else if(delta!==null&&delta<10){risk+=22;reasons.push(`الأثر محدود (+${delta.toFixed(1)} نقطة).`)}
 if(overdue){risk+=25;reasons.push('موعد التنفيذ مضى والبرنامج غير مكتمل.')}
 const label=risk>=70?'حرج':risk>=45?'يحتاج تعديلًا':risk>=25?'يحتاج متابعة':'مستقر';
 const action=risk>=45?'مراجعة تصميم البرنامج والفئة ومؤشر النجاح، ثم تعديل التنفيذ وإعادة القياس':'استدامة البرنامج مع توثيق عناصر النجاح وقياس الأثر';
 return{participationRatio:ratio,delta,overdue,risk:clamp(risk),label,reasons,action};
}
function professionalItem(x){
 const delta=has(x.pre)&&has(x.post)?N(x.post)-N(x.pre):null,overdue=!!(x.date&&x.status!=='done'&&x.date<today());let risk=0,reasons=[];
 if(x.status==='done'&&!has(x.post)){risk+=38;reasons.push('تم التنفيذ دون قياس بعدي؛ لا يمكن إثبات الأثر بعد.')}
 if(delta!==null&&delta<=0){risk+=55;reasons.push('لم يظهر تحسن في القياس بعد النشاط المهني.')}else if(delta!==null&&delta<10){risk+=25;reasons.push(`الأثر المعرفي محدود (+${delta.toFixed(1)} نقطة).`)}
 if(overdue){risk+=25;reasons.push('موعد النشاط مضى ولم يسجل كمنفذ.')}
 if(x.status==='done'&&!N(x.participants)){risk+=8;reasons.push('عدد المستفيدين غير موثق.')}
 const label=risk>=70?'أثر ضعيف':risk>=45?'يحتاج تعديلًا':risk>=25?'يحتاج استكمال قياس':'مستقر';
 return{delta,overdue,risk:clamp(risk),label,reasons,action:risk>=45?'ربط النشاط باحتياج محدد وقياس انتقال أثره إلى الممارسة ثم تعديل التدخل':'استدامة الممارسة ومتابعة أثرها في الأداء'};
}
function eventItem(x){
 const ratio=has(x.targetCount)&&N(x.targetCount)>0&&has(x.actualCount)?N(x.actualCount)/N(x.targetCount)*100:null,impact=has(x.impactScore)?N(x.impactScore):null,sat=has(x.satisfactionScore)?N(x.satisfactionScore):null,overdue=!!(x.date&&x.status!=='done'&&x.date<today());let risk=0,reasons=[];
 if(ratio!==null&&ratio<70){risk+=35;reasons.push(`المشاركة بلغت ${ratio.toFixed(1)}٪ من المستهدف.`)}if(impact!==null&&impact<70){risk+=45;reasons.push(`تحقق الهدف منخفض (${impact.toFixed(1)}٪).`)}if(sat!==null&&sat<80){risk+=25;reasons.push(`رضا المستفيدين منخفض نسبيًا (${sat.toFixed(1)}٪).`)}if(overdue){risk+=25;reasons.push('موعد الفعالية مضى ولم تكتمل.')}if(x.status==='done'&&impact===null){risk+=20;reasons.push('الفعالية مكتملة دون قياس واضح لتحقق الهدف.')}
 const label=risk>=70?'حرج':risk>=45?'يحتاج تطويرًا':risk>=25?'متابعة':'مستقر';
 return{participationRatio:ratio,impact,satisfaction:sat,overdue,risk:clamp(risk),label,reasons,action:risk>=45?'تحليل المشاركة والأثر وتعديل تصميم التفعيل أو قنوات الوصول ثم إعادة القياس':'استدامة عناصر النجاح وتوثيقها'};
}
function treatmentItem(x){
 const baseline=has(x.baseline)?N(x.baseline):null,target=has(x.target)?N(x.target):null,post=has(x.post)?N(x.post):null,delta=baseline!==null&&post!==null?post-baseline:null;let risk=0,reasons=[];
 if(x.status==='done'&&post===null){risk+=55;reasons.push('الخطة مكتملة دون قياس بعدي.')}
 if(post!==null&&target!==null&&post<target){risk+=post<=N(baseline)?75:50;reasons.push(`النتيجة البعدية ${post.toFixed(1)}٪ مقابل مستهدف ${target.toFixed(1)}٪.`)}
 if(delta!==null&&delta<=0){risk+=15;reasons.push('لم يظهر تحسن عن خط الأساس.')}
 const achieved=post!==null&&target!==null&&post>=target;
 return{baseline,target,post,delta,achieved,risk:clamp(risk),label:achieved?'حقق المستهدف':risk>=70?'غير فعّال':risk>=45?'يحتاج تعديلًا':'قيد القياس',reasons,action:achieved?'استدامة التدخل وتوثيق الممارسة الفعالة':'تحليل أخطاء الفئة المستهدفة وتغيير الاستراتيجية أو الجرعة ثم قياس قصير'};
}
function evidenceItem(e){const score=N(e.score);return{score,risk:score<30?75:score<45?58:score<65?32:10,label:score>=70?'قوي':score>=45?'مقبول يحتاج تعزيزًا':'ضعيف الارتباط',reasons:score<45?[`درجة ملاءمة الشاهد ${score.toFixed(1)}٪؛ يحتاج استكمالًا أو شاهدًا مباشرًا.`]:[],action:score<45?'تحديد العنصر غير المثبت واستكمال الشاهد بنتيجة أو متابعة أو قياس أثر':'الحفاظ على الشاهد وربطه بالمؤشرات التي يخدمها'};}
function manualSwot(state,type){return(state.manualSwot?.[type]||[]).map(x=>typeof x==='string'?x:x.text).filter(Boolean)}
function swot(state,standards){
 const A=assessmentSummary(state,standards),O=operationalSummary(state),Sat=satisfactionSummary(state),strengths=[],weaknesses=[];
 A.domains.forEach(d=>{if(d.completion>=60&&d.score>=80)strengths.push(`قوة في مجال ${d.title} (${d.score.toFixed(1)}٪) مع مستوى بيانات يسمح بقراءة موثوقة نسبيًا.`);if(d.completion>=40&&d.score<65)weaknesses.push(`انخفاض في مجال ${d.title} (${d.score.toFixed(1)}٪) يحتاج تحليل المؤشرات الأدنى داخله.`)});
 (state.nafs||[]).forEach(r=>{const a=nafsRecord(r);if(a.delta!==null&&a.delta>=5&&a.gapTarget>=-5)strengths.push(`تحسن ملحوظ في نافس (${r.grade||''} / ${r.subject||''}) بمقدار ${a.delta.toFixed(1)} نقطة.`);if(a.severity>=55)weaknesses.push(`فجوة ذات أولوية في نتائج نافس (${r.grade||''} / ${r.subject||''}): ${a.status}.`)});
 if(Sat.avg>=85&&Sat.responses>0)strengths.push(`رضا المستفيدين مرتفع (${Sat.avg.toFixed(1)}٪) ويمكن استدامة الممارسات الأعلى تقييمًا.`);else if(Sat.avg>0&&Sat.avg<80)weaknesses.push(`رضا المستفيدين (${Sat.avg.toFixed(1)}٪) يكشف ضعفًا داخليًا في خدمة أو تواصل يحتاج معالجة.`);
 if(O.achievement>=90&&O.items.length)strengths.push(`الخطة التشغيلية تحقق تقدمًا وزنيًا مرتفعًا نحو مستهدفاتها (${O.achievement.toFixed(1)}٪).`);if(O.atRisk)weaknesses.push(`يوجد ${O.atRisk} بند/بنود تشغيلية متعثرة أو عالية المخاطر.`);
 const successful=(state.improvements||[]).filter(x=>improvementImpact(x).achieved);if(successful.length)strengths.push(`وجود ${successful.length} خطة/خطط تحسين حققت مستهدفها يمثل قدرة داخلية مثبتة على التحسين.`);
 const pdSuccess=(state.professional||[]).filter(x=>{const a=professionalItem(x);return a.delta!==null&&a.delta>=10});if(pdSuccess.length)strengths.push(`أنشطة تطوير مهني أظهرت أثرًا إيجابيًا في ${pdSuccess.length} حالة/حالات.`);
 const unmeasured=(state.improvements||[]).filter(x=>x.status==='done'&&!has(x.post));if(unmeasured.length)weaknesses.push(`وجود ${unmeasured.length} إجراء/إجراءات تحسين مكتملة دون قياس بعدي يضعف إثبات الأثر.`);
 strengths.push(...manualSwot(state,'strengths'));weaknesses.push(...manualSwot(state,'weaknesses'));
 // O و T عوامل خارجية فقط؛ لا تستخرج من مشكلات المدرسة الداخلية آليًا.
 const opportunities=manualSwot(state,'opportunities'),threats=manualSwot(state,'threats');
 return{strengths:unique(strengths).slice(0,12),weaknesses:unique(weaknesses).slice(0,12),opportunities:unique(opportunities).slice(0,12),threats:unique(threats).slice(0,12),methodNote:'S و W عوامل داخلية تستخلص من بيانات المدرسة، أما O و T فهما عوامل خارجية تُدخل من تحليل البيئة المحيطة ثم يستخدمها المحرك في بناء الاستراتيجيات.'};
}
function topicOf(p){
 if(p.topic&&TOPICS[p.topic])return p.topic;
 const text=`${p.title||''} ${p.reason||''} ${p.action||''}`.toLowerCase();
 let best='general',score=0;
 for(const [id,t] of Object.entries(TOPICS)){if(id==='general')continue;const hits=t.keywords.filter(k=>text.includes(k.toLowerCase())).length;if(hits>score){score=hits;best=id}}
 return best;
}
function priorities(state,standards){
 const list=[],A=assessmentSummary(state,standards);
 A.rows.filter(x=>x.level>0&&x.level<=2).forEach(x=>list.push({id:`assessment:${x.i.id}`,source:'assessment',sourceId:x.i.id,title:x.i.text,score:x.level===1?86:68,reason:`التقدير الداخلي ${x.level}/٤${x.evidence.length?'':' ولا توجد شواهد مرتبطة.'}`,action:'تحليل الفجوة والشواهد وتحديد السبب الجذري ثم إنشاء إجراء تحسين قابل للقياس.',pre:x.level*25,target:80,topic:topicOf({title:x.i.text,reason:x.i.standardTitle})}));
 (state.nafs||[]).forEach(r=>{const a=nafsRecord(r),topic=r.subject==='reading'?'reading':r.subject==='math'?'math':r.subject==='science'?'science':'general';if(a.severity>=35)list.push({id:`nafs:${r.id}`,source:'nafs',sourceId:r.id,title:`نافس: ${r.grade||''} — ${r.subject||''}`,score:Math.max(45,a.severity),reason:a.reasons.join(' '),action:'تحليل نواتج التعلم الأدنى وبناء تدخل علاجي ثم قياس بعدي.',pre:a.school,target:a.target,targetKind:a.targetKind,topic})});
 operationalSummary(state).items.forEach(({item,analysis})=>{if(analysis.risk>=35)list.push({id:`operational:${item.id}`,source:'operational',sourceId:item.id,title:`الخطة التشغيلية: ${item.title}`,score:analysis.risk,reason:analysis.reasons.join(' '),action:analysis.action,pre:analysis.actual??'',target:analysis.target??'',topic:topicOf({title:`${item.axis} ${item.title} ${item.kpi}`})})});
 const Sat=satisfactionSummary(state);if(Sat.avg>0&&Sat.avg<82)list.push({id:'satisfaction:overall',source:'satisfaction',sourceId:Sat.low?.id||'',title:'تحسين رضا المستفيدين',score:clamp((85-Sat.avg)*4+35),reason:`متوسط الرضا ${Sat.avg.toFixed(1)}٪ وأقل قياس هو ${Sat.low?.title||'غير محدد'}.`,action:'تحليل الملاحظات المتكررة وتنفيذ تحسين خدمي ثم إعادة القياس.',pre:Sat.avg,target:85,topic:'satisfaction'});
 (state.improvements||[]).forEach(x=>{const im=improvementImpact(x);if(x.status==='done'&&im.post!==null&&!im.achieved)list.push({id:`improvement:${x.id}`,source:'improvement',sourceId:x.id,title:`مراجعة خطة تحسين: ${x.title}`,score:im.delta!==null&&im.delta<=0?80:55,reason:`الخطة اكتملت ولكن ${im.effectiveness}.`,action:'مراجعة السبب الجذري وملاءمة التدخل قبل تكراره.',pre:im.post,target:im.target,topic:topicOf(x)})});
 (state.schoolPlans||[]).forEach(x=>{const a=schoolPlanItem(x);if(a.risk>=30)list.push({id:`schoolplan:${x.id}`,source:'schoolplan',sourceId:x.id,title:`برنامج مدرسي: ${x.title}`,score:a.risk,reason:a.reasons.join(' '),action:a.action,pre:has(x.post)?N(x.post):has(x.pre)?N(x.pre):'',target:80,topic:x.type==='guidance'?'guidance':x.type==='gifted'?'gifted':x.type==='activity'?'activity':topicOf(x)})});
 (state.professional||[]).forEach(x=>{const a=professionalItem(x),detected=topicOf(x);if(a.risk>=30)list.push({id:`professional:${x.id}`,source:'professional',sourceId:x.id,title:`تطوير مهني: ${x.title}`,score:a.risk,reason:a.reasons.join(' '),action:a.action,pre:has(x.post)?N(x.post):has(x.pre)?N(x.pre):'',target:85,topic:detected==='general'?'professional':detected})});
 (state.events||[]).forEach(x=>{const a=eventItem(x);if(a.risk>=30)list.push({id:`event:${x.id}`,source:'event',sourceId:x.id,title:`فعالية: ${x.title}`,score:a.risk,reason:a.reasons.join(' '),action:a.action,pre:a.impact??a.satisfaction??'',target:85,topic:topicOf(x)})});
 (state.evidence||[]).forEach(e=>{const a=evidenceItem(e);if(a.risk>=45)list.push({id:`evidence:${e.id}`,source:'evidence',sourceId:e.id,title:`شاهد يحتاج مراجعة: ${e.title}`,score:a.risk,reason:a.reasons.join(' '),action:a.action,pre:a.score,target:70,topic:'evidence'})});
 (state.treatmentPlans||[]).forEach(x=>{const a=treatmentItem(x);if(a.risk>=45)list.push({id:`treatment:${x.id}`,source:'treatment',sourceId:x.id,title:`خطة علاجية: ${x.outcome}`,score:a.risk,reason:a.reasons.join(' '),action:a.action,pre:a.post??a.baseline,target:a.target,topic:x.subject==='reading'?'reading':x.subject==='math'?'math':x.subject==='science'?'science':'assessment'})});
 list.forEach(p=>{if(!p.topic)p.topic=topicOf(p)});
 return list.sort((a,b)=>b.score-a.score).slice(0,40);
}
function rootCauseGuide(topic){
 const guides={
  reading:{causes:['عدم تحديد المهارة القرائية الدقيقة المتعثرة','ضعف المواءمة بين التدريس ونواتج القراءة المقاسة','قلة التدريب على الاستنتاج والفهم العميق أو المفردات حسب النتيجة','عدم استخدام نتائج التشخيص لتجميع الطلاب حسب الاحتياج'],questions:['أي ناتج قراءة هو الأدنى تحديدًا؟','هل الضعف عام أم لدى فئة محددة؟','هل أداة القياس تقيس المهارة نفسها قبل وبعد؟','ما الممارسة الصفية التي ستتغير لمعالجة هذا الناتج؟']},
  math:{causes:['فجوات في المهارات السابقة اللازمة للناتج الحالي','أخطاء مفاهيمية لم تعالج بالتشخيص','ضعف التمثيل وحل المسألة والتبرير','تدخل واحد لجميع الطلاب رغم اختلاف نوع الخطأ'],questions:['ما نوع الخطأ الأكثر تكرارًا؟','ما المهارة السابقة اللازمة قبل المهارة الحالية؟','هل الطلاب يحتاجون نماذج محسوسة/بصرية أم تدريبًا إجرائيًا؟','هل القياس البعدي مماثل في الصعوبة للقبلي؟']},
  science:{causes:['ضعف فهم المفهوم العلمي أو تفسير البيانات','قلة الربط بين التجربة والمفهوم','صعوبة قراءة النصوص والرسوم العلمية','عدم تحليل الأخطاء بحسب فروع المحتوى'],questions:['هل الضعف مفاهيمي أم في الاستقصاء وتفسير البيانات؟','أي فرع من العلوم يظهر الفجوة؟','هل توجد أنشطة تطبيقية مرتبطة بالمفهوم؟','ما الدليل على انتقال التعلم إلى سؤال جديد؟']},
  teaching:{causes:['عدم اتساق الاستراتيجية مع الاحتياج الفعلي للمتعلمين','ضعف التمايز ومراعاة الفروق','قلة المتابعة الصفية والتغذية الراجعة','فجوة بين التخطيط والممارسة'],questions:['ما السلوك التدريسي المراد تغييره؟','ما الدليل الصفي على المشكلة؟','أي فئة من المتعلمين لا تصلها الخبرة المناسبة؟','كيف سيقاس تغير الممارسة؟']},
  assessment:{causes:['أداة تقويم لا تقيس الناتج المقصود بدقة','تحليل النتائج دون تحويلها إلى تدخل','ضعف التغذية الراجعة والمتابعة','عدم توحيد خط الأساس والقياس البعدي'],questions:['هل الأداة مرتبطة بالناتج؟','هل تم تحليل الأخطاء لا المتوسط فقط؟','ما القرار الذي اتخذ بسبب النتيجة؟','هل القياس البعدي يقارن بنفس المؤشر؟']},
  operational:{causes:['مؤشر أداء غير محدد أو غير قابل للقياس','عدم وضوح المسؤولية أو الموارد','جدول زمني لا يتضمن نقاط متابعة','الإجراء لا يعالج السبب الحقيقي للفجوة'],questions:['هل KPI يقيس النتيجة أم مجرد التنفيذ؟','من يملك القرار والموارد؟','أين انحرف التنفيذ عن الخطة؟','ما السبب الذي لو عولج سيغير النتيجة مباشرة؟']},
  professional:{causes:['التدريب غير مبني على احتياج محدد','قياس الحضور بدل انتقال أثر التدريب للممارسة','غياب المتابعة بعد الدورة','عدم ربط التدريب بنتائج الطلاب أو الممارسة الصفية'],questions:['ما الاحتياج الذي استهدفه التدريب؟','ما السلوك المهني المتوقع بعده؟','كيف سنرصد التطبيق؟','هل تغير أداء الطلاب/المستفيدين بعد التطبيق؟']},
  satisfaction:{causes:['مشكلة في زمن الاستجابة أو وضوح التواصل','اختلاف توقعات المستفيدين عن الخدمة','تكرار ملاحظة لم تتحول إلى إجراء','قياس عام يخفي محورًا منخفضًا'],questions:['ما البند الأقل رضا؟','ما أكثر ملاحظة متكررة؟','هل المشكلة في خدمة محددة أم قناة تواصل؟','ما التغيير الصغير الذي يمكن قياس أثره سريعًا؟']},
  evidence:{causes:['الشاهد يثبت التنفيذ ولا يثبت النتيجة','الشاهد غير مباشر أو قديم','غياب تاريخ أو جهة أو نتيجة قابلة للتحقق','عدم ربط الشاهد بعبارة المؤشر كاملة'],questions:['ماذا يثبت هذا الملف تحديدًا؟','أي جزء من المؤشر لا يثبته؟','هل توجد نتيجة/متابعة/قياس أثر؟','هل الشاهد حديث ومحدد المصدر؟']},
  discipline:{causes:['عدم تحديد نمط الغياب/التأخر والفئات الأكثر تكرارًا','الاعتماد على إجراء توعوي دون متابعة','ضعف الشراكة الأسرية في الحالات المتكررة','غياب تعزيز السلوك الإيجابي'],questions:['متى وأين تتكرر المشكلة؟','من الفئة الأعلى؟','ما السبب القابل للتدخل؟','هل انخفضت الحالات بعد الإجراء؟']},
  guidance:{causes:['البرنامج لا يبدأ من احتياج مقاس','الفئة المستهدفة واسعة وغير محددة','التركيز على التنفيذ دون أثر سلوكي/نفسي قابل للقياس','ضعف المتابعة بعد البرنامج'],questions:['ما الاحتياج المثبت؟','من الفئة المستهدفة تحديدًا؟','ما مؤشر التغير المتوقع؟','متى سيعاد القياس؟']},
  gifted:{causes:['التركيز على الترشيح دون استمرارية الرعاية','ضعف ربط الموهوب بالبرنامج المناسب','قلة فرص الإثراء أو المتابعة','قياس الإنجاز بعدد المشاركات فقط'],questions:['كم طالبًا انتقل من الكشف إلى الرعاية؟','ما مجال الموهبة؟','ما البرنامج الأنسب؟','ما أثر الرعاية على الأداء/الإنجاز؟']},
  family:{causes:['قنوات تواصل لا تناسب الأسرة','المشاركة تقتصر على الحضور ولا تمتد لدعم التعلم','عدم تحليل الفئات الأقل مشاركة','ضعف التغذية الراجعة للأسرة'],questions:['أي فئة أسرية أقل مشاركة؟','ما نوع المشاركة المطلوبة؟','هل الرسائل مرتبطة بتعلم الأبناء؟','كيف سيقاس أثر المشاركة؟']},
  safety:{causes:['معالجة الملاحظة بعد وقوعها بدل المتابعة الوقائية','نقص التوثيق الدوري للفحص والصيانة','عدم إغلاق البلاغات ضمن زمن محدد','عدم تحليل تكرار مواقع الخطر'],questions:['ما الخطر الأعلى أولوية؟','متى فُحص آخر مرة؟','ما زمن إغلاق البلاغ؟','هل تكررت الملاحظة في الموقع نفسه؟']},
  general:{causes:['عدم كفاية البيانات لتحديد سبب واحد','الإجراء الحالي قد يعالج العرض لا السبب','غياب قياس قبلي/بعدي موحد','عدم تحديد مسؤول ومؤشر نجاح واضح'],questions:['ماذا يحدث تحديدًا؟','ما الدليل؟','لماذا يحدث؟','ما التغيير الذي إذا حدث سيتحسن المؤشر؟']}
 };
 return guides[topic]||guides.general;
}
function solutionProfile(topic,p={}){
 const profiles={
  reading:{owner:'فريق التحصيل واللغة العربية',duration:'٣–٦ أسابيع',kpi:'ارتفاع ناتج القراءة المستهدف في قياس بعدي مماثل وتحسن الفئة الأدنى',actions:['تحليل أخطاء القراءة حسب الناتج وتحديد الفئة المستهدفة.','تنفيذ تدخل قصير ومتكرر على المهارة الأدنى مع نمذجة وممارسة موجهة.','دعم المعلمات بحصة تطبيقية/زيارة تبادلية مرتبطة بالناتج عند الحاجة.','قياس بعدي وتحليل الفرق واتخاذ قرار الاستمرار أو تغيير التدخل.']},
  math:{owner:'فريق التحصيل والرياضيات',duration:'٣–٦ أسابيع',kpi:'انخفاض الأخطاء المفاهيمية وارتفاع إتقان المهارة المستهدفة في القياس البعدي',actions:['تحليل أنواع الأخطاء وتحديد المهارة السابقة المفقودة.','تجميع الطلاب حسب نوع الخطأ وتقديم تدخل متدرج محسوس/بصري/رمزي بحسب الاحتياج.','تدريب مركز على حل المسألة والتبرير عندما تكون المشكلة تطبيقية.','إعادة القياس بسؤال مكافئ وتحليل انتقال التعلم.']},
  science:{owner:'فريق التحصيل والعلوم',duration:'٣–٦ أسابيع',kpi:'تحسن إتقان المفهوم أو تفسير البيانات العلمية في قياس بعدي',actions:['تحديد هل الفجوة مفاهيمية أم في الاستقصاء/تفسير البيانات.','تنفيذ تعلم تطبيقي أو تجربة/نموذج يربط الظاهرة بالمفهوم.','تدريب على قراءة الرسوم والجداول والنص العلمي عند الحاجة.','قياس بعدي على موقف جديد وتحليل أثر التدخل.']},
  operational:{owner:'مالك المؤشر + فريق التحسين',duration:'حسب الموعد مع نقطة متابعة خلال أسبوعين',kpi:'تحسن نسبة التقدم من خط الأساس إلى المستهدف وإغلاق سبب التعثر',actions:['تثبيت السبب الجذري بدليل وليس بالانطباع.','تعديل الإجراء أو الموارد أو المسؤولية أو الجدول وفق السبب.','تحديد قياس مرحلي قريب ومؤشر إنذار مبكر.','توثيق النتيجة والشاهد واتخاذ قرار الاستمرار/الإيقاف.']},
  professional:{owner:'مسؤول التطوير المهني',duration:'٢–٤ أسابيع مع متابعة تطبيق',kpi:'انتقال أثر التدريب إلى الممارسة وظهور تحسن قابل للقياس',actions:['ربط النشاط باحتياج مهني محدد مصدره بيانات المدرسة.','تحديد ممارسة واحدة متوقعة بعد التدريب.','متابعة التطبيق بزيارة/حصة تطبيقية أو عينة أعمال.','قياس أثر الممارسة على المستفيدين ثم قرار الاستدامة.']},
  satisfaction:{owner:'فريق الجودة/الخدمة',duration:'٢–٤ أسابيع',kpi:'ارتفاع المحور الأدنى في إعادة قياس الرضا وانخفاض تكرار الملاحظة',actions:['تصنيف الملاحظات وتحديد المحور الأدنى والأكثر تكرارًا.','اختيار سبب واحد قابل للتدخل وتنفيذ تحسين واضح.','إبلاغ المستفيدين بالتغيير لتوحيد التوقعات.','إعادة القياس ومقارنة البند نفسه قبل وبعد.']},
  assessment:{owner:'فريق التعليم والتعلم',duration:'٢–٤ أسابيع',kpi:'تحسن جودة القياس واستخدام نتائجه في تدخل موثق',actions:['تدقيق مواءمة أداة القياس مع ناتج التعلم.','تحليل الأخطاء والفئات بدل الاكتفاء بالمتوسط.','تحويل النتيجة إلى تدخل محدد مع قبلي ومستهدف.','قياس بعدي وتوثيق القرار الناتج عن البيانات.']},
  evidence:{owner:'فريق التقويم الذاتي',duration:'أسبوعان',kpi:'ارتفاع ملاءمة الشاهد واكتمال عناصر التنفيذ والنتيجة والمتابعة',actions:['مطابقة الشاهد بعبارة المؤشر وتحديد العنصر غير المثبت.','استكمال الدليل بنتيجة أو متابعة أو قياس أثر.','توثيق التاريخ والمصدر والارتباط بالمؤشر.','إعادة تحليل الملاءمة بعد الاستكمال.']},
  guidance:{owner:'التوجيه الطلابي',duration:'٣–٦ أسابيع',kpi:'تحسن المؤشر السلوكي/النفسي المستهدف لدى الفئة المحددة',actions:['تحديد الاحتياج والفئة المستهدفة من بيانات فعلية.','اختيار تدخل مباشر يناسب السبب لا مجرد نشاط عام.','إشراك الأسرة/المعلم عند الحاجة مع حماية الخصوصية.','قياس التغير بعد التنفيذ وتعديل البرنامج وفق النتيجة.']},
  gifted:{owner:'مسؤول الموهوبين',duration:'فصل دراسي',kpi:'ارتفاع الانتقال من الكشف إلى الرعاية والمشاركة والإنجاز النوعي',actions:['تحليل مسار الطلبة من الترشيح والكشف إلى الرعاية.','ربط كل فئة بفرصة إثرائية مناسبة للمجال.','متابعة المشاركة والمنتج/الإنجاز لا التسجيل فقط.','قياس أثر الرعاية وبناء توصية الاستمرار.']},
  activity:{owner:'مسؤول النشاط',duration:'حسب البرنامج',kpi:'تحقق هدف النشاط ومشاركة الفئة المستهدفة وظهور أثر مقاس',actions:['ربط النشاط باحتياج أو هدف مدرسي واضح.','تحديد مؤشر أثر قبل التنفيذ لا بعده.','تنويع قنوات المشاركة والوصول للفئات الأقل مشاركة.','قياس الأثر والرضا وتحويل النتائج إلى تحسين للدورة التالية.']},
  family:{owner:'فريق الشراكة والتوجيه',duration:'٣–٦ أسابيع',kpi:'ارتفاع المشاركة الأسرية في السلوك/التعلم المستهدف',actions:['تحديد الفئة الأسرية الأقل مشاركة وسبب العزوف.','اختيار قناة ووقت ونوع مشاركة مناسب.','ربط التواصل بهدف تعلم أو دعم محدد.','قياس المشاركة والأثر وإعادة تصميم القناة عند الحاجة.']},
  safety:{owner:'فريق الأمن والسلامة',duration:'فوري–٤ أسابيع حسب الخطر',kpi:'إغلاق المخاطر ضمن الزمن المحدد وعدم تكرار الملاحظة',actions:['ترتيب المخاطر حسب الشدة والاحتمال.','إغلاق السبب المباشر وتحديد إجراء وقائي.','توثيق الفحص والصيانة وزمن الاستجابة.','إعادة الفحص والتحقق من عدم تكرار الخطر.']},
  teaching:{owner:'فريق التعليم والتعلم',duration:'٣–٦ أسابيع',kpi:'تغير ممارسة تدريسية محددة وظهور أثر في تعلم الطلاب',actions:['تحديد الممارسة الصفية المرتبطة بالفجوة.','تنفيذ دعم مهني تطبيقي قصير ومحدد.','متابعة التطبيق بعينة صفية/أعمال طلاب.','قياس أثر التغير على الناتج المستهدف.']},
  general:{owner:'فريق التحسين',duration:'٢–٤ أسابيع',kpi:'تحسن القياس البعدي وتحقيق المستهدف مع شاهد موثق',actions:['تحديد المشكلة بدقة وجمع دليل كافٍ.','اختبار السبب الجذري واختيار تدخل واحد قابل للقياس.','تنفيذ الإجراء مع نقطة متابعة قريبة.','إعادة القياس واتخاذ قرار الاستمرار أو التعديل.']}
 };
 return profiles[topic]||profiles.general;
}
function solutionFor(p){
 const topic=topicOf(p),profile=solutionProfile(topic,p),base={title:p.title,problem:p.reason,priority:p.score>=75?'عاجلة':p.score>=55?'مرتفعة':'متوسطة',target:p.target||80,baseline:p.pre,owner:profile.owner,duration:profile.duration,kpi:profile.kpi,topic,topicLabel:TOPICS[topic]?.label||TOPICS.general.label};
 return{...base,actions:profile.actions};
}
function crossAnalysis(state,standards){
 const ps=priorities(state,standards),groups=new Map();
 ps.forEach(p=>{
  const topic=topicOf(p);
  const key=topic==='general'?`general:${p.id}`:topic;
  if(!groups.has(key))groups.set(key,[]);
  groups.get(key).push({...p,topic});
 });
 const cases=[...groups.entries()].map(([key,signals])=>{
  signals.sort((a,b)=>b.score-a.score);
  const topic=signals[0].topic,sources=unique(signals.map(x=>x.source)),primary=signals[0],guide=rootCauseGuide(topic),profile=solutionProfile(topic,primary);
  const score=clamp(primary.score+Math.min(18,(sources.length-1)*7)+Math.min(10,(signals.length-1)*2));
  const confidence=sources.length>=3||signals.length>=4?'مرتفعة':sources.length>=2||signals.length>=2?'متوسطة':'محدودة';
  const diagnosis=signals.length>1?`تتقاطع ${signals.length} إشارة من ${sources.length} مصدر/مصادر حول «${TOPICS[topic]?.label||'قضية مدرسية'}». هذا الترابط يرفع أولوية التحقق، لكنه لا يثبت سببًا واحدًا قبل فحص الأسباب المحتملة.`:`ظهرت إشارة واحدة حول «${TOPICS[topic]?.label||'قضية مدرسية'}». يلزم دعمها بمصدر ثانٍ أو قياس إضافي قبل بناء تشخيص قوي.`;
  return{id:`case:${key}`,topic,title:TOPICS[topic]?.label||primary.title,score,confidence,signals,sources,primary,diagnosis,potentialCauses:guide.causes,questions:guide.questions,actions:profile.actions,kpi:profile.kpi,owner:profile.owner,duration:profile.duration,baseline:primary.pre,target:primary.target||80};
 }).sort((a,b)=>b.score-a.score).slice(0,15);
 return cases;
}
function contradictions(state,standards){
 const out=[],A=assessmentSummary(state,standards);
 A.rows.forEach(row=>{if(row.level===4&&row.evidence.length&&row.evidence.every(e=>evidenceScoreForIndicator(e,row.i.id)<45))out.push({type:'assessment-evidence',title:row.i.text,message:'التقييم الداخلي مرتفع (٤/٤) لكن جميع الشواهد المرتبطة بهذا المؤشر ضعيفة الملاءمة؛ راجعي التقدير أو استكملي الدليل.'})});
 (state.operationalPlan||[]).forEach(x=>{const a=operationalItem(x);if(x.status==='done'&&a.achievement!==null&&a.achievement<75)out.push({type:'operational-status',title:x.title,message:'البند مسجل «مكتمل» لكن التقدم المحسوب من خط الأساس إلى المستهدف أقل من ٧٥٪.'})});
 (state.professional||[]).forEach(x=>{if(x.status==='done'&&!has(x.post))out.push({type:'professional-measure',title:x.title,message:'النشاط المهني مسجل منفذًا دون قياس بعدي؛ التنفيذ لا يساوي تحقق الأثر.'})});
 (state.improvements||[]).forEach(x=>{if(x.status==='done'&&!has(x.post))out.push({type:'improvement-measure',title:x.title,message:'خطة التحسين مغلقة دون قياس بعدي؛ لا يمكن الحكم على نجاحها.'})});
 (state.nafs||[]).forEach(r=>{const n=nafsRecord(r);if(n.severity>=55){const relevant=A.rows.filter(x=>x.level===4&&topicOf({title:x.i.text})===(r.subject==='reading'?'reading':r.subject==='math'?'math':'science'));if(relevant.length)out.push({type:'nafs-assessment',title:`نافس ${r.grade||''}/${r.subject||''}`,message:`نتيجة نافس تكشف فجوة مرتفعة بينما توجد ${relevant.length} مؤشرات ذات صلة مقدرة ٤/٤؛ يستحسن مراجعة اتساق التقدير مع النتائج الخارجية.`})}});
 return out.slice(0,12);
}
function reading(state,standards){
 const ps=priorities(state,standards),A=assessmentSummary(state,standards),O=operationalSummary(state),Sat=satisfactionSummary(state),cases=crossAnalysis(state,standards),cons=contradictions(state,standards);
 let headline='تحتاج المنصة إلى مزيد من البيانات لبناء قراءة مدرسية موثوقة.';
 if(cases.length)headline=`أعلى قضية مدرسية حاليًا: ${cases[0].title}. درجة الأولوية ${Math.round(cases[0].score)}/١٠٠، والثقة في التشخيص ${cases[0].confidence}.`;
 else if(A.completion>=80&&O.items.length)headline='البيانات الحالية لا تكشف قضية حرجة؛ التركيز الأنسب على الاستدامة واستكمال قياس الأثر.';
 const top=cases[0]||null;
 return{headline,priorities:ps,cases,contradictions:cons,assessment:A,operational:O,satisfaction:Sat,swot:swot(state,standards),fourQuestions:top?{what:top.diagnosis,why:top.potentialCauses[0]||'يحتاج تحققًا',do:top.actions[0]||'بناء تدخل قابل للقياس',success:top.kpi}:null};
}
window.SchoolBrain={
 config:{schoolBands:SCHOOL_BANDS,outcomeBands:OUTCOME_BANDS,topics:TOPICS},
 schoolClassification,outcomeClassification,assessmentSummary,nafsRecord,recommendedNafsTarget,recommendedOutcomeTarget,
 improvementImpact,targetProgress,operationalItem,operationalSummary,satisfactionSummary,satisfactionItem,schoolPlanItem,professionalItem,eventItem,treatmentItem,evidenceItem,
 swot,priorities,topicOf,rootCauseGuide,solutionFor,crossAnalysis,contradictions,reading
};
})();
