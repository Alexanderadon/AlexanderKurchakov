// @ts-nocheck
/* Интерактивность сайта — портирована 1:1 из утверждённого макета bento-v2.
   Вызывается один раз из home.tsx после монтирования; возвращает cleanup
   (отмена rAF, отписка observers/listeners) — на случай размонтирования. */
export function initSite(): () => void {
  "use strict";
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FINE = matchMedia("(pointer: fine)").matches;
  const root = document.documentElement;

  const cleanups: Array<() => void> = [];
  const rafIds: number[] = [];
  const raf = (fn: FrameRequestCallback) => { const id = requestAnimationFrame(fn); rafIds.push(id); return id; };
  const on = (t: any, ev: string, fn: any, opts?: any) => { t.addEventListener(ev, fn, opts); cleanups.push(() => t.removeEventListener(ev, fn, opts)); };
  const track = (o: { disconnect: () => void }) => { cleanups.push(() => o.disconnect()); return o; };

  function store(k, v){ try{ localStorage.setItem("bento2:"+k, v); }catch(e){} }
  function press(list, onB){ list.forEach(function(b){ b.setAttribute("aria-pressed", String(b===onB)); }); }

  /* ================= имя: разбивка на буквы ================= */
  var nm = document.getElementById("nm");
  if(nm && !nm.querySelector(".ch")){
    var txt = nm.textContent;
    nm.textContent = "";
    nm.setAttribute("aria-label", txt);
    for(var i=0;i<txt.length;i++){
      var s=document.createElement("span");
      s.className="ch"; s.textContent=txt[i]; s.style.setProperty("--i",i);
      s.setAttribute("aria-hidden","true");
      nm.appendChild(s);
    }
    if(!RM) nm.classList.add("play-in");
  }

  /* ================= staggered reveal ================= */
  document.querySelectorAll("[data-st]").forEach(function(grp){
    grp.querySelectorAll(":scope > .rv, :scope > * > .rv").forEach(function(el,i){ el.dataset.d = i*80; });
  });
  var allRv = document.querySelectorAll(".rv");
  function reveal(el){ setTimeout(function(){ el.classList.add("in"); }, +(el.dataset.d||0)); }
  if(RM || !("IntersectionObserver" in window)){
    allRv.forEach(function(el){ el.classList.add("in"); });
  }else{
    var io = track(new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting) return;
        reveal(e.target);
        io.unobserve(e.target);
      });
    },{threshold:.12, rootMargin:"0px 0px -4%"}));
    /* элементы, уже попавшие в первый экран, показываем сразу — не ждём IO
       (надёжно даже там, где IntersectionObserver не срабатывает); остальное — по скроллу */
    allRv.forEach(function(el){
      if(el.getBoundingClientRect().top < innerHeight * 0.96) reveal(el);
      else io.observe(el);
    });
    /* страховка: контент не должен остаться невидимым ни при каких сбоях IO */
    setTimeout(function(){ allRv.forEach(function(el){ el.classList.add("in"); }); }, 2500);
  }

  /* ================= МАСКОТ ================= */
  var mascot = document.getElementById("mascot"),
      mStage = document.getElementById("mStage"),
      mBubble = document.getElementById("mBubble"),
      figs = {};
  if(mascot) mascot.querySelectorAll(".m-fig").forEach(function(f){ figs[f.dataset.m] = f; });
  var mOn = true, curM = null, wantM = "fire", bubT = null, hopT = null;
  try{ if(localStorage.getItem("bento2:mascot")==="off") mOn = false; }catch(e){}
  function say(t){
    if(!mOn || !t || !mBubble) return;
    mBubble.textContent = t;
    mBubble.classList.add("show");
    clearTimeout(bubT);
    bubT = setTimeout(function(){ mBubble.classList.remove("show"); }, 3000);
  }
  function setM(name, phrase){
    wantM = name;
    if(!mOn || !figs[name]) return;
    if(curM === name){ say(phrase); return; }
    var prev = figs[curM], next = figs[name];
    curM = name;
    if(RM){
      Object.keys(figs).forEach(function(k){ figs[k].classList.remove("on","out","jump"); });
      next.classList.add("on");
      say(phrase);
      return;
    }
    if(prev){
      prev.classList.remove("on","jump");
      prev.classList.add("out");
      (function(p){ setTimeout(function(){ p.classList.remove("out"); }, 340); })(prev);
    }
    next.classList.remove("out");
    next.classList.add("on","jump");
    (function(n){ setTimeout(function(){ n.classList.remove("jump"); }, 460); })(next);
    say(phrase);
  }
  function applyMascot(){
    if(!mascot) return;
    mascot.hidden = !mOn;
    if(mOn && !curM) setM(wantM, "сәлем! я тут гид");
  }
  applyMascot();
  var secMap = [
    ["hero","fire","сәлем! я тут гид"],
    ["works","buddy","это все мои работы"],
    ["about","dark","немного обо мне"]
  ];
  if("IntersectionObserver" in window && mascot){
    var mio = track(new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting) return;
        var m = secMap.filter(function(x){ return x[0]===e.target.id; })[0];
        if(m) setM(m[1], m[2]);
      });
    },{rootMargin:"-42% 0px -42% 0px", threshold:0}));
    secMap.forEach(function(x){
      var el=document.getElementById(x[0]);
      if(el) mio.observe(el);
    });
    var fio = track(new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting) setM("tall","пиши — не стесняйся"); });
    },{threshold:.85}));
    var ftr=document.getElementById("contact");
    if(ftr) fio.observe(ftr);
  }
  var quips = ["ойбай!","код и кисть","шеберлік!","你好!"];
  if(mStage) on(mStage, "click", function(){
    if(!mOn) return;
    if(!RM){
      mStage.classList.remove("hop");
      void mStage.offsetWidth;
      mStage.classList.add("hop");
      clearTimeout(hopT);
      hopT = setTimeout(function(){ mStage.classList.remove("hop"); }, 520);
    }
    say(quips[Math.floor(Math.random()*quips.length)]);
  });

  /* ================= панель «эксперимент» ================= */
  var expBtn = document.getElementById("expBtn"),
      expBody = document.getElementById("expBody");
  if(expBtn && expBody){
    on(expBtn, "click", function(){
      var open = expBody.hidden;
      expBody.hidden = !open;
      expBtn.setAttribute("aria-expanded", String(open));
    });
    on(document, "keydown", function(e){
      if(e.key === "Escape" && !expBody.hidden){
        expBody.hidden = true;
        expBtn.setAttribute("aria-expanded","false");
        expBtn.focus();
      }
    });
  }
  var palBtns = Array.prototype.slice.call(document.querySelectorAll("[data-pal]"));
  function setPal(v){
    if(v==="ugol") root.removeAttribute("data-palette");
    else root.setAttribute("data-palette", v);
    press(palBtns, palBtns.filter(function(b){ return b.dataset.pal===v; })[0]);
    store("palette", v==="ugol" ? "" : v);
  }
  palBtns.forEach(function(b){ on(b, "click", function(){ setPal(b.dataset.pal); }); });
  var fpBtns = Array.prototype.slice.call(document.querySelectorAll("[data-fp]"));
  function setFp(v){
    if(v==="brand") root.removeAttribute("data-fonts");
    else root.setAttribute("data-fonts", v);
    press(fpBtns, fpBtns.filter(function(b){ return b.dataset.fp===v; })[0]);
    store("fonts", v==="brand" ? "" : v);
    raf(syncInds);
  }
  fpBtns.forEach(function(b){ on(b, "click", function(){ setFp(b.dataset.fp); }); });
  (function(){
    var p = root.getAttribute("data-palette") || "ugol";
    press(palBtns, palBtns.filter(function(b){ return b.dataset.pal===p; })[0] || palBtns[0]);
    var f = root.getAttribute("data-fonts") ? "strict" : "brand";
    press(fpBtns, fpBtns.filter(function(b){ return b.dataset.fp===f; })[0] || fpBtns[0]);
  })();
  var mToggle = document.getElementById("mToggle");
  function syncMT(){
    if(!mToggle) return;
    mToggle.setAttribute("aria-pressed", String(mOn));
    mToggle.textContent = mOn ? "вкл" : "выкл";
  }
  syncMT();
  if(mToggle) on(mToggle, "click", function(){
    mOn = !mOn;
    store("mascot", mOn ? "" : "off");
    if(mOn){ curM = null; applyMascot(); }
    else if(mascot){
      mascot.hidden = true;
      if(mBubble) mBubble.classList.remove("show");
      Object.keys(figs).forEach(function(k){ figs[k].classList.remove("on","out","jump"); });
      curM = null;
    }
    syncMT();
  });

  /* ================= фильтры (общие для сетки и списка) ================= */
  var pillsBar = document.querySelector(".pills"),
      ind = pillsBar && pillsBar.querySelector(".ind"),
      pills = Array.prototype.slice.call(document.querySelectorAll(".pill")),
      cards = Array.prototype.slice.call(document.querySelectorAll(".work")),
      rows  = Array.prototype.slice.call(document.querySelectorAll(".irow"));
  function moveInd(bar, marker, btn){
    if(!marker || !btn) return;
    marker.style.width = btn.offsetWidth + "px";
    marker.style.transform = "translateX(" + btn.offsetLeft + "px)";
  }
  function toggleItem(el, show, hideDelay){
    if(el._t){ clearTimeout(el._t); el._t = null; }
    if(show){
      el.style.display = "";
      raf(function(){ raf(function(){ el.classList.remove("is-hidden"); }); });
    }else{
      el.classList.add("is-hidden");
      el.classList.remove("open");
      el._t = setTimeout(function(){ el.style.display = "none"; el._t = null; }, RM ? 0 : hideDelay);
    }
  }
  function setFilter(btn, silent){
    press(pills, btn);
    moveInd(pillsBar, ind, btn);
    var cat = btn.dataset.cat;
    cards.forEach(function(c){ toggleItem(c, cat==="all" || c.dataset.cat===cat, 330); });
    rows.forEach(function(r){ toggleItem(r, cat==="all" || r.dataset.cat===cat, 420); });
    if(fly) fly.classList.remove("show");
    if(!silent) say("показываю: " + btn.textContent.toLowerCase());
  }
  pills.forEach(function(p){ on(p, "click", function(){ setFilter(p); }); });
  if(pillsBar){
    var activePill = pillsBar.querySelector('[aria-pressed="true"]') || pills[0];
    moveInd(pillsBar, ind, activePill);
  }

  /* ================= режимы: сетка / список ================= */
  var grid = document.getElementById("worksGrid"),
      list = document.getElementById("worksList"),
      vbar = document.getElementById("vmode"),
      vind = vbar && vbar.querySelector(".vind"),
      vbtns = Array.prototype.slice.call(document.querySelectorAll("[data-view]")),
      view = "grid", vT = null;
  function setView(v){
    if(v === view || !grid || !list) return;
    view = v;
    var btn = vbtns.filter(function(b){ return b.dataset.view===v; })[0];
    press(vbtns, btn);
    moveInd(vbar, vind, btn);
    var out = v==="list" ? grid : list,
        inn = v==="list" ? list : grid;
    if(fly) fly.classList.remove("show");
    clearTimeout(vT);
    out.classList.add("fade");
    vT = setTimeout(function(){
      out.hidden = true;
      inn.hidden = false;
      inn.classList.add("fade");
      raf(function(){ raf(function(){ inn.classList.remove("fade"); }); });
    }, RM ? 0 : 240);
    if(v==="list") setM("wide", "редкий гость! это индекс");
    else setM("buddy", "и снова плитки");
  }
  vbtns.forEach(function(b){ on(b, "click", function(){ setView(b.dataset.view); }); });
  moveInd(vbar, vind, vbtns[0]);
  function syncInds(){
    if(pillsBar) moveInd(pillsBar, ind, pillsBar.querySelector('[aria-pressed="true"]') || pills[0]);
    if(vbar) moveInd(vbar, vind, vbar.querySelector('[aria-pressed="true"]') || vbtns[0]);
  }
  on(window, "resize", syncInds);
  try{ if(document.fonts && document.fonts.ready) document.fonts.ready.then(syncInds); }catch(e){}

  /* ================= список: превью ================= */
  var fly = document.getElementById("fly"), flyIn = document.getElementById("flyIn");
  function pvClone(i){
    var src = cards[i] && cards[i].querySelector(".pv > svg, .pv > img, .pv > video");
    if(!src) return null;
    if(src.tagName === "VIDEO"){
      var im = document.createElement("img");
      im.src = src.getAttribute("poster") || "";
      im.alt = "";
      return im;
    }
    return src.cloneNode(true);
  }
  var mx = innerWidth/2, my = innerHeight/2;
  on(window, "mousemove", function(e){ mx=e.clientX; my=e.clientY; }, {passive:true});
  if(FINE && !RM && fly && flyIn){
    var fx = mx, fy = my, activeRow = null;
    function flyTarget(){
      var w = fly.offsetWidth || 340, h = fly.offsetHeight || 214;
      return [Math.min(Math.max(mx + 30, 12), innerWidth - w - 12),
              Math.min(Math.max(my - h - 26, 12), innerHeight - h - 12)];
    }
    rows.forEach(function(row){
      on(row, "mouseenter", function(){
        var c = pvClone(+row.dataset.i);
        if(!c) return;
        flyIn.innerHTML = "";
        flyIn.appendChild(c);
        activeRow = row;
        var t = flyTarget(); fx = t[0]; fy = t[1];
        fly.style.transform = "translate3d(" + fx + "px," + fy + "px,0)";
        fly.classList.add("show");
      });
      on(row, "mouseleave", function(){
        if(activeRow === row){ activeRow = null; fly.classList.remove("show"); }
      });
    });
    (function loopFly(){
      if(fly.classList.contains("show")){
        var t = flyTarget();
        fx += (t[0] - fx) * .13; fy += (t[1] - fy) * .13;
        fly.style.transform = "translate3d(" + fx + "px," + fy + "px,0)";
      }
      raf(loopFly);
    })();
  }
  function toggleRow(row){
    var was = row.classList.contains("open");
    rows.forEach(function(r){ r.classList.remove("open"); });
    if(!was){
      var pre = row.querySelector(".row-pre");
      if(pre && !pre.firstChild){
        var c = pvClone(+row.dataset.i);
        if(c) pre.appendChild(c);
      }
      row.classList.add("open");
    }
  }
  rows.forEach(function(row){
    if(!FINE) on(row, "click", function(){ toggleRow(row); });
    on(row, "keydown", function(e){
      if(e.key==="Enter" || e.key===" "){ e.preventDefault(); toggleRow(row); }
    });
  });

  /* ================= видео в карточках работ ================= */
  var vidCards = cards.filter(function(c){ return c.classList.contains("vid"); });
  if(vidCards.length){
    var vio = ("IntersectionObserver" in window) ? track(new IntersectionObserver(function(es){
      es.forEach(function(e){
        var v = e.target;
        if(e.isIntersecting){ if(!RM && v.paused){ var p = v.play(); if(p && p.catch) p.catch(function(){}); } }
        else if(!v.paused){ v.pause(); }
      });
    },{threshold:.25})) : null;
    vidCards.forEach(function(card){
      var v = card.querySelector("video"), snd = card.querySelector(".snd");
      if(!v) return;
      function syncSnd(){
        if(snd) snd.textContent = v.paused ? "▶ смотреть" : (v.muted ? "звук выкл" : "звук вкл");
      }
      on(v, "play", function(){ if(v.dataset.skip && v.currentTime < +v.dataset.skip) v.currentTime = +v.dataset.skip; syncSnd(); });
      on(v, "pause", syncSnd);
      syncSnd();
      if(vio) vio.observe(v);
      function toggleVid(){
        if(v.paused){ var p = v.play(); if(p && p.catch) p.catch(function(){}); }
        else v.muted = !v.muted;
        syncSnd();
      }
      on(card, "click", function(e){
        if(e.target.closest && e.target.closest("a")) return;
        toggleVid();
      });
      on(card, "keydown", function(e){
        if(e.key === "Enter" || e.key === " "){ e.preventDefault(); toggleVid(); }
      });
    });
  }

  /* ================= навигация → фильтр ================= */
  document.querySelectorAll("[data-goto]").forEach(function(a){
    on(a, "click", function(e){
      e.preventDefault();
      var btn = pills.filter(function(p){ return p.dataset.cat===a.dataset.goto; })[0];
      if(btn) setFilter(btn, true);
      var w = document.getElementById("works");
      if(w) w.scrollIntoView({behavior: RM ? "auto" : "smooth"});
    });
  });

  if(RM || !FINE) return () => cleanups.forEach(function(f){ f(); });

  /* ================= кастомный курсор ================= */
  var dot=document.createElement("div"); dot.className="cur";
  var ring=document.createElement("div"); ring.className="cur-r";
  document.body.appendChild(dot); document.body.appendChild(ring);
  cleanups.push(function(){ dot.remove(); ring.remove(); });
  var rx=mx, ry=my, curShown=false;
  on(window, "mousemove", function(e){
    dot.style.transform="translate3d("+e.clientX+"px,"+e.clientY+"px,0) translate(-50%,-50%)";
    if(!curShown){curShown=true; dot.style.opacity="1"; ring.style.opacity="1";}
  },{passive:true});
  (function loop(){
    rx+=(mx-rx)*.16; ry+=(my-ry)*.16;
    ring.style.transform="translate3d("+rx+"px,"+ry+"px,0) translate(-50%,-50%)";
    raf(loop);
  })();
  document.querySelectorAll("a,button,.work,.irow").forEach(function(t){
    on(t, "mouseenter", function(){ ring.classList.add("on"); });
    on(t, "mouseleave", function(){ ring.classList.remove("on"); });
  });

  /* ================= магнитные ссылки ================= */
  document.querySelectorAll(".mg").forEach(function(el){
    el.style.transition="transform .22s ease-out";
    on(el, "mousemove", function(e){
      var r=el.getBoundingClientRect();
      var x=e.clientX-r.left-r.width/2, y=e.clientY-r.top-r.height/2;
      el.style.transform="translate("+(x*.22)+"px,"+(y*.28)+"px)";
    });
    on(el, "mouseleave", function(){ el.style.transform=""; });
  });

  return () => { rafIds.forEach(cancelAnimationFrame); cleanups.forEach(function(f){ f(); }); };
}
