(function(){
  'use strict';

  const route=()=>((location.hash||'#dashboard').replace(/^#/,'').split('?')[0]||'dashboard');
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));

  const ROUTES={
    dashboard:{label:'الرئيسية',features:[['◎','نظرة شاملة'],['▥','مؤشرات المدرسة'],['✓','أولويات اليوم'],['↗','قرار وتحسين']]},
    intelligence:{label:'العقل المدرسي',features:[['◉','تشخيص مترابط'],['SWOT','تحليل علمي'],['↗','حلول قابلة للقياس'],['✓','متابعة الأثر']]},
    assessment:{label:'التقويم الذاتي',features:[['▦','مجالات ومعايير'],['✓','مؤشرات الأداء'],['▤','شواهد موثقة'],['↗','فجوات التحسين']]},
    operational:{label:'الخطة التشغيلية',features:[['KPI','مؤشرات واضحة'],['◌','خط أساس'],['◎','مستهدف'],['↗','متحقق وأثر']]},
    improvement:{label:'خطط التحسين',features:[['◉','تشخيص'],['→','إجراء علاجي'],['✓','متابعة'],['↗','قياس أثر']]},
    evidence:{label:'الشواهد',features:[['▤','توثيق منظم'],['✓','جودة الدليل'],['⛓','ربط بالمؤشر'],['◉','تحليل المحتوى']]},
    nafs:{label:'نافس',features:[['◉','قراءة'],['∑','رياضيات'],['⚗','علوم'],['↗','خطط علاجية']]},
    leadership:{label:'القيادة المدرسية',features:[['◎','رؤية واضحة وأهداف محددة'],['↗','تحسين التحصيل الأكاديمي'],['👥','تمكين المعلمين وتطويرهم'],['✓','بيئة مدرسية آمنة وجاذبة']]},
    guidance:{label:'التوجيه الطلابي',features:[['◎','تشخيص الاحتياج'],['♡','دعم ووقاية'],['✓','تدخل مناسب'],['↗','قياس الأثر']]},
    activity:{label:'النشاط الطلابي',features:[['★','مشاركة نوعية'],['👥','وصول عادل'],['🏆','إنجاز'],['↗','أثر مستدام']]},
    gifted:{label:'رعاية الموهوبين',features:[['◇','كشف وترشيح'],['✦','إثراء'],['⚙','ابتكار'],['🏆','إنجاز نوعي']]},
    health:{label:'الإرشاد الصحي',features:[['♡','احتياج صحي'],['✓','وقاية'],['☼','توعية'],['↗','أثر صحي']]},
    partnership:{label:'الشراكة المجتمعية',features:[['↔','شريك مناسب'],['✓','أدوار واضحة'],['◎','مؤشر نجاح'],['🌱','استدامة وأثر']]},
    volunteer:{label:'الأعمال التطوعية',features:[['♡','احتياج مجتمعي'],['◷','ساعات تطوعية'],['👥','متطوعون ومستفيدون'],['↗','أثر مجتمعي']]},
    ai:{label:'الذكاء الاصطناعي وساعة البرمجة',features:[['AI','مهارة رقمية'],['</>','تعلم بالممارسة'],['⚙','مشروع ومنتج'],['↗','قياس الإكمال والأثر']]},
    professional:{label:'التطوير المهني',features:[['▤','احتياج مهني'],['👥','مجتمعات تعلم'],['✓','تطبيق'],['↗','قياس الأثر']]},
    events:{label:'الفعاليات والمناسبات',features:[['▣','تخطيط'],['✓','تنفيذ'],['▤','توثيق'],['↗','قياس الأثر']]},
    satisfaction:{label:'رضا المستفيدين',features:[['☺','استبانات'],['▥','اتجاهات'],['◉','ملاحظات'],['↗','تحسين']]},
    reports:{label:'مركز التقارير',features:[['PDF','PDF'],['W','Word'],['X','Excel'],['▥','تقارير تنفيذية']]},
    settings:{label:'الإعدادات',features:[['⚙','بيانات المدرسة'],['⇩','نسخ احتياطي'],['✓','خصوصية'],['↻','تحديثات']]}
  };

  const topLinks=[
    ['dashboard','⌂','الرئيسية'],
    ['assessment','▦','التقويم'],
    ['reports','▥','التقارير'],
    ['evidence','▤','الشواهد'],
    ['operational','▣','التخطيط'],
    ['settings','⚙','الإعدادات']
  ];

  function go(id){
    if(!id)return;
    location.hash=id;
    try{window.scrollTo({top:0,behavior:'smooth'});}catch(_){window.scrollTo(0,0);}
  }

  function decorateTopbar(){
    const top=$('.topbar');
    if(!top)return;
    const r=route();
    let nav=$('.premium-top-nav',top);
    if(!nav){
      nav=document.createElement('nav');
      nav.className='premium-top-nav';
      nav.setAttribute('aria-label','التنقل السريع');
      const actions=$('.top-actions',top);
      top.insertBefore(nav,actions||null);
    }
    nav.innerHTML=topLinks.map(([id,icon,label])=>
      `<button type="button" class="premium-top-link ${r===id?'active':''}" data-v4-go="${id}"><span class="ptn-icon">${icon}</span><span>${label}</span></button>`
    ).join('');
  }

  function decorateSidebar(){
    const foot=$('.side-foot');
    if(!foot||foot.dataset.premiumReady==='1')return;
    foot.dataset.premiumReady='1';
    foot.innerHTML=`
      <div class="premium-side-card">
        <span class="psc-icon">🎧</span>
        <span><strong>الدعم الفني</strong><span>واجهة مساعدة سريعة وإرشادات الاستخدام</span></span>
      </div>
      <div class="premium-side-card">
        <span class="psc-icon">👩🏻‍💼</span>
        <span><strong>مسؤولة المنصة</strong><span>أ/ فاطمة هزازي</span></span>
      </div>`;
  }

  function decorateHero(){
    const hero=$('.hero-v4');
    if(!hero)return;
    const r=route(),meta=ROUTES[r]||ROUTES.dashboard;
    const copy=$('.hero-v4-copy',hero);
    const actions=$('.hero-actions',hero);
    if(copy && !$('.hero-feature-row',copy)){
      const row=document.createElement('div');
      row.className='hero-feature-row';
      row.innerHTML=(meta.features||[]).map(([icon,text])=>`<div class="hero-feature"><span>${icon}</span><strong>${text}</strong></div>`).join('');
      copy.insertBefore(row,actions||null);
    }
    const img=$('.hero-v4-art img',hero);
    if(img && r==='leadership' && !img.src.includes('leadership-hero.png')){
      img.src='assets/images/leadership-hero.png';
      img.alt='القيادة المدرسية وبيئة المدرسة';
    }
  }

  function reorderLeadership(){
    if(route()!=='leadership')return;
    const mod=$('.leadership-module');
    if(!mod||mod.dataset.premiumOrder==='1')return;
    const heads=$$(':scope > .section-head',mod);
    const roles=$(':scope > .leadership-roles',mod);
    const pillars=$(':scope > .leadership-pillars',mod);
    if(heads.length>=2 && roles && pillars){
      mod.insertBefore(heads[1],heads[0]);
      mod.insertBefore(roles,heads[0]);
    }
    mod.dataset.premiumOrder='1';
  }

  function moveLeadershipActions(){
    if(route()!=='leadership')return;
    const actions=$('.hero-v4 .hero-actions');
    const overview=$('.plan-overview');
    if(!actions||!overview)return;
    const metricGrid=overview.nextElementSibling;
    if(!metricGrid||!metricGrid.classList.contains('grid'))return;
    let dock=$('.premium-action-dock');
    if(!dock){
      dock=document.createElement('div');
      dock.className='premium-action-dock';
      metricGrid.insertAdjacentElement('afterend',dock);
    }
    dock.append(actions);
  }

  function addLeadershipAbout(){
    if(route()!=='leadership'||$('.premium-about'))return;
    const dock=$('.premium-action-dock');
    if(!dock)return;
    const about=document.createElement('div');
    about.className='premium-about';
    about.innerHTML=`<span class="pa-icon">ⓘ</span><div><h3>عن القيادة المدرسية</h3><p>القيادة الفاعلة تحول الرؤية إلى خطط قابلة للتنفيذ، وتربط القرارات ببيانات التحصيل والشواهد وقياس الأثر؛ لذلك بقيت جميع أدوات التحليل والتقارير الأصلية عاملة داخل هذه الواجهة.</p></div>`;
    dock.insertAdjacentElement('afterend',about);
  }

  function markRoute(){
    const r=route();
    document.body.dataset.v4Route=r;
    document.documentElement.dataset.platformVersion='4.2';
    $$('.side-link').forEach(a=>{
      const active=(a.getAttribute('href')||'')==='#'+r;
      a.classList.toggle('active',active);
      if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    });
  }

  let scheduled=false;
  function apply(){
    scheduled=false;
    markRoute();
    decorateTopbar();
    decorateSidebar();
    decorateHero();
    reorderLeadership();
    moveLeadershipActions();
    addLeadershipAbout();
  }
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(apply);
  }

  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-v4-go]');
    if(b){e.preventDefault();go(b.dataset.v4Go);}
  });

  window.addEventListener('hashchange',schedule);
  document.addEventListener('DOMContentLoaded',schedule);
  window.addEventListener('load',schedule);
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});

  if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost')){
    window.addEventListener('load',()=>{
      navigator.serviceWorker.register('./sw.js?v=4.2.0',{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{});
    });
  }
})();
