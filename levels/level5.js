/* ===========================================================================
   Level 5 — VICTOR  ·  "The Bookmarks He Tore"   (FINALE)
   A fifth distinct kind of game: reconstruct the drawings Victor tore as a
   child. Four stages, each its own mechanic:
     1) REPAIR  — a jigsaw of the night everyone died (she is not among them)
     2) SORT    — tell her true bookmarks (the tiny bird) from his decoys
     3) TRAIL   — lay her bookmarks in the order she walked them
     4) ASSEMBLE— piece the last bookmark together and learn where she went
   Then: the reveal, and a winner screen for clearing all five levels.

   Plays an original music-box waltz (synthesized live, in A-minor so it sits
   with the engine's A drone instead of fighting it). Injects its own CSS and
   uses its own art, so adding it needs NO index.html edit — just drop this in.
   =========================================================================== */
(function(){
  "use strict";
  var E = window.Engine;

  /* ---------------------------------------------------------------- styles */
  if(!document.getElementById("lvl5-style")){
    var st=document.createElement("style"); st.id="lvl5-style";
    st.textContent =
      ".bm-prog{display:flex;align-items:center;gap:9px}"
     +".bm-dot{width:13px;height:13px;border-radius:50%;border:1.5px solid var(--moon-dim);opacity:.5;transition:all .5s}"
     +".bm-dot.done{background:var(--talisman);border-color:var(--talisman-bright);opacity:1}"
     +".bm-dot.now{border-color:var(--lantern-bright);box-shadow:0 0 9px var(--lantern-bright);opacity:1;animation:bmp 2.2s ease-in-out infinite}"
     +"@keyframes bmp{0%,100%{box-shadow:0 0 6px var(--lantern-bright)}50%{box-shadow:0 0 13px var(--lantern-bright)}}"
     +".l5-hint{font-family:var(--displaysc);letter-spacing:.05em;font-size:.86rem;opacity:.72;max-width:60ch;text-shadow:0 1px 8px #000;margin-top:4px}"
     +".l5-riddle{font-family:var(--display);font-style:italic;font-size:clamp(1.06rem,2.5vw,1.3rem);line-height:1.5;max-width:52ch;color:var(--talisman-bright);opacity:.95;border-left:2px solid rgba(230,180,80,.55);padding:2px 0 2px 14px;margin:9px 0 2px;text-shadow:0 1px 12px #000}"
     /* jigsaw */
     +".jg-wrap{margin:18px auto 8px;display:grid;gap:3px;width:100%;max-width:min(86vw,400px);background:rgba(0,0,0,.45);padding:4px;border-radius:7px;box-shadow:0 16px 40px rgba(0,0,0,.55)}"
     +".jg-wrap.done{gap:0;padding:0;background:none}"
     +".jg-tile{cursor:pointer;border:none;padding:0;background-repeat:no-repeat;border-radius:1px;outline:0 solid transparent;transition:box-shadow .25s,outline-width .1s,filter .2s}"
     +".jg-tile:hover{filter:brightness(1.08)}"
     +".jg-tile.sel{outline:3px solid var(--lantern-bright);outline-offset:-3px;z-index:3;position:relative}"
     +".jg-tile.ok{box-shadow:inset 0 0 0 2px rgba(230,180,80,.85)}"
     +".jg-wrap.done .jg-tile{box-shadow:none;cursor:default}"
     +".jg-msg{text-align:center;font-family:var(--displaysc);letter-spacing:.06em;margin-top:6px;min-height:1.4em;opacity:.9;text-shadow:0 1px 8px #000}"
     +".jg-msg.good{color:var(--talisman-bright)}"
     /* sort + sequence cards */
     +".cd-grid{margin:16px 0 8px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;max-width:560px}"
     +".cd{position:relative;cursor:pointer;border:2px solid rgba(255,255,255,.15);border-radius:9px;overflow:hidden;background:#15110c;aspect-ratio:3/4;padding:0;transition:transform .12s,border-color .2s,box-shadow .2s}"
     +".cd img{width:100%;height:100%;object-fit:contain;display:block;pointer-events:none}"
     +".cd:hover{transform:translateY(-3px);border-color:var(--lantern)}"
     +".cd:focus-visible{outline:2px solid var(--lantern-bright);outline-offset:2px}"
     +".cd.pick{border-color:var(--talisman);box-shadow:0 0 0 2px var(--talisman),0 0 16px rgba(230,180,80,.45)}"
     +".cd.pick::after{content:\"hers\";position:absolute;top:7px;right:7px;font-family:var(--displaysc);font-size:.62rem;letter-spacing:.08em;background:var(--talisman);color:#1a140a;padding:2px 8px;border-radius:11px;box-shadow:0 2px 8px rgba(0,0,0,.5)}"
     +".cd.bad{border-color:var(--eye);box-shadow:0 0 0 2px var(--eye),0 0 14px rgba(209,31,31,.4)}"
     +".cd.wrong{animation:shake .4s}"
     +"@keyframes shake{0%,100%{transform:none}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}"
     /* sequence slots */
     +".sq-slots{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin:18px 0 6px}"
     +".sq-slot{position:relative;width:104px;aspect-ratio:3/4;border:2px dashed rgba(255,255,255,.26);border-radius:9px;background:rgba(8,8,12,.4);overflow:hidden;cursor:pointer;display:flex;align-items:center;justify-content:center}"
     +".sq-slot.full{border-style:solid;border-color:var(--talisman)}"
     +".sq-slot img{width:100%;height:100%;object-fit:contain}"
     +".sq-slot .num{position:absolute;top:5px;left:7px;font-family:var(--display);font-size:1.1rem;opacity:.65;z-index:2;text-shadow:0 1px 6px #000}"
     +".sq-slot.empty .num{opacity:.4}"
     +".sq-pool{display:flex;gap:11px;justify-content:center;flex-wrap:wrap;margin:8px 0}"
     +".sq-pool .cd{width:104px;aspect-ratio:3/4}"
     +"@media(max-width:520px){.sq-slot,.sq-pool .cd{width:82px}}"
     +"@media(max-width:560px){.cd-grid{grid-template-columns:repeat(2,1fr)}}"
     /* reveal */
     +".rv-line{font-size:clamp(1.12rem,2.7vw,1.4rem);max-width:54ch;font-style:italic;opacity:0;transform:translateY(10px);text-shadow:0 2px 16px #000;margin-bottom:1rem;transition:opacity 1.1s ease,transform 1.1s ease}"
     +".rv-line.in{opacity:.96;transform:none}"
     +".win-names{font-family:var(--display);font-size:clamp(1.1rem,3vw,1.5rem);letter-spacing:.04em;opacity:.9;margin:8px 0 2px;text-shadow:0 2px 16px #000}"
     +".win-foot{font-family:var(--displaysc);letter-spacing:.16em;font-size:.8rem;opacity:.6;margin-top:18px;text-shadow:0 1px 10px #000}";
    document.head.appendChild(st);
  }

  /* ---------------------------------------------- original music-box waltz */
  var Waltz=(function(){
    var ctx,master,delay,fb,wet,timer,poll,on=false;
    function f(s){ return 440*Math.pow(2,s/12); }
    var beat=0.46;
    /* original wistful A-minor melody — NOT any existing song */
    var MEL=[
      [-5,1],[0,1],[3,1], [7,1],[3,1],[0,1], [2,1],[5,1],[3,1], [0,2],[null,1],
      [-5,1],[2,1],[5,1], [8,1],[7,1],[5,1], [7,1],[3,1],[0,1], [2,2],[null,1],
      [3,1],[0,1],[-2,1], [0,1],[-5,1],[-2,1], [0,1],[3,1],[2,1], [0,3]
    ];
    var ROOTS=[0,0,8,7, 0,5,3,7, 8,0,7,0]; /* one chord-root per bar */
    function voice(freq,t,dur,vel){
      var o=ctx.createOscillator(); o.type="triangle"; o.frequency.value=freq;
      var o2=ctx.createOscillator(); o2.type="sine"; o2.frequency.value=freq*2;
      var g=ctx.createGain(), g2=ctx.createGain();
      g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vel,t+0.012); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
      g2.gain.setValueAtTime(0.0001,t); g2.gain.exponentialRampToValueAtTime(vel*0.32,t+0.012); g2.gain.exponentialRampToValueAtTime(0.0001,t+dur*0.6);
      o.connect(g); g.connect(master); o2.connect(g2); g2.connect(master);
      o.start(t); o.stop(t+dur+0.05); o2.start(t); o2.stop(t+dur*0.6+0.05);
    }
    function loop(){
      if(!on) return;
      var t=ctx.currentTime+0.12, mt=t, total=0, i;
      for(i=0;i<MEL.length;i++){ var m=MEL[i]; if(m[0]!==null) voice(f(m[0]),mt,Math.min(m[1]*beat*0.95,beat*1.4),0.20); mt+=m[1]*beat; }
      for(i=0;i<MEL.length;i++) total+=MEL[i][1]*beat;
      for(var b=0;b<ROOTS.length;b++){ var r=ROOTS[b], bt=t+b*3*beat;
        voice(f(r-24),bt,beat*1.5,0.17);
        voice(f(r-12),bt+beat,beat*0.85,0.06);
        voice(f(r-12+7),bt+2*beat,beat*0.85,0.06);
      }
      timer=setTimeout(loop,(total+1.1)*1000);
    }
    function gain(){ if(master&&ctx) master.gain.setTargetAtTime((E.sound.muted&&E.sound.muted())?0:0.42, ctx.currentTime, 0.18); }
    return {
      start:function(){
        if(on) return;
        try{ ctx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return; }
        master=ctx.createGain(); master.gain.value=0.0001; master.connect(ctx.destination);
        delay=ctx.createDelay(1.0); delay.delayTime.value=0.31;
        fb=ctx.createGain(); fb.gain.value=0.24; wet=ctx.createGain(); wet.gain.value=0.17;
        master.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(ctx.destination);
        on=true; if(ctx.state==="suspended") ctx.resume();
        loop(); gain(); poll=setInterval(gain,400);
      },
      stop:function(){
        on=false; if(timer) clearTimeout(timer); if(poll) clearInterval(poll);
        try{ if(master) master.gain.setTargetAtTime(0.0001,ctx.currentTime,0.3); }catch(e){}
        setTimeout(function(){ try{ ctx&&ctx.close(); }catch(e){} },600);
      }
    };
  })();

  /* --------------------------------------------------------------- the art */
  var ART={
    massacre:"assets/draw-massacre.jpg", gone:"assets/draw-gone.jpg",
    cellar:"assets/draw-cellar.jpg", forest:"assets/draw-forest.jpg",
    doorway:"assets/draw-doorway.jpg", light:"assets/draw-light.jpg",
    car:"assets/draw-car.jpg", monster:"assets/draw-monster.jpg",
    tower:"assets/draw-tower.jpg", diner:"assets/draw-diner.jpg",
    town:"assets/draw-town.jpg", tree:"assets/draw-tree.jpg", kids:"assets/draw-kids-fake.jpg"
  };

  /* --------------------------------------------------------------- helpers */
  function statusBar(step){
    var dots=""; for(var i=1;i<=4;i++) dots+='<span class="bm-dot'+(i<step?' done':(i===step?' now':''))+'"></span>';
    return '<div class="status"><div class="bm-prog"><span class="lbl">the night</span>'+dots+'</div>'
      +'<button class="journal-tab" id="jtab"><span class="lbl">notes</span><span class="count">'+E.notebook.count()+'</span></button></div>';
  }
  function bindJ(){ var t=document.getElementById("jtab"); if(t) t.onclick=E.notebook.open; }
  function note(tag,sub,text){ E.notebook.add({tag:tag,sub:sub,text:text}); }
  function leaveTo(fn){ Waltz.stop(); fn(); }

  /* a quiet memory of his mother, before the first drawing */
  function momBeat(){
    E.nightClass(true); E.danger(false);
    E.setBg("assets/miranda.jpg","center 22%","vn");
    E.render('<div class="scene fade"><div class="eyebrow">The last time he saw her</div>'
      +'<div class="panel" style="max-width:58ch"><div class="narr">'
      +'<p class="lead">\u201cDraw me something beautiful,\u201d his mother told him. \u201cStay down in the cellar, and don\u2019t come up for anything. I\u2019ll be back before dark.\u201d</p>'
      +'<p>She wasn\u2019t. The drawings were all he had left to do \u2014 so he drew, and kept drawing, for forty years.</p>'
      +'</div></div>'
      +'<div class="actions"><button class="btn warm" id="go">Open the first drawing</button>'
      +'<button class="btn ghost" id="menu">Menu</button></div></div>');
    bindJ();
    document.getElementById("menu").onclick=function(){ leaveTo(E.hub); };
    document.getElementById("go").onclick=p1;
  }

  /* --------------------------------------------------------------- jigsaw  */
  /* tap two tiles to swap; a tile glows gold when it sits in its home spot */
  function jigsaw(cfg){
    var n=cfg.cols*cfg.rows, order=shuffle(n), sel=-1, finished=false;
    function bg(piece){
      var pc=piece%cfg.cols, pr=Math.floor(piece/cfg.cols);
      var px=cfg.cols>1?(pc/(cfg.cols-1)*100):0, py=cfg.rows>1?(pr/(cfg.rows-1)*100):0;
      return "background-image:url("+cfg.img+");background-size:"+(cfg.cols*100)+"% "+(cfg.rows*100)+"%;background-position:"+px+"% "+py+"%;";
    }
    function solved(){ for(var i=0;i<n;i++) if(order[i]!==i) return false; return true; }
    function draw(){
      var done=solved();
      var cells=""; for(var i=0;i<n;i++){
        var ok=order[i]===i;
        cells+='<button class="jg-tile'+(ok?' ok':'')+(sel===i?' sel':'')+'" data-s="'+i+'" style="'+bg(order[i])+'"></button>';
      }
      var msg = done
        ? '<div class="jg-msg good">'+cfg.solvedMsg+'</div>'
        : '<div class="jg-msg">&nbsp;</div>';
      E.render(statusBar(cfg.step)
        +'<div class="scene fade"><div class="eyebrow">'+cfg.eyebrow+'</div>'
        +'<p class="l5-hint">'+cfg.hint+'</p>'
        +'<div class="jg-wrap'+(done?' done':'')+'" style="aspect-ratio:'+cfg.aw+'/'+cfg.ah+';grid-template-columns:repeat('+cfg.cols+',1fr);grid-template-rows:repeat('+cfg.rows+',1fr)">'+cells+'</div>'
        + msg
        +'<div class="actions">'
        + (done?'<button class="btn warm" id="go">'+cfg.next+'</button>':'')
        +'<button class="btn ghost" id="menu">Menu</button></div>'
        +'</div>');
      bindJ();
      document.getElementById("menu").onclick=function(){ leaveTo(E.hub); };
      if(done){
        if(!finished){ finished=true; if(cfg.onSolve) cfg.onSolve(); }
        document.getElementById("go").onclick=cfg.onNext;
        return;
      }
      Array.prototype.forEach.call(document.querySelectorAll(".jg-tile[data-s]"), function(b){
        b.onclick=function(){
          var k=parseInt(b.getAttribute("data-s"),10);
          if(sel<0){ sel=k; draw(); }
          else if(sel===k){ sel=-1; draw(); }
          else { var t=order[sel]; order[sel]=order[k]; order[k]=t; sel=-1; draw(); }
        };
      });
    }
    draw();
  }
  function shuffle(n){
    var a=[],i; for(i=0;i<n;i++) a.push(i);
    for(i=n-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)), t=a[i]; a[i]=a[j]; a[j]=t; }
    for(i=0;i<n;i++){ if(a[i]!==i) return a; }
    return shuffle(n);
  }

  /* --------------------------------------------------------------- state   */
  function boot(){
    E.notebook.clear(); E.notebook.config("Victor\u2019s Drawings"); E.notebook.subtitle("what he tore");
    intro();
  }

  /* ------------------------------------------------------------ 0 · intro  */
  function intro(){
    E.nightClass(false); E.danger(false);
    E.setBg("assets/victor.jpg","center 20%","vn");
    E.render('<div class="scene bottom fade">'
      +'<div class="vn-tag">Level Five — Victor</div>'
      +'<div class="dialogue" style="max-width:62ch"><div class="speaker">Victor</div>'
      +'<div class="line">\u201cMy mother said draw the pictures and stay in the cellar, and when she came back we\u2019d go home. She didn\u2019t come back. None of them did.\u201d</div>'
      +'<div class="line">\u201cThere\u2019s a trunk of drawings I never let anyone open. I told everybody my sister died that night. That was the only way to keep her\u2026\u201d \u2014 he stops. \u201cI\u2019m afraid to remember. But you should see. Help me put them back together.\u201d</div>'
      +'<div class="actions"><button class="btn warm" id="go">Open the trunk</button>'
      +'<button class="btn ghost" id="menu">Menu</button></div></div>');
    document.getElementById("go").onclick=function(){ E.startMusic(); E.sound.setMood("day"); Waltz.start(); momBeat(); };
    document.getElementById("menu").onclick=E.hub;
  }

  /* -------------------------------------------------- 1 · REPAIR (jigsaw)  */
  function p1(){
    E.nightClass(true); E.danger(false);
    E.setBg("assets/v-cellar.jpg","center 50%","heavy");
    jigsaw({
      step:1, img:ART.massacre, cols:3, rows:3, aw:754, ah:1058,
      eyebrow:"Repair the first drawing",
      hint:"He tore this one to pieces as a boy. Tap two pieces to swap them \u2014 a piece glows gold when it\u2019s home.",
      solvedMsg:"The night everyone died. And one small figure, in red, still standing.",
      next:"Look closer \u203a",
      onSolve:function(){ note("The night it happened","the first torn drawing","Stick figures fallen in the dark \u2014 and at the edge, one small girl in a red dress, upright, untouched. She is not among the dead."); },
      onNext:p1reveal
    });
  }
  function p1reveal(){
    E.setBg("assets/draw-massacre.jpg","center 60%","heavy");
    E.render('<div class="scene fade"><div class="eyebrow">The first bookmark</div>'
      +'<div class="panel" style="max-width:60ch"><div class="narr">'
      +'<p class="lead">Everyone fell that night. Victor counted them for forty years. But the drawing he tore first is the one that shows the truth he couldn\u2019t hold: the little girl in the red dress is <em>standing</em>. Apart. Alive.</p>'
      +'<p>\u201cEloise,\u201d he says, like the name costs him something. \u201cMy sister. She didn\u2019t die here. She had a way of\u2026 leaving.\u201d</p>'
      +'</div></div>'
      +'<div class="actions"><button class="btn warm" id="go">Find her drawings</button>'
      +'<button class="btn ghost" id="menu">Menu</button></div></div>');
    document.getElementById("menu").onclick=function(){ leaveTo(E.hub); };
    document.getElementById("go").onclick=p2;
  }

  /* ------------------------------------------------------ 2 · SORT (bird)  */
  function p2(){
    E.nightClass(true); E.danger(false);
    E.setBg("assets/v-cellar.jpg","center 40%","heavy");
    var hers={cellar:1,forest:1,doorway:1,light:1};
    var cards=["cellar","car","forest","monster","doorway","tower","light","diner","kids"];
    var picks={};
    function render(){
      var grid=cards.map(function(k){
        return '<button class="cd'+(picks[k]?' pick':'')+'" data-k="'+k+'"><img src="'+ART[k]+'" alt=""></button>';
      }).join("");
      E.render(statusBar(2)
        +'<div class="scene fade"><div class="eyebrow">Find her true bookmarks</div>'
        +'<p class="l5-hint">His trunk is full of drawings \u2014 most are his own, and decoys he drew to throw searchers off. He recites the riddle she made him learn, so he\u2019d always know her true pages from the rest:</p>'
        +'<p class="l5-riddle">\u201cIt wears its wings but never leaves. It keeps to a corner, small and still. It watches every page that is mine, and sings where no one can hear. Mark the pages it guards \u2014 and leave all the others be.\u201d</p>'
        +'<p class="l5-hint" style="margin-top:8px;opacity:.6">Tap the drawings you believe are hers.</p>'
        +'<div class="cd-grid">'+grid+'</div>'
        +'<div class="jg-msg" id="m">&nbsp;</div>'
        +'<div class="actions"><button class="btn warm" id="go">These are hers</button>'
        +'<button class="btn ghost" id="menu">Menu</button></div></div>');
      bindJ();
      document.getElementById("menu").onclick=function(){ leaveTo(E.hub); };
      Array.prototype.forEach.call(document.querySelectorAll(".cd[data-k]"), function(b){
        b.onclick=function(){ var k=b.getAttribute("data-k"); if(picks[k]) delete picks[k]; else picks[k]=1; render(); };
      });
      document.getElementById("go").onclick=function(){
        var chosen=Object.keys(picks), okCount=0, wrong=[];
        chosen.forEach(function(k){ if(hers[k]) okCount++; else wrong.push(k); });
        var missing = Object.keys(hers).filter(function(k){ return !picks[k]; });
        if(okCount===4 && wrong.length===0){
          note("Her four bookmarks","sorted from his decoys","The watcher in the riddle was a little bird, folded into the corner of every true page. Four carry it: the cellar, the forest edge, the lit doorway, the seam of light. The rest are his.");
          p3();
        } else {
          var m=document.getElementById("m"); m.className="jg-msg";
          if(wrong.length){ m.innerHTML="Nothing keeps watch on that page \u2014 it was his."; wrong.forEach(function(k){ var el=document.querySelector('.cd[data-k="'+k+'"]'); if(el){ el.classList.add("bad","wrong"); } }); }
          else { m.innerHTML="One of hers still waits unmarked. Look closer at the corners."; }
          setTimeout(function(){ Array.prototype.forEach.call(document.querySelectorAll(".cd.wrong"),function(e){e.classList.remove("wrong");}); },420);
        }
      };
    }
    render();
  }

  /* -------------------------------------------------- 3 · TRAIL (sequence) */
  function p3(){
    E.nightClass(true); E.danger(false);
    E.setBg("assets/v-clearing.jpg","center 45%","heavy");
    var ORDER=["cellar","massacre","forest","doorway","light"]; // her night, in the order it happened
    var DECOYS=["town","tree"];                                 // his false trails (no bird)
    var POOL=ORDER.concat(DECOYS);
    for(var x=POOL.length-1;x>0;x--){ var r=Math.floor(Math.random()*(x+1)), tmp=POOL[x]; POOL[x]=POOL[r]; POOL[r]=tmp; }
    var hers={}; ORDER.forEach(function(k){ hers[k]=1; });
    var placed=[];
    function render(){
      var slots=""; for(var i=0;i<ORDER.length;i++){
        var k=placed[i];
        slots+='<button class="sq-slot '+(k?'full':'empty')+'" data-slot="'+i+'"><span class="num">'+(i+1)+'</span>'+(k?'<img src="'+ART[k]+'" alt="">':'')+'</button>';
      }
      var pool=POOL.filter(function(k){ return placed.indexOf(k)<0; })
        .map(function(k){ return '<button class="cd" data-k="'+k+'"><img src="'+ART[k]+'" alt=""></button>'; }).join("");
      E.render(statusBar(3)
        +'<div class="scene fade"><div class="eyebrow">Walk her path</div>'
        +'<p class="l5-hint">Not every page here is hers, and the true ones are shuffled. Keep only the pages that bear her mark \u2014 then lay them the way that night happened, from the cellar where she hid to the light she walked into. The order in between, you must work out for her.</p>'
        +'<div class="sq-slots">'+slots+'</div>'
        +(pool?'<div class="sq-pool">'+pool+'</div>':'<div class="sq-pool" style="opacity:.5;font-family:var(--displaysc);letter-spacing:.06em;font-size:.82rem">all placed</div>')
        +'<div class="jg-msg" id="m">&nbsp;</div>'
        +'<div class="actions">'
        +(placed.length===ORDER.length?'<button class="btn warm" id="go">Follow the trail</button>':'')
        +'<button class="btn ghost" id="clr">Clear</button>'
        +'<button class="btn ghost" id="menu">Menu</button></div></div>');
      bindJ();
      document.getElementById("menu").onclick=function(){ leaveTo(E.hub); };
      document.getElementById("clr").onclick=function(){ placed=[]; render(); };
      Array.prototype.forEach.call(document.querySelectorAll(".sq-pool .cd[data-k]"), function(b){
        b.onclick=function(){ if(placed.length<ORDER.length){ placed.push(b.getAttribute("data-k")); render(); } };
      });
      Array.prototype.forEach.call(document.querySelectorAll(".sq-slot[data-slot]"), function(b){
        b.onclick=function(){ var s=parseInt(b.getAttribute("data-slot"),10); if(placed[s]!=null){ placed.splice(s,1); render(); } };
      });
      var go=document.getElementById("go");
      if(go) go.onclick=function(){
        if(placed.join()===ORDER.join()){
          note("Her path","the trail re-laid","Her night, in order: the cellar where she hid, the field of the fallen, the edge of the trees, the door of light, the seam she stepped into. Two of his false trails set aside.");
          p4();
        } else {
          var m=document.getElementById("m"); m.className="jg-msg";
          if(placed.some(function(k){ return !hers[k]; })){ m.innerHTML="One of these was never hers \u2014 look again for the mark in the corner."; }
          else { m.innerHTML="These are hers, but not the way it happened. Start where she hid; end in the light."; }
        }
      };
    }
    render();
  }

  /* ------------------------------------------------ 4 · ASSEMBLE (jigsaw)  */
  function p4(){
    E.nightClass(true); E.danger(true);
    E.setBg("assets/v-clearing.jpg","center 50%","heavy");
    jigsaw({
      step:4, img:ART.gone, cols:3, rows:4, aw:780, ah:946,
      eyebrow:"Assemble the last bookmark",
      hint:"The final drawing \u2014 the one he tore smallest. Put it back together and see where she went.",
      solvedMsg:"A girl, half here and half gone \u2014 walking into a seam of light.",
      next:"But who was she? \u203a",
      onSolve:function(){ note("The last bookmark","assembled at last","A girl half here and half gone, dissolving into a seam of gold light, a bird rising \u2014 and far behind her, a small figure in yellow that cannot follow."); },
      onNext:askBeat
    });
  }

  /* ---------------------------------------------------- 4b · the question  */
  function askBeat(){
    E.nightClass(true); E.danger(false);
    E.setBg("assets/draw-gone.jpg","center 45%","heavy");
    E.render('<div class="scene fade" style="text-align:center;align-items:center;justify-content:center">'
      +'<div class="eyebrow">She isn\u2019t among the dead</div>'
      +'<p class="lede" style="max-width:48ch;margin:0 auto 22px">The same small figure is in every one of her bookmarks \u2014 the red dress, the dark hair, always walking toward the light. Victor stares at the face he drew a thousand times, and the question he buried forty years ago finally surfaces.</p>'
      +'<h2 class="q-prompt" style="margin:0 auto">Was it Eloise?</h2>'
      +'<div class="actions" style="justify-content:center"><button class="btn warm" id="go">Let himself remember</button>'
      +'<button class="btn ghost" id="menu">Menu</button></div></div>');
    bindJ();
    document.getElementById("menu").onclick=function(){ leaveTo(E.hub); };
    document.getElementById("go").onclick=reveal;
  }

  /* ----------------------------------------------------------- 5 · reveal  */
  /* the answer arrives slowly — each piece of it on its own image */
  function reveal(){
    var seq=[
      { img:"assets/eloise.jpg", focal:"center 30%", scrim:"vn",
        line:"His sister. He\u2019d drawn her so many times the pencil knew her without him \u2014 and in every drawing she was doing the same impossible thing, stepping somewhere none of the rest of them could follow." },
      { img:"assets/draw-gone.jpg", focal:"center 50%", scrim:"heavy",
        line:"And slowly the thing he never let himself believe settles into place. She didn\u2019t die that night. The drawings were never only pictures \u2014 they were doors, and she could walk through them and pull them shut behind her." },
      { img:"assets/yellow.jpg", focal:"center 24%", scrim:"vn", danger:true,
        line:"Something in a yellow suit would have followed her \u2014 if a terrified boy hadn\u2019t torn up the only map of where she\u2019d gone." },
      { img:"assets/victor-young.jpg", focal:"center 42%", scrim:"heavy",
        line:"He scattered the pieces. He told the whole town she was dead. For forty years, \u2018she\u2019s gone\u2019 was how a small boy kept his sister hidden." },
      { img:"assets/eloise.jpg", focal:"center 28%", scrim:"med", night:false, last:true,
        line:"She\u2019s still out there. Somewhere a page over \u2014 exactly the way he wanted." }
    ];
    var i=0;
    function step(){
      var s=seq[i];
      E.nightClass(s.night!==false); E.danger(!!s.danger);
      E.setBg(s.img, s.focal, s.scrim);
      E.render('<div class="scene fade" style="text-align:center;align-items:center;justify-content:center">'
        +'<div class="eyebrow">'+(s.last?"Where she went":"\u2014")+'</div>'
        +'<p class="rv-line" id="ln" style="margin:0 auto">'+s.line+'</p>'
        +'<div class="actions" style="justify-content:center"><button class="btn warm" id="go">'+(s.last?"The dark is held back":"\u203a")+'</button>'
        +(s.last?'<button class="btn ghost" id="menu">Menu</button>':'')+'</div></div>');
      setTimeout(function(){ var l=document.getElementById("ln"); if(l) l.classList.add("in"); },60);
      document.getElementById("go").onclick=function(){ if(s.last){ winner(); } else { i++; step(); } };
      var m=document.getElementById("menu"); if(m) m.onclick=function(){ leaveTo(E.hub); };
    }
    step();
  }

  /* ----------------------------------------------------------- 6 · winner  */
  function winner(){
    E.complete("victor");
    E.nightClass(false); E.danger(false);
    E.setBg("assets/eloise.jpg","center 28%","med");
    E.render('<div class="scene fade" style="text-align:center;align-items:center">'
      +'<div class="eyebrow">You survived the night. Five times.</div>'
      +'<h1 class="title" style="font-size:clamp(2.6rem,9vw,4.6rem)">Survive<br>&amp; Solve</h1>'
      +'<div class="win-names">Boyd \u00b7 Tabitha \u00b7 Jade \u00b7 Julie \u00b7 Victor</div>'
      +'<p class="lede" style="font-style:italic;max-width:46ch;margin:14px auto 0;opacity:.92">Every story solved. The dark held back \u2014 for now. And somewhere a page over, a girl is still drawing.</p>'
      +'<div class="win-foot">\u2014 SURVIVE &amp; SOLVE \u00b7 COMPLETE \u2014</div>'
      +'<div class="actions" style="justify-content:center"><button class="btn warm" id="again">Play this finale again</button>'
      +'<button class="btn ghost" id="menu">Back to the menu</button></div>'
      +'</div>');
    document.getElementById("again").onclick=boot;
    document.getElementById("menu").onclick=function(){ leaveTo(E.hub); };
  }

  /* -------------------------------------------------------------- register */
  E.addLevel({ id:"victor", num:5, title:"Victor", tagline:"Piece the torn drawings back \u2014 and learn where she went", start:boot });
})();
