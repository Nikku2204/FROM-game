/* ===========================================================================
   Level 2 — TABITHA  ·  "Remember, before the dark does"
   A different game from Boyd: no townsfolk, no trivia. A MEMORY mechanic.
   The children in white show patterns; Tabitha reproduces them from memory.
   At night she must hold the remembered patterns — and one vision lies to her.
   Registers itself with the engine at the bottom.
   =========================================================================== */
(function(){
  "use strict";
  var E = window.Engine;

  /* ---------- the four marks (memory-board glyphs) ---------- */
  var GLYPH = [
    '<svg viewBox="0 0 40 40"><path d="M20 6 V34 M20 14 l-7 -7 M20 14 l7 -7 M20 23 l-8 -8 M20 23 l8 -8"/></svg>',
    '<svg viewBox="0 0 40 40"><path d="M20 7 L33 31 H7 Z"/></svg>',
    '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="12"/><path d="M9 20 H31"/></svg>',
    '<svg viewBox="0 0 40 40"><path d="M7 12 L15 30 L20 16 L25 30 L33 12"/></svg>'
  ];

  /* ---------- memory meter (three held memories, Tabitha's "talisman") ---------- */
  function memHud(n){
    var pips=''; for(var i=0;i<3;i++){ pips+='<span class="mem-pip'+(i<n?' lit':'')+'"></span>'; }
    return '<div class="status"><div class="mem-hud"><span class="lbl">memory</span>'+pips+'</div>'
      +'<button class="journal-tab" id="jtab"><span class="lbl">recovered</span><span class="count">'+E.notebook.count()+' / 3</span></button></div>';
  }
  function bindJ(){ var t=document.getElementById("jtab"); if(t) t.onclick=E.notebook.open; }

  /* ---------- day-phase visions ---------- */
  var VISIONS = [
    { id:0, title:"The Treeline", bg:"assets/kids.jpg", focal:"center 44%", scrim:"heavy",
      lead:"Three children in white stand where the trees go dark. They never speak. They only show you \u2014 the order in which the houses wake.",
      seq:[0,2,1],
      shard:{tag:"I \u00b7 The Waking", text:"The houses don\u2019t wake at random. The children showed the order: first mark, then ring, then triangle. Hold it."} },
    { id:1, title:"The Bark", bg:"assets/tabitha.jpg", focal:"center 28%", scrim:"med",
      lead:"A child lifts a small hand to the carved tree and traces the symbol for you, stroke by stroke, the way it was first cut.",
      seq:[1,3,0,2],
      shard:{tag:"II \u00b7 The Carving", text:"The symbol is cut in a set order \u2014 triangle, the broken line, first mark, ring. The order is the meaning."} },
    { id:2, title:"The Doorway", bg:"assets/doorway.jpg", focal:"center 42%", scrim:"med",
      lead:"In a lit doorway a child hums a tune with no words. Each note lights as a mark in the dark. Remember them.",
      seq:[2,0,3,1],
      shard:{tag:"III \u00b7 The Tune", text:"A wordless tune \u2014 four notes as marks: ring, first mark, broken line, triangle. It is the way through the night."} }
  ];

  /* ---------- night rounds ---------- */
  var NIGHT = [
    { len:3, type:"plain", bg:"assets/kids.jpg",    focal:"center 44%" },
    { len:3, type:"decoy", bg:"assets/doorway.jpg", focal:"center 42%" },
    { len:4, type:"plain", bg:"assets/tower.jpg",   focal:"center 40%" }
  ];

  /* ---------- state ---------- */
  var S, M;
  function reset(){
    S={ vIndex:0, nIndex:0, correct:0, recorded:{} };
    M={ accepting:false, seq:[], pos:0, onWin:null, onFail:null };
  }

  /* ---------- low-level board ---------- */
  function boardHTML(){
    var t=''; for(var i=0;i<4;i++){ t+='<button class="mtile" data-i="'+i+'" aria-label="mark '+(i+1)+'">'+GLYPH[i]+'</button>'; }
    return '<div class="mboard locked" id="mboard">'+t+'</div>';
  }
  function bindBoard(){
    Array.prototype.forEach.call(document.querySelectorAll(".mtile"), function(b){
      b.onclick=function(){ onTile(parseInt(b.getAttribute("data-i"),10)); };
    });
  }
  function lockBoard(on){ var b=document.getElementById("mboard"); if(b) b.classList.toggle("locked", !!on); }
  function flash(i,dur){ var el=document.querySelector('.mtile[data-i="'+i+'"]'); if(!el) return; el.classList.add("flash"); setTimeout(function(){ el.classList.remove("flash"); }, dur); }
  function setWatch(t){ var e=document.getElementById("watchTag"); if(e) e.textContent=t; }
  function setActions(id, btns){
    var c=document.getElementById(id); if(!c) return;
    c.innerHTML = btns.map(function(b,k){ return '<button class="btn '+(b.cls||'')+'" data-k="'+k+'">'+b.label+'</button>'; }).join("");
    Array.prototype.forEach.call(c.querySelectorAll("button"), function(bn){ bn.onclick=btns[parseInt(bn.getAttribute("data-k"),10)].fn; });
  }
  function genSeq(len){ var a=[],prev=-1,v; for(var i=0;i<len;i++){ do{ v=Math.floor(Math.random()*4); }while(v===prev); a.push(v); prev=v; } return a; }

  function playSeq(seq, opts, done){
    opts=opts||{}; var gap=opts.gap||640, dur=opts.dur||380; lockBoard(true); M.accepting=false;
    var i=0;
    (function step(){
      if(i>=seq.length){ setTimeout(function(){ if(done) done(); }, 220); return; }
      flash(seq[i],dur); i++; setTimeout(step, gap);
    })();
  }
  function beginInput(seq, onWin, onFail){
    M.seq=seq; M.pos=0; M.accepting=true; M.onWin=onWin; M.onFail=onFail; lockBoard(false);
  }
  function onTile(i){
    if(!M.accepting) return;
    flash(i,240);
    if(i===M.seq[M.pos]){
      M.pos++;
      if(M.pos>=M.seq.length){ M.accepting=false; lockBoard(true); var w=M.onWin; M.onWin=M.onFail=null; if(w) w(); }
    } else {
      M.accepting=false; lockBoard(true); var f=M.onFail; M.onWin=M.onFail=null; if(f) f();
    }
  }

  /* ---------- entry ---------- */
  function boot(){
    reset();
    E.notebook.clear(); E.notebook.config("Tabitha\u2019s Memory"); E.notebook.subtitle("memories \u2014 0 of 3");
    intro();
  }

  function intro(){
    E.nightClass(false); E.danger(false);
    E.setBg("assets/tower.jpg","center 40%","med");
    E.render('<div class="scene fade">'
      +'<div class="eyebrow">Level Two — Tabitha</div>'
      +'<h1 class="title">What She Must<span class="sub">— Remember</span></h1>'
      +'<div class="panel" style="margin-top:24px;max-width:60ch"><p class="lede" style="margin:0">Boyd had a charm to piece together. Tabitha has only what she can hold in her head. The children in white keep showing her things \u2014 and the dark is patient enough to wait for her to forget.</p></div>'
      +'<div class="actions"><button class="btn warm" id="go">Follow the light in the trees</button>'
      +'<button class="btn ghost" id="menu">Menu</button></div></div>');
    document.getElementById("go").onclick=function(){ E.startMusic(); premise(); };
    document.getElementById("menu").onclick=E.hub;
  }

  function premise(){
    E.setBg("assets/doorway.jpg","center 42%","med");
    E.render('<div class="scene fade">'
      +'<div class="eyebrow">The visions</div>'
      +'<div class="panel"><div class="narr">'
      +'<p class="lead">They come to her in the half-light \u2014 children who drowned a long time ago, standing too still, showing her patterns she half-recognises. A door. A carving. A tune with no words.</p>'
      +'<p>She has learned the rule the hard way: the patterns are real, and they keep her alive at night \u2014 but only if she remembers them exactly. Memory is the only talisman she is given.</p>'
      +'</div></div><div class="actions"><button class="btn" id="b">She\u2019s there, between the trees</button></div></div>');
    document.getElementById("b").onclick=dayIntro;
  }

  function dayIntro(){
    E.setBg("assets/kids.jpg","center 44%","heavy");
    E.render(memHud(0)
      +'<div class="scene fade"><div class="eyebrow">Before dark — three memories to recover</div>'
      +'<div class="panel"><div class="narr">'
      +'<p class="lead">Each child will <em>show</em> her a pattern \u2014 the marks lighting in order. She has to watch, then repeat it back from memory. Get it right and the memory settles into place, recovered.</p>'
      +'<p>There are three to gather before the light goes. Take your time with them now. Tonight there will be none.</p>'
      +'</div></div><div class="actions"><button class="btn warm" id="b">Go to the first child</button></div></div>');
    bindJ();
    document.getElementById("b").onclick=function(){ vision(0); };
  }

  function vision(idx){
    S.vIndex=idx;
    var V=VISIONS[idx];
    E.nightClass(false); E.danger(false);
    E.setBg(V.bg,V.focal,V.scrim);
    E.render(memHud(E.notebook.count())
      +'<div class="scene fade">'
      +'<div class="eyebrow">Memory '+(idx+1)+' of 3 — '+V.title+'</div>'
      +'<div class="panel" style="max-width:60ch"><div class="narr" style="margin:0"><p style="margin:0">'+V.lead+'</p></div></div>'
      +boardHTML()
      +'<div class="watch-tag" id="watchTag">She waits for you to be ready.</div>'
      +'<div class="actions" id="vAct"></div></div>');
    bindJ(); bindBoard(); lockBoard(true);

    function start(){
      setWatch("Watch \u2014 the marks she lights.");
      setActions("vAct", [{label:"\u2026watching", cls:"ghost", fn:function(){}}]);
      playSeq(V.seq, {gap:660,dur:400}, function(){
        setWatch("Now repeat what she showed you.");
        setActions("vAct", []);
        beginInput(V.seq, win, fail);
      });
    }
    function win(){
      setWatch("It settles into place. Recovered.");
      if(!S.recorded[V.id]){
        S.recorded[V.id]=true;
        E.notebook.add({tag:V.shard.tag, sub:"a recovered memory", text:V.shard.text});
        E.notebook.subtitle("memories \u2014 "+E.notebook.count()+" of 3");
      }
      var hud=document.querySelector(".mem-hud");
      if(hud){ var n=E.notebook.count(); var pips=''; for(var i=0;i<3;i++){ pips+='<span class="mem-pip'+(i<n?' lit':'')+'"></span>'; } hud.innerHTML='<span class="lbl">memory</span>'+pips; }
      var last=idx>=VISIONS.length-1;
      setActions("vAct", [{label: last?"The light is going\u2026":"Follow her to the next", cls:"warm", fn:function(){ if(last) dusk(); else vision(idx+1); }}]);
    }
    function fail(){
      setWatch("The memory slips through her fingers. Again.");
      setActions("vAct", [{label:"Watch again", fn:start}]);
    }
    setActions("vAct", [{label:"Watch the pattern", cls:"warm", fn:start}]);
  }

  function dusk(){
    E.nightClass(true); E.danger(true);
    E.setBg("assets/doorway.jpg","center 42%","med");
    E.sound.setMood("night");
    E.render('<div class="scene fade">'
      +'<div class="eyebrow">Dusk</div>'
      +'<div class="panel"><div class="narr">'
      +'<p class="lead">The light fails and the visions begin to blur into one another \u2014 the door, the carving, the tune, all crowding for the same space in her head. Somewhere close, the children have stopped showing her things and simply watch.</p>'
      +'<p>Tonight the patterns come back to test her. One of them will come back <em>wrong</em>, wearing the shape of a true memory. She will have to know the difference.</p>'
      +'</div></div><div class="actions"><button class="btn" id="b">Hold what is true</button></div></div>');
    document.getElementById("b").onclick=nightIntro;
  }

  function nightIntro(){
    E.nightClass(true); E.danger(true);
    E.setBg("assets/kids.jpg","center 44%","night");
    E.render(memHud(0)
      +'<div class="scene fade"><div class="eyebrow">Nightfall</div>'
      +'<div class="panel"><div class="narr">'
      +'<p class="lead">No charm. No marked tree. Only the patterns she carried out of the daylight, and whether she can repeat them now with the dark leaning over her shoulder.</p>'
      +'<p>Three will come. Hold each one and a memory stays lit. Lose it, and a piece of her goes dark.</p>'
      +'</div></div><div class="actions"><button class="btn warm" id="b">Begin. Hold the first.</button></div></div>');
    bindJ();
    document.getElementById("b").onclick=function(){ S.nIndex=0; S.correct=0; nightRound(0); };
  }

  function nightRound(idx){
    S.nIndex=idx;
    var R=NIGHT[idx];
    E.nightClass(true); E.danger(true);
    E.setBg(R.bg, R.focal, "night");
    var seq=genSeq(R.len), altered=null;
    if(R.type==="decoy"){
      altered=seq.slice();
      var p=Math.floor(Math.random()*altered.length), v;
      do{ v=Math.floor(Math.random()*4); }while(v===altered[p]);
      altered[p]=v;
    }
    E.render(memHud(S.correct)
      +'<div class="scene fade">'
      +'<div class="q-progress">Night — pattern '+(idx+1)+' of 3'+(R.type==="decoy"?' \u00b7 one of these is a lie':'')+'</div>'
      +'<div class="q-prompt" style="font-size:clamp(1.3rem,4vw,1.8rem)">'+(R.type==="decoy"?"Two versions come. Repeat the true one.":"The pattern returns. Hold it.")+'</div>'
      +boardHTML()
      +'<div class="watch-tag" id="watchTag">&nbsp;</div>'
      +'<button class="ref-toggle" id="ref">check her memory</button>'
      +'<div class="actions" id="nAct"></div></div>');
    bindJ(); bindBoard(); lockBoard(true);
    document.getElementById("ref").onclick=E.notebook.open;

    function run(){
      setActions("nAct", [{label:"\u2026watching", cls:"ghost", fn:function(){}}]);
      if(R.type==="decoy"){
        setWatch("Watch \u2014 the true memory.");
        playSeq(seq, {gap:560,dur:340}, function(){
          setWatch("Now the vision\u2019s version \u2014 a lie.");
          setTimeout(function(){
            playSeq(altered, {gap:560,dur:340}, function(){
              setWatch("Repeat the TRUE pattern \u2014 the first one.");
              beginInput(seq, win, fail);
            });
          }, 760);
        });
      } else {
        setWatch("Watch.");
        playSeq(seq, {gap:560,dur:340}, function(){
          setWatch("Now hold it \u2014 repeat it back.");
          beginInput(seq, win, fail);
        });
      }
    }
    function advance(ok){
      setWatch(ok ? "It holds. The dark gives ground." : "It slips. Something steps closer.");
      var hud=document.querySelector(".mem-hud");
      if(hud){ var pips=''; for(var i=0;i<3;i++){ pips+='<span class="mem-pip'+(i<S.correct?' lit':'')+'"></span>'; } hud.innerHTML='<span class="lbl">memory</span>'+pips; }
      var last=idx>=NIGHT.length-1;
      setActions("nAct", [{label: last?"See what the dawn brings":"The next one is already coming\u2026", cls:(ok?"warm":""), fn:function(){ if(last) end(); else nightRound(idx+1); }}]);
    }
    function win(){ S.correct++; advance(true); }
    function fail(){ advance(false); }
    setActions("nAct", [{label:"Hold the pattern", cls:"warm", fn:run}]);
  }

  function end(){
    var c=S.correct, eyebrow,title,body,img,focal,scrim,warm;
    if(c>=3){ img="assets/tower.jpg"; focal="center 38%"; scrim="med"; warm=true; E.nightClass(false); E.danger(false);
      eyebrow="Dawn — she held all of it"; title="Tabitha remembers.";
      body='<p class="lead">The children are gone with the dark, the way they always go. Every pattern stayed whole in her head, and the night never found the gap it was looking for.</p>'
        +'<p>She doesn\u2019t feel safe. She feels like someone who has learned exactly how much there is to lose. She survived on memory alone \u2014 and the memory is hers to keep.</p>'; }
    else if(c===2){ img="assets/doorway.jpg"; focal="center 42%"; scrim="night"; warm=false; E.nightClass(true); E.danger(true);
      eyebrow="Dawn — one memory went dark"; title="She lives. One piece short.";
      body='<p class="lead">Dawn finds her still standing, but a piece of what she held slipped loose in the night, and something got close enough that she felt it breathe.</p>'
        +'<p>She made it. She also knows, now, that a longer night \u2014 a harder pattern \u2014 would have taken the rest. And the nights here are only getting longer.</p>'; }
    else { img="assets/doorway.jpg"; focal="center 42%"; scrim="night"; warm=false; E.nightClass(true); E.danger(true);
      eyebrow="No morning for her"; title="The pattern breaks.";
      body='<p class="lead">The marks scatter in her mind, true and false tangled past telling apart, and the thing wearing a child\u2019s shape is the last thing she sees clearly.</p>'
        +'<p>What she knew goes dark with her. The children will find someone new to show.</p>'; }

    if(c>=2) E.complete("tabitha");

    E.setBg(img,focal,scrim);
    var nxt=E.next("tabitha"), canNext = nxt && E.isUnlocked(nxt.id);
    var nextBtn = canNext ? '<button class="btn warm" id="nextLvl">Level '+nxt.num+' — '+nxt.title+' \u203a</button>' : '';
    E.render('<div class="scene fade">'
      +'<div class="end-head"><div class="mem-hud" style="gap:7px">'
      + (function(){ var p=''; for(var i=0;i<3;i++){ p+='<span class="mem-pip'+(i<c?' lit':'')+'"></span>'; } return p; })()
      +'</div><div><div class="eyebrow" style="margin:0 0 6px">'+eyebrow+'</div>'
      +'<h2 class="title" style="font-size:clamp(2.3rem,7vw,3.6rem)">'+title+'</h2></div></div>'
      +'<div class="panel"><div class="narr">'+body+'</div>'
      +'<div class="narr" style="margin-top:14px;opacity:.78;font-size:1rem">Memories recovered: <strong>'+E.notebook.count()+'/3</strong> &nbsp;\u00b7&nbsp; Patterns held: <strong>'+c+'/3</strong></div></div>'
      +'<div class="actions"><button class="btn '+(warm?'':'warm')+'" id="again">Walk into the visions again</button>'
      + nextBtn
      +'<button class="btn ghost" id="menu">Menu</button></div>'
      +(canNext?'':'<p style="margin-top:14px;font-family:var(--displaysc);letter-spacing:.06em;font-size:.82rem;opacity:.6;text-shadow:0 1px 8px #000">Level III — Julie is still being carved. The newcomer who says she knows the way out.</p>')
      +'</div>');
    document.getElementById("again").onclick=boot;
    document.getElementById("menu").onclick=E.hub;
    if(canNext) document.getElementById("nextLvl").onclick=function(){ E.startLevel(nxt.id); };
  }

  /* ---------- register with the engine ---------- */
  E.addLevel({ id:"tabitha", num:2, title:"Tabitha", tagline:"Remember, before the dark does", start:boot });
})();
