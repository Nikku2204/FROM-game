/* ===========================================================================
   FROM — Survive & Solve  ·  engine.js
   Shared systems used by every level: audio, backgrounds, the notebook,
   the level menu, and save/progress. Levels register themselves via
   Engine.addLevel({...}) and use the Engine.* API to draw their own screens.
   =========================================================================== */
window.Engine = (function(){
  "use strict";

  /* ---------- audio: original eerie ambience, synthesized live (no files) ---------- */
  var Snd = (function(){
    var ctx,master,droneG,noiseG,melG,delay,fb,wet,started=false,muted=false,mood="day",timer=null;
    var MOTIF=[[659.25,0.9,1.1],[523.25,0.9,1.0],[440.0,1.3,1.5],[493.88,0.6,0.7],
               [523.25,0.9,1.0],[440.0,1.6,1.8],[587.33,0.9,1.0],[523.25,0.6,0.7],
               [493.88,0.9,1.0],[440.0,0.6,0.7],[415.30,1.9,2.1]];
    function init(){
      if(started) return true;
      try{ ctx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return false; }
      master=ctx.createGain(); master.gain.value=muted?0:0.85; master.connect(ctx.destination);
      delay=ctx.createDelay(1.0); delay.delayTime.value=0.34;
      fb=ctx.createGain(); fb.gain.value=0.42; wet=ctx.createGain(); wet.gain.value=0.32;
      delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(master);
      droneG=ctx.createGain(); droneG.gain.value=0.0001; droneG.connect(master);
      var lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=430; lp.connect(droneG);
      [55,82.41,110].forEach(function(f,i){
        var o=ctx.createOscillator(); o.type="sine"; o.frequency.value=f;
        var g=ctx.createGain(); g.gain.value=i===0?0.5:0.2;
        var lfo=ctx.createOscillator(); lfo.frequency.value=0.05+i*0.02;
        var lg=ctx.createGain(); lg.gain.value=3; lfo.connect(lg); lg.connect(o.detune); lfo.start();
        o.connect(g); g.connect(lp); o.start();
      });
      noiseG=ctx.createGain(); noiseG.gain.value=0.0001; noiseG.connect(master);
      var buf=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate), d=buf.getChannelData(0);
      for(var i=0;i<d.length;i++) d[i]=Math.random()*2-1;
      var n=ctx.createBufferSource(); n.buffer=buf; n.loop=true;
      var nf=ctx.createBiquadFilter(); nf.type="bandpass"; nf.frequency.value=560; nf.Q.value=0.6;
      n.connect(nf); nf.connect(noiseG); n.start();
      melG=ctx.createGain(); melG.gain.value=0.0001; melG.connect(master); melG.connect(delay);
      started=true; apply(); loop(); return true;
    }
    function pluck(freq,t,dur,vel){
      var o=ctx.createOscillator(); o.type="triangle"; o.frequency.value=freq;
      var g=ctx.createGain();
      g.gain.setValueAtTime(0.0001,t);
      g.gain.exponentialRampToValueAtTime(vel,t+0.015);
      g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
      o.connect(g); g.connect(melG); o.start(t); o.stop(t+dur+0.05);
    }
    function loop(){
      if(!started) return;
      var oct=mood==="night"?0.5:1, vel=mood==="night"?0.16:0.12, t=ctx.currentTime+0.15;
      MOTIF.forEach(function(m){ pluck(m[0]*oct,t,m[2],vel); t+=m[1]; });
      var gap=mood==="night"?3.5:6.5;
      timer=setTimeout(loop,(t-ctx.currentTime+gap)*1000);
    }
    function apply(){
      if(!started) return; var now=ctx.currentTime;
      if(mood==="night"){ droneG.gain.setTargetAtTime(0.55,now,1.5); noiseG.gain.setTargetAtTime(0.06,now,2); melG.gain.setTargetAtTime(0.5,now,1.5); }
      else { droneG.gain.setTargetAtTime(0.3,now,2); noiseG.gain.setTargetAtTime(0.022,now,2.5); melG.gain.setTargetAtTime(0.36,now,2); }
    }
    return {
      start:function(){ if(init() && ctx && ctx.state==="suspended") ctx.resume(); },
      ready:function(){ return started; },
      setMood:function(m){ if(m===mood) return; mood=m; apply(); },
      toggle:function(){ muted=!muted; if(master) master.gain.setTargetAtTime(muted?0:0.85,ctx.currentTime,0.1); return muted; },
      muted:function(){ return muted; }
    };
  })();

  /* ---------- dom (resolved on boot) ---------- */
  function $(id){ return document.getElementById(id); }
  var bg, grain, stage, app, soundBtn, jDrawer, jBack, jBody, jSub, jTitleEl;

  /* ---------- backgrounds + render ---------- */
  var SCRIM = {
    light:"linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.6))",
    med:"linear-gradient(rgba(0,0,0,.42),rgba(0,0,0,.7))",
    heavy:"linear-gradient(rgba(0,0,0,.58),rgba(0,0,0,.82))",
    vn:"linear-gradient(rgba(0,0,0,.12) 0%,rgba(0,0,0,.18) 38%,rgba(0,0,0,.88) 100%)",
    night:"linear-gradient(rgba(10,0,0,.5),rgba(0,0,0,.82))"
  };
  function setBg(url, focal, scrim){
    bg.style.backgroundImage = (SCRIM[scrim]||SCRIM.med)+', url("'+url+'")';
    bg.style.backgroundPosition = focal||"center";
    bg.classList.remove("show"); void bg.offsetWidth; bg.classList.add("show");
    Snd.setMood(scrim==="night"?"night":"day");
  }
  function render(html){ app.innerHTML = html; }
  function danger(on){ grain.className = on?"danger":""; }
  function nightClass(on){ stage.classList.toggle("night", !!on); }

  /* ---------- notebook (the slide-in journal drawer) ---------- */
  var Notebook = (function(){
    var entries=[];
    function rerender(){
      jBody.innerHTML = entries.length===0
        ? '<p class="empty">Nothing written yet. The page waits.</p>'
        : entries.map(function(e){
            return '<div class="frag'+(e.flag?' false':'')+'"><span class="tag">'+e.tag+'</span>'
              +(e.sub?'<span class="who">'+e.sub+'</span>':'')
              +'<div class="txt">'+e.text+'</div></div>';
          }).join("");
    }
    return {
      config:function(title){ if(jTitleEl) jTitleEl.textContent=title; },
      subtitle:function(t){ if(jSub) jSub.textContent=t; },
      add:function(e){ entries.push(e); rerender(); },
      clear:function(){ entries=[]; rerender(); },
      count:function(){ return entries.length; },
      open:function(){ rerender(); jDrawer.classList.add("open"); jBack.classList.add("open"); },
      close:function(){ jDrawer.classList.remove("open"); jBack.classList.remove("open"); }
    };
  })();

  /* ---------- sound toggle ---------- */
  var IC_ON='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19.5 5a9 9 0 0 1 0 14"/></svg>';
  var IC_OFF='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>';
  function renderSoundIcon(){ if(soundBtn) soundBtn.innerHTML=(Snd.ready()&&!Snd.muted())?IC_ON:IC_OFF; }

  /* ---------- level registry + progress ---------- */
  var levels=[], byId={}, done={};
  function save(){ try{ localStorage.setItem("fss_done", JSON.stringify(Object.keys(done))); }catch(e){} }
  function load(){ try{ JSON.parse(localStorage.getItem("fss_done")||"[]").forEach(function(id){ done[id]=true; }); }catch(e){} }
  function addLevel(def){ if(byId[def.id]) return; byId[def.id]=def; levels.push(def); }
  function indexOf(id){ for(var i=0;i<levels.length;i++) if(levels[i].id===id) return i; return -1; }
  function isDone(id){ return !!done[id]; }
  function isUnlocked(id){ var i=indexOf(id); if(i<=0) return true; return isDone(levels[i-1].id); }
  function nextOf(id){ var i=indexOf(id); return (i>=0 && i+1<levels.length)? levels[i+1] : null; }
  function startLevel(id){ var L=byId[id]; if(L){ Notebook.close(); Notebook.clear(); L.start(); } }
  function complete(id){ done[id]=true; save(); }

  var ROMAN=["","I","II","III","IV","V","VI","VII","VIII"];
  function hub(){
    nightClass(false); danger(false);
    setBg("assets/aerial.jpg","center 40%","med");
    var rows = levels.map(function(L){
      var unlocked=isUnlocked(L.id), doneL=isDone(L.id);
      var right = doneL ? '<span class="lvl-state done">survived \u2713</span>'
                : unlocked ? '<span class="lvl-state go">play \u203a</span>'
                : '<span class="lvl-state lock">locked</span>';
      return '<button class="lvl'+(unlocked?'':' locked')+'" data-id="'+L.id+'"'+(unlocked?'':' disabled')+'>'
        +'<span class="lvl-num">'+(ROMAN[L.num]||L.num)+'</span>'
        +'<span class="lvl-meta"><span class="lvl-title">'+L.title+'</span><span class="lvl-tag">'+L.tagline+'</span></span>'
        +right+'</button>';
    }).join("");
    render('<div class="scene fade">'
      +'<div class="eyebrow">A mystery-survival game \u00b7 inspired by FROM</div>'
      +'<h1 class="title">Survive<br>&amp; Solve</h1>'
      +'<div class="lvl-list">'+rows+'</div>'
      +'<p class="hub-foot">More levels are still being carved.</p>'
      +'</div>');
    Array.prototype.forEach.call(document.querySelectorAll(".lvl[data-id]"), function(b){
      if(b.disabled) return;
      b.onclick=function(){ if(!Snd.ready()){ Snd.start(); renderSoundIcon(); } startLevel(b.getAttribute("data-id")); };
    });
  }

  /* ---------- boot ---------- */
  function boot(){
    bg=$("bg"); grain=$("grain"); stage=$("stage"); app=$("app"); soundBtn=$("soundBtn");
    jDrawer=$("journal"); jBack=$("journalBack"); jBody=$("journalBody"); jSub=$("journalSub"); jTitleEl=$("journalTitle");
    if($("journalClose")) $("journalClose").onclick=Notebook.close;
    if(jBack) jBack.onclick=Notebook.close;
    if(soundBtn) soundBtn.onclick=function(){ if(!Snd.ready())Snd.start(); else Snd.toggle(); renderSoundIcon(); };
    renderSoundIcon();
    load();
    hub();
  }

  return {
    setBg:setBg, render:render, danger:danger, nightClass:nightClass,
    notebook:Notebook, sound:Snd, startMusic:function(){ Snd.start(); renderSoundIcon(); },
    addLevel:addLevel, startLevel:startLevel, complete:complete,
    isUnlocked:isUnlocked, isDone:isDone, next:nextOf, hub:hub, boot:boot
  };
})();
