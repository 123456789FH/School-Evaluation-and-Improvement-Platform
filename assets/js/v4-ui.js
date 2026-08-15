(function(){
  'use strict';

  const route=()=>((location.hash||'#dashboard').replace(/^#/,'').split('?')[0]||'dashboard');
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));

  const ICONS={
    home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9 20v-6h6v6"/>',
    brain:'<path d="M9.5 4.5A3.5 3.5 0 0 0 6 8v.3A3.5 3.5 0 0 0 4 11.5 3.5 3.5 0 0 0 7.5 15H8v1.2A3.8 3.8 0 0 0 11.8 20H12V4.8A3.3 3.3 0 0 0 9.5 4.5Z"/><path d="M14.5 4.5A3.5 3.5 0 0 1 18 8v.3a3.5 3.5 0 0 1 2 3.2 3.5 3.5 0 0 1-3.5 3.5H16v1.2a3.8 3.8 0 0 1-3.8 3.8H12V4.8a3.3 3.3 0 0 1 2.5-.3Z"/><path d="M8 9.5h4M16 9.5h-4M8.5 14H12m3.5 0H12"/>',
    clipboard:'<rect x="5" y="4.5" width="14" height="16" rx="2"/><path d="M9 4.5V3h6v1.5M8 9h8M8 13h8M8 17h5"/>',
    calendar:'<rect x="3.5" y="5.5" width="17" height="15" rx="2"/><path d="M7 3v5M17 3v5M3.5 10h17M8 14h3M13 14h3M8 17h3"/>',
    target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 12 20 4M16 4h4v4"/>',
    clip:'<path d="m8.5 12.5 6.8-6.8a3 3 0 0 1 4.2 4.2l-8.8 8.8a5 5 0 0 1-7.1-7.1l8.4-8.4"/>',
    chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/><path d="m4 8 5-4 5 4 6-6"/>',
    users:'<circle cx="9" cy="8" r="3"/><path d="M3.5 20v-2a5.5 5.5 0 0 1 11 0v2"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5a4.5 4.5 0 0 1 4.5 4.5v1"/>',
    compass:'<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z"/>',
    palette:'<path d="M12 3a9 9 0 0 0 0 18h1.2a2 2 0 0 0 1.2-3.6 2 2 0 0 1 1.2-3.6H18a3 3 0 0 0 3-3A7.8 7.8 0 0 0 12 3Z"/><circle cx="7.5" cy="10" r=".8"/><circle cx="10" cy="6.5" r=".8"/><circle cx="14" cy="6.5" r=".8"/><circle cx="17" cy="9.5" r=".8"/>',
    diamond:'<path d="M4 8 8 3h8l4 5-8 13L4 8Z"/><path d="M4 8h16M8 3l4 5 4-5M8 8l4 13 4-13"/>',
    heart:'<path d="M20.8 5.8a5.3 5.3 0 0 0-7.5 0L12 7.1l-1.3-1.3a5.3 5.3 0 0 0-7.5 7.5L12 22l8.8-8.7a5.3 5.3 0 0 0 0-7.5Z"/>',
    handshake:'<path d="m8 12 3 3a2 2 0 0 0 3 0l5-5"/><path d="m2 10 5-5 4 2 2-1 4 4 5-1M6 16l2 2a2 2 0 0 0 3 0M4 13l3 3"/>',
    hand:'<path d="M4 14v-3a1.7 1.7 0 0 1 3.4 0v-2a1.7 1.7 0 1 1 3.4 0V7a1.7 1.7 0 1 1 3.4 0v2a1.7 1.7 0 1 1 3.4 0v5c0 4-2.8 7-7 7H9a5 5 0 0 1-5-5v-2Z"/><path d="M7.4 11v3M10.8 9v5M14.2 9v5"/>',
    sparkles:'<path d="m12 3 1.2 3.2L16.5 7.5l-3.3 1.3L12 12l-1.2-3.2-3.3-1.3 3.3-1.3L12 3Z"/><path d="m18 13 .8 2.2L21 16l-2.2.8L18 19l-.8-2.2L15 16l2.2-.8L18 13ZM6 14l.7 1.8L8.5 16.5l-1.8.7L6 19l-.7-1.8-1.8-.7 1.8-.7L6 14Z"/>',
    code:'<path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14"/>',
    graduation:'<path d="m2.5 9 9.5-5 9.5 5-9.5 5-9.5-5Z"/><path d="M6 11.2V16c3.7 2.7 8.3 2.7 12 0v-4.8M21.5 9v6"/>',
    smile:'<circle cx="12" cy="12" r="9"/><path d="M8.5 10h.01M15.5 10h.01M8 15c1.1 1.5 2.4 2 4 2s2.9-.5 4-2"/>',
    folder:'<path d="M3 6.5h6l2 2h10v10.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6.5Z"/><path d="M3 10h18"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7 7 0 0 0-1.8-1L14.5 3h-5l-.3 3.1a7 7 0 0 0-1.8 1L5 6.1 3 9.5 5 11a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a7 7 0 0 0 1.8 1l.3 3.1h5l.3-3.1a7 7 0 0 0 1.8-1l2.4 1 2-3.4-2-1.5a7 7 0 0 0 .1-1Z"/>',
    award:'<circle cx="12" cy="9" r="5"/><path d="m8.5 13-1 8 4.5-2 4.5 2-1-8"/>',
    file:'<path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    support:'<path d="M4 13v-1a8 8 0 0 1 16 0v1M4 13h3v6H5a1 1 0 0 1-1-1v-5ZM20 13h-3v6h2a1 1 0 0 0 1-1v-5ZM17 19c0 1.1-.9 2-2 2h-3"/>',
    menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
    chevron:'<path d="m9 18 6-6-6-6"/>',
    trend:'<path d="M4 18 10 12l4 4 6-8"/><path d="M15 8h5v5"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    shield:'<path d="M12 3 4.5 6v5.5c0 4.8 3.2 8 7.5 9.5 4.3-1.5 7.5-4.7 7.5-9.5V6L12 3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>'
  };

  function icon(name,cls=''){
    const body=ICONS[name]||ICONS.info;
    return `<svg class="v4-icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  }

  const ROUTES={
    dashboard:{label:'الرئيسية',icon:'home',features:[['chart','نظرة شاملة'],['clipboard','مؤشرات المدرسة'],['check','أولويات اليوم'],['trend','قرار وتحسين']]},
    intelligence:{label:'العقل المدرسي',icon:'brain',features:[['brain','تشخيص مترابط'],['target','تحليل علمي'],['trend','حلول قابلة للقياس'],['check','متابعة الأثر']]},
    assessment:{label:'التقويم الذاتي',icon:'clipboard',features:[['clipboard','مجالات ومعايير'],['check','مؤشرات الأداء'],['file','شواهد موثقة'],['trend','فجوات التحسين']]},
    operational:{label:'الخطة التشغيلية',icon:'calendar',features:[['chart','مؤشرات واضحة'],['chart','خط أساس'],['target','مستهدف'],['trend','متحقق وأثر']]},
    improvement:{label:'خطط التحسين',icon:'target',features:[['brain','تشخيص'],['trend','إجراء علاجي'],['check','متابعة'],['chart','قياس أثر']]},
    evidence:{label:'الشواهد',icon:'clip',features:[['file','توثيق منظم'],['check','جودة الدليل'],['clip','ربط بالمؤشر'],['brain','تحليل المحتوى']]},
    nafs:{label:'نافس',icon:'award',features:[['file','قراءة'],['chart','رياضيات'],['sparkles','علوم'],['trend','خطط علاجية']]},
    leadership:{label:'القيادة المدرسية',icon:'users',features:[['target','رؤية واضحة وأهداف محددة'],['trend','تحسين التحصيل الأكاديمي'],['users','تمكين المعلمين وتطويرهم'],['shield','بيئة مدرسية آمنة وجاذبة']]},
    guidance:{label:'التوجيه الطلابي',icon:'compass',features:[['target','تشخيص الاحتياج'],['heart','دعم ووقاية'],['check','تدخل مناسب'],['trend','قياس الأثر']]},
    activity:{label:'النشاط الطلابي',icon:'palette',features:[['sparkles','مشاركة نوعية'],['users','وصول عادل'],['award','إنجاز'],['trend','أثر مستدام']]},
    gifted:{label:'رعاية الموهوبين',icon:'diamond',features:[['diamond','كشف وترشيح'],['sparkles','إثراء'],['settings','ابتكار'],['award','إنجاز نوعي']]},
    health:{label:'الإرشاد الصحي',icon:'heart',features:[['heart','احتياج صحي'],['shield','وقاية'],['info','توعية'],['trend','أثر صحي']]},
    partnership:{label:'الشراكة المجتمعية',icon:'handshake',features:[['handshake','شريك مناسب'],['check','أدوار واضحة'],['target','مؤشر نجاح'],['trend','استدامة وأثر']]},
    volunteer:{label:'الأعمال التطوعية',icon:'hand',features:[['heart','احتياج مجتمعي'],['calendar','ساعات تطوعية'],['users','متطوعون ومستفيدون'],['trend','أثر مجتمعي']]},
    ai:{label:'الذكاء الاصطناعي وساعة البرمجة',icon:'sparkles',features:[['sparkles','مهارة رقمية'],['code','تعلم بالممارسة'],['settings','مشروع ومنتج'],['trend','قياس الإكمال والأثر']]},
    professional:{label:'التطوير المهني',icon:'graduation',features:[['clipboard','احتياج مهني'],['users','مجتمعات تعلم'],['check','تطبيق'],['trend','قياس الأثر']]},
    events:{label:'الفعاليات والمناسبات',icon:'calendar',features:[['calendar','تخطيط'],['check','تنفيذ'],['file','توثيق'],['trend','قياس الأثر']]},
    satisfaction:{label:'رضا المستفيدين',icon:'smile',features:[['clipboard','استبانات'],['chart','اتجاهات'],['info','ملاحظات'],['trend','تحسين']]},
    reports:{label:'مركز التقارير',icon:'folder',features:[['file','PDF'],['file','Word'],['chart','Excel'],['folder','تقارير تنفيذية']]},
    settings:{label:'الإعدادات',icon:'settings',features:[['settings','بيانات المدرسة'],['folder','نسخ احتياطي'],['shield','خصوصية'],['trend','تحديثات']]}
  };

  const topLinks=[
    ['dashboard','home','الرئيسية'],
    ['assessment','clipboard','التقويم'],
    ['operational','calendar','التخطيط'],
    ['evidence','clip','الشواهد'],
    ['reports','chart','التقارير'],
    ['settings','settings','الإعدادات']
  ];

  function go(id){
    if(!id)return;
    location.hash=id;
    try{window.scrollTo({top:0,behavior:'smooth'});}catch(_){window.scrollTo(0,0);}
  }

  function decorateTopbar(){
    const top=$('.topbar');
    if(!top)return;
    const r=route(),meta=ROUTES[r]||ROUTES.dashboard;
    const current=$('.top-current',top);
    if(current && current.dataset.v43Route!==r){
      const holder=$(':scope > span',current);
      if(holder)holder.innerHTML=icon(meta.icon);
      current.dataset.v43Route=r;
    }
    let nav=$('.premium-top-nav',top);
    if(!nav){
      nav=document.createElement('nav');
      nav.className='premium-top-nav';
      nav.setAttribute('aria-label','التنقل السريع');
      const actions=$('.top-actions',top);
      top.insertBefore(nav,actions||null);
    }
    if(nav.dataset.v43Route!==r){
      nav.innerHTML=topLinks.map(([id,ic,label])=>
        `<button type="button" class="premium-top-link ${r===id?'active':''}" data-v4-go="${id}" aria-label="${label}"><span class="ptn-icon">${icon(ic)}</span><span>${label}</span></button>`
      ).join('');
      nav.dataset.v43Route=r;
    }
  }

  function decorateSidebar(){
    const side=$('.side-nav');
    if(!side)return;
    $$('.side-link',side).forEach(a=>{
      const id=(a.getAttribute('href')||'').replace(/^#/,'');
      const meta=ROUTES[id];
      const holder=$('.side-icon',a);
      if(meta && holder && holder.dataset.v43Icon!==meta.icon){
        holder.innerHTML=icon(meta.icon);
        holder.dataset.v43Icon=meta.icon;
      }
      a.setAttribute('title',meta?.label||'');
    });
    const brand=$('.side-brand',side);
    if(brand && !$('.v4-side-collapse',brand)){
      const b=document.createElement('button');
      b.type='button';b.className='v4-side-collapse';b.dataset.v4Collapse='1';
      b.setAttribute('aria-label','تصغير القائمة الجانبية');
      b.innerHTML=icon('chevron');
      brand.appendChild(b);
    }
    const foot=$('.side-foot',side);
    if(foot && foot.dataset.v43Ready!=='1'){
      foot.dataset.v43Ready='1';
      foot.innerHTML=`
        <div class="premium-side-card"><span class="psc-icon">${icon('support')}</span><span><strong>الدعم الفني</strong><span>مساعدة سريعة وإرشادات الاستخدام</span></span></div>
        <div class="premium-side-card"><span class="psc-icon">${icon('users')}</span><span><strong>مسؤولة المنصة</strong><span>أ/ فاطمة هزازي</span></span></div>`;
    }
  }

  function heroScene(meta){
    return `<div class="premium-hero-scene" aria-hidden="true">
      <svg viewBox="0 0 720 420" role="presentation">
        <defs>
          <linearGradient id="v43Sky" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8fcfa"/><stop offset="1" stop-color="var(--premium-accent-soft)"/></linearGradient>
          <linearGradient id="v43Glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".98"/><stop offset="1" stop-color="#f4faf7" stop-opacity=".94"/></linearGradient>
          <filter id="v43Shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#153d32" flood-opacity=".13"/></filter>
        </defs>
        <rect width="720" height="420" rx="28" fill="url(#v43Sky)"/>
        <circle cx="620" cy="74" r="112" fill="var(--premium-accent)" opacity=".055"/>
        <circle cx="94" cy="96" r="72" fill="#ffffff" opacity=".7"/>
        <path d="M0 332C124 295 228 303 340 329s231 42 380-1v92H0Z" fill="var(--premium-accent)" opacity=".08"/>
        <path d="M0 356c139-31 250-18 363 8 116 27 219 24 357-5v61H0Z" fill="var(--premium-accent)" opacity=".10"/>
        <!-- school -->
        <g transform="translate(55 127)" filter="url(#v43Shadow)">
          <rect x="0" y="72" width="318" height="150" rx="12" fill="#fff" stroke="#d9e7e0"/>
          <rect x="52" y="28" width="214" height="194" rx="10" fill="#fbfdfc" stroke="#d9e7e0"/>
          <rect x="123" y="0" width="72" height="42" rx="9" fill="var(--premium-accent)" opacity=".95"/>
          <path d="M145 22h28M159 8v28" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".9"/>
          <g fill="var(--premium-accent)" opacity=".14">
            <rect x="72" y="58" width="34" height="28" rx="5"/><rect x="125" y="58" width="34" height="28" rx="5"/><rect x="178" y="58" width="34" height="28" rx="5"/><rect x="231" y="58" width="18" height="28" rx="5"/>
            <rect x="20" y="102" width="34" height="28" rx="5"/><rect x="20" y="147" width="34" height="28" rx="5"/><rect x="265" y="102" width="34" height="28" rx="5"/><rect x="265" y="147" width="34" height="28" rx="5"/>
            <rect x="72" y="103" width="34" height="28" rx="5"/><rect x="212" y="103" width="34" height="28" rx="5"/>
          </g>
          <rect x="124" y="145" width="70" height="77" rx="8" fill="var(--premium-accent)" opacity=".16"/>
          <rect x="137" y="161" width="44" height="61" rx="6" fill="var(--premium-accent)" opacity=".68"/>
          <path d="M159 161v61" stroke="#fff" stroke-opacity=".7"/>
        </g>
        <!-- flag -->
        <g transform="translate(322 85)"><path d="M0 112V0" stroke="#769189" stroke-width="4"/><path d="M3 8h83v42H3z" fill="var(--premium-accent)" rx="4"/><path d="M20 29h49" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9"/></g>
        <!-- analytics panel -->
        <g transform="translate(386 126)" filter="url(#v43Shadow)">
          <rect x="0" y="0" width="273" height="194" rx="24" fill="url(#v43Glass)" stroke="#d6e6de"/>
          <rect x="24" y="22" width="92" height="12" rx="6" fill="var(--premium-accent)" opacity=".18"/>
          <rect x="24" y="47" width="57" height="8" rx="4" fill="#9bb2a8" opacity=".42"/>
          <path d="M28 142 75 111l45 17 52-63 59 27" fill="none" stroke="var(--premium-accent)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="75" cy="111" r="6" fill="#fff" stroke="var(--premium-accent)" stroke-width="4"/><circle cx="120" cy="128" r="6" fill="#fff" stroke="var(--premium-accent)" stroke-width="4"/><circle cx="172" cy="65" r="6" fill="#fff" stroke="var(--premium-accent)" stroke-width="4"/>
          <g transform="translate(30 156)"><rect x="0" y="0" width="34" height="18" rx="5" fill="var(--premium-accent)" opacity=".16"/><rect x="44" y="-15" width="34" height="33" rx="5" fill="var(--premium-accent)" opacity=".28"/><rect x="88" y="-31" width="34" height="49" rx="5" fill="var(--premium-accent)" opacity=".45"/><rect x="132" y="-52" width="34" height="70" rx="5" fill="var(--premium-accent)" opacity=".72"/></g>
          <circle cx="225" cy="42" r="19" fill="var(--premium-accent-soft)"/><path d="m216 42 6 6 12-14" fill="none" stroke="var(--premium-accent)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <!-- plants -->
        <g fill="var(--premium-accent)" opacity=".42"><circle cx="49" cy="333" r="30"/><circle cx="83" cy="342" r="24"/><circle cx="357" cy="342" r="26"/></g>
      </svg>
      <div class="hero-route-badge">${icon(meta.icon)}</div>
      <div class="hero-float hero-float-a">${icon('target')}</div>
      <div class="hero-float hero-float-b">${icon('chart')}</div>
    </div>`;
  }

  function decorateHero(){
    const hero=$('.hero-v4');
    if(!hero)return;
    const r=route(),meta=ROUTES[r]||ROUTES.dashboard;
    const copy=$('.hero-v4-copy',hero);
    const actions=$('.hero-actions',hero);
    let row=copy?$('.hero-feature-row',copy):null;
    if(copy && (!row || row.dataset.v43Route!==r)){
      if(!row){row=document.createElement('div');row.className='hero-feature-row';copy.insertBefore(row,actions||null);}
      row.innerHTML=(meta.features||[]).map(([ic,text])=>`<div class="hero-feature"><span>${icon(ic)}</span><strong>${text}</strong></div>`).join('');
      row.dataset.v43Route=r;
    }
    const art=$('.hero-v4-art',hero);
    if(art && art.dataset.v43Route!==r){
      art.innerHTML=heroScene(meta);
      art.dataset.v43Route=r;
    }
  }

  function reorderLeadership(){
    if(route()!=='leadership')return;
    const mod=$('.leadership-module');
    if(!mod||mod.dataset.premiumOrder==='1')return;
    const heads=$$(':scope > .section-head',mod);
    const roles=$(':scope > .leadership-roles',mod);
    const pillars=$(':scope > .leadership-pillars',mod);
    if(heads.length>=2 && roles && pillars){mod.insertBefore(heads[1],heads[0]);mod.insertBefore(roles,heads[0]);}
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
    if(!dock){dock=document.createElement('div');dock.className='premium-action-dock';metricGrid.insertAdjacentElement('afterend',dock);}
    if(!dock.contains(actions))dock.append(actions);
  }

  function addLeadershipAbout(){
    if(route()!=='leadership'||$('.premium-about'))return;
    const dock=$('.premium-action-dock');
    if(!dock)return;
    const about=document.createElement('div');
    about.className='premium-about';
    about.innerHTML=`<span class="pa-icon">${icon('info')}</span><div><h3>عن القيادة المدرسية</h3><p>القيادة الفاعلة تحول الرؤية إلى خطط قابلة للتنفيذ، وتربط القرارات ببيانات التحصيل والشواهد وقياس الأثر، مع المحافظة على جميع أدوات التحليل والتقارير الأصلية.</p></div>`;
    dock.insertAdjacentElement('afterend',about);
  }

  function markRoute(){
    const r=route();
    document.body.dataset.v4Route=r;
    document.documentElement.dataset.platformVersion='4.3';
    $$('.side-link').forEach(a=>{
      const active=(a.getAttribute('href')||'')==='#'+r;
      a.classList.toggle('active',active);
      if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    });
  }

  function restoreSidebarState(){
    try{if(localStorage.getItem('v43-side-collapsed')==='1')document.body.classList.add('side-collapsed');}catch(_){ }
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
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply);}

  document.addEventListener('click',e=>{
    const goBtn=e.target.closest('[data-v4-go]');
    if(goBtn){e.preventDefault();go(goBtn.dataset.v4Go);return;}
    const collapse=e.target.closest('[data-v4-collapse]');
    if(collapse){
      e.preventDefault();
      document.body.classList.toggle('side-collapsed');
      try{localStorage.setItem('v43-side-collapsed',document.body.classList.contains('side-collapsed')?'1':'0');}catch(_){ }
    }
  });

  restoreSidebarState();
  window.addEventListener('hashchange',schedule);
  document.addEventListener('DOMContentLoaded',schedule);
  window.addEventListener('load',schedule);
  new MutationObserver(mutations=>{
    if(mutations.some(m=>[...m.addedNodes].some(n=>n.nodeType===1 && (n.id==='appHeader'||n.id==='page'||n.matches?.('.topbar,.hero-v4,.side-nav')))))schedule();
  }).observe(document.documentElement,{childList:true,subtree:true});

  if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost')){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=4.3.0',{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{}));
  }
})();
