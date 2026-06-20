/* ===========================================================================
   Level 1 — BOYD  ·  "Decode the carving, survive the night"
   A self-contained level. It registers itself with the engine at the bottom.
   Mechanic: gather clue fragments from townsfolk by day, then answer night
   questions to assemble the talisman. Each level can play totally differently;
   this is just Boyd's.
   =========================================================================== */
(function(){
  "use strict";
  var E = window.Engine;

  /* ---------- talisman charm (Boyd-specific visual) ---------- */
  function charmSVG(lit,whole,big){
    var cls="charm"+(whole?" whole":"")+(big?" charm-big":""), size=big?92:30;
    var segs=["M48 6 A42 42 0 0 1 84.4 27","M84.4 69 A42 42 0 0 1 11.6 69","M11.6 27 A42 42 0 0 1 48 6"];
    var p="";for(var i=0;i<3;i++){p+='<path class="seg'+(i<lit?' lit':'')+'" d="'+segs[i]+'"/>';}
    var core='<circle class="core" cx="48" cy="48" r="20"/>'
      +'<path d="M48 60 V42 M48 46 l-6 -6 M48 46 l6 -6 M48 52 l-7 -7 M48 52 l7 -7" stroke="'+(whole?'#ffd97a':'#8b93a4')+'" stroke-width="2" fill="none" stroke-linecap="round"/>';
    return '<svg class="'+cls+'" width="'+size+'" height="'+size+'" viewBox="0 0 96 96" aria-hidden="true">'+p+core+'</svg>';
  }
  var LANTERN='<svg class="lant" viewBox="0 0 15 21" aria-hidden="true"><path d="M5 1h5l1 2H4z" fill="#7a5a2a"/><rect x="3" y="3" width="9" height="2" rx="1" fill="#5a4220"/><path d="M3.5 5h8l1 11a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1z" fill="#3a2c20"/><rect x="5" y="7" width="5" height="8" rx="1.5" fill="#f0bd5e"/><rect x="6" y="8" width="3" height="6" rx="1" fill="#fff3d6"/><rect x="3" y="16" width="9" height="2" rx="1" fill="#5a4220"/></svg>';

  /* ---------- cast & clues ---------- */
  var NPCS = {
    jim:{ name:"Jim", role:"the engineer — works the problem", img:"assets/jim.jpg", focal:"50% 16%",
      suspect:false, truthful:true,
      lines:["Jim doesn\u2019t look up from the map; his finger keeps tracing lines between the carved trees.",
             "\u201cI\u2019ve been cross-referencing the marks against the old town-loop map. They\u2019re not random, Boyd \u2014 every tree still wearing bark after a bad night has one. It\u2019s a map. The marked trees are the safe ones. I\u2019d stake my life on it. I think people already have.\u201d"],
      fragTag:"A \u00b7 The Shape", fragText:"The carvings are a MAP. Marked trees are the safe ones to stand by at night. Jim matched them to the town-loop map." },
    kenny:{ name:"Kenny", role:"the deputy — practical, steady", img:"assets/kenny.jpg", focal:"60% 18%",
      suspect:false, truthful:true,
      lines:["Kenny keeps his voice low and even, like he\u2019s walked someone through this before and lost them anyway.",
             "\u201cIf you\u2019re caught out when they come \u2014 you don\u2019t run, and you don\u2019t go inside. Inside is worse. Put your back to a marked tree and keep your hand on the bark until the sun\u2019s up. People let go. People panic. Don\u2019t be people. That\u2019s the whole rule.\u201d"],
      fragTag:"C \u00b7 The Warning", fragText:"When they come: STAY. Back to the marked tree, hand on the bark, until dawn. Don\u2019t run, don\u2019t go indoors. \u2014 Kenny" },
    donna:{ name:"Donna", role:"runs the colony — hard, honest", img:"assets/donna.jpg", focal:"64% 30%",
      suspect:false, truthful:true,
      lines:["Donna folds her arms and looks past you, out to the treeline.",
             "\u201cThat first carving was here before any of us. A woman cut it \u2014 lived through a night out in the open, no walls, no charm, just that one tree. She carved what kept her alive so the next poor soul would know. Everyone who\u2019s added to it since did the same. We don\u2019t say her name much. Seems like bad luck.\u201d"],
      fragTag:"B \u00b7 The First Carving", fragText:"The first carving was cut by a SURVIVOR who lived a night in the open by the tree \u2014 no walls, no charm. It\u2019s a survivor\u2019s map. \u2014 Donna" },
    jade:{ name:"Jade", role:"reads patterns — may mislead you", img:"assets/jade.jpg", focal:"58% 24%",
      suspect:true, truthful:false,
      lines:["Jade taps his pen against the bark and grins like he\u2019s already three steps ahead of you.",
             "\u201cEveryone reads it as a warning. I read it as a door. Look at the sequence \u2014 it\u2019s a countdown. Follow it to the forest\u2019s edge before the cycle closes, and that\u2019s your way out.\u201d He shrugs, the smile not quite reaching his eyes. \u201cOr maybe I just want it to be a door badly enough to see one. You decide who\u2019s worth believing.\u201d"],
      fragTag:"? \u00b7 Jade\u2019s reading", fragText:"Jade says the carvings are a COUNTDOWN \u2014 follow them to the forest\u2019s edge to escape. (He admits he might just want it to be true.)" }
  };

  var QUESTIONS = [
    { prompt:"The carvings on the trees actually form\u2026",
      opts:[{t:"a map marking the trees that are safe at night",ok:true},
            {t:"a countdown pointing to a way out of the forest",ok:false},
            {t:"old decoration with no meaning left",ok:false},
            {t:"a tally of the nights the town has survived",ok:false}],
      good:"A segment of the charm warms in your fist. The nearest pair of eyes goes still.",
      bad:"The charm stays cold. You followed a map that points nowhere \u2014 and the dark notices." },
    { prompt:"The very first symbol was cut by\u2026",
      opts:[{t:"a survivor who lived a night in the open, with no charm",ok:true},
            {t:"the things in the trees, to lure people out",ok:false},
            {t:"a child who saw it in a dream",ok:false},
            {t:"the town\u2019s founders, to mark a boundary",ok:false}],
      good:"Another segment catches the light. Something in the dark draws back a step.",
      bad:"The charm dims. You trusted the wrong hand on the knife, and the gap widens." },
    { prompt:"When the monsters reach you tonight, you must\u2026",
      opts:[{t:"keep your back and your hand to the marked tree until dawn",ok:true},
            {t:"run between the trees to break their line",ok:false},
            {t:"get inside the nearest house and bar the door",ok:false},
            {t:"put out your torch and stay perfectly still",ok:false}],
      good:"The last segment locks. The charm is whole, and warm, and yours.",
      bad:"The charm fails in your hand. You moved when you should have held \u2014 and they were waiting for it." }
  ];

  /* ---------- state ---------- */
  var S;
  function reset(){ S={daylight:3,talked:{},qIndex:0,correct:0,answered:false,wards:0,housesLit:0,roundNo:0,budget:0,tiles:null,sel:-1,assembled:false}; }

  /* ---------- shared bits ---------- */
  function statusBar(){
    var lr=""; for(var i=0;i<3;i++){ lr+=LANTERN.replace('class="lant"','class="lant'+(i>=S.daylight?' out':'')+'"'); }
    return '<div class="status"><div class="daylight"><span class="lbl">daylight</span><span class="lantern-row">'+lr+'</span></div>'
      +'<button class="journal-tab" id="jtab"><span class="lbl">journal</span><span class="count">'+E.notebook.count()+' / 3</span></button></div>';
  }
  function nightBar(){
    var lit=S.correct, whole=lit>=3;
    return '<div class="status"><div class="talisman-hud"><span class="lbl">talisman</span>'+charmSVG(lit,whole,false)+'</div>'
      +'<button class="journal-tab" id="jtab"><span class="lbl">journal</span><span class="count">'+E.notebook.count()+' / 3</span></button></div>';
  }
  function bindJ(){ var t=document.getElementById("jtab"); if(t) t.onclick=E.notebook.open; }

  /* ---------- entry ---------- */
  function boot(){
    injectCSS();
    reset();
    E.notebook.clear();
    E.notebook.config("Boyd\u2019s Journal");
    E.notebook.subtitle("clue fragments — 0 of 3");
    intro();
  }

  function intro(){
    E.nightClass(false); E.danger(false);
    E.setBg("assets/roadblock.jpg","center 60%","light");
    E.render('<div class="scene fade">'
      +'<div class="eyebrow">Level One — Boyd</div>'
      +'<h1 class="title">The Road Out<span class="sub">— there isn\u2019t one</span></h1>'
      +'<div class="panel" style="margin-top:24px;max-width:60ch"><p class="lede" style="margin:0">A road that only ever leads back. A tree across it that wasn\u2019t there an hour ago. You are Boyd \u2014 and the town has decided you aren\u2019t leaving.</p></div>'
      +'<div class="actions"><button class="btn warm" id="b1">Step out of the truck</button>'
      +'<button class="btn ghost" id="menu">Menu</button></div></div>');
    document.getElementById("b1").onclick=function(){ E.startMusic(); premise(); };
    document.getElementById("menu").onclick=E.hub;
  }

  function premise(){
    E.setBg("assets/aerial.jpg","center 40%","med");
    E.render('<div class="scene fade">'
      +'<div class="eyebrow">The whole trap</div>'
      +'<div class="panel"><div class="narr">'
      +'<p class="lead">From above you can see the shape of it: a handful of houses in a clearing, a diner, a church, and forest in every direction with no end and no edge. Drive out and the road curves you back to where you started. There is no leaving. There is only the next night.</p>'
      +'<p>And tonight, something new is carved into the trees.</p>'
      +'</div></div><div class="actions"><button class="btn" id="b2">Go to the station</button></div></div>');
    document.getElementById("b2").onclick=briefing;
  }

  function briefing(){
    E.setBg("assets/station.jpg","center 35%","med");
    E.render(statusBar()
      +'<div class="scene fade"><div class="eyebrow">Sheriff\u2019s station — morning</div>'
      +'<div class="panel"><div class="narr">'
      +'<p class="lead">The carving is the same on every marked tree \u2014 grooves pale and raw, like someone finished cutting them an hour ago. Boyd has until dusk to understand three things: <em>what the symbol is, who first cut it,</em> and <em>what it tells him to do when the dark comes.</em></p>'
      +'<p>There\u2019s only so much daylight. He can seek out three of the townsfolk \u2014 no more. Choose carefully. Not everyone here tells the truth.</p>'
      +'</div></div><div class="actions"><button class="btn" id="b3">Walk into the colony</button></div></div>');
    bindJ();
    document.getElementById("b3").onclick=day;
  }

  function day(){
    E.nightClass(false); E.danger(false);
    E.setBg("assets/approach.jpg","center 55%","heavy");
    var cards=Object.keys(NPCS).map(function(id){
      var c=NPCS[id], spent=!!S.talked[id], locked=!spent&&S.daylight===0, dis=spent||locked;
      return '<button class="npc'+(spent?' spent':'')+(locked?' locked':'')+(c.suspect?' suspect':'')+'" data-id="'+id+'"'+(dis?' disabled':'')+'>'
        +'<div class="npc-portrait" style="background-image:url(\''+c.img+'\');background-position:'+c.focal+'"></div>'
        +'<div class="npc-meta"><div class="nm">'+c.name+'</div><div class="role">'+c.role+'</div>'
        +'<div class="done-mark">'+(spent?'— spoken with':'— no daylight left')+'</div></div></button>';
    }).join("");
    var prompt=S.daylight>0
      ? 'Daylight for <strong>'+S.daylight+'</strong> more '+(S.daylight===1?'conversation':'conversations')+'. Who does Boyd seek out?'
      : 'The light is nearly gone.';
    E.render(statusBar()
      +'<div class="scene fade"><div class="eyebrow">Day phase — the colony</div>'
      +'<div class="panel" style="display:inline-block"><div class="narr" style="margin:0">'+prompt+'</div></div>'
      +'<div class="npc-grid">'+cards+'</div>'
      +(S.daylight===0?'<div class="actions"><button class="btn warm" id="toDusk">Make your rounds before dark</button></div>':'')
      +'</div>');
    bindJ();
    Array.prototype.forEach.call(document.querySelectorAll(".npc[data-id]"),function(b){
      if(b.disabled)return; b.onclick=function(){ talkTo(b.getAttribute("data-id")); };});
    var d=document.getElementById("toDusk"); if(d) d.onclick=theRound;
  }

  function talkTo(id){
    var c=NPCS[id];
    E.setBg(c.img,c.focal,"vn");
    E.render('<div class="scene bottom fade">'
      +'<div class="vn-tag">Day phase — '+c.name+'</div>'
      +'<div class="dialogue"><div class="speaker">'+c.name+'</div>'
      +c.lines.map(function(l){return '<div class="line">'+l+'</div>';}).join("")
      +'<div class="actions"><button class="btn warm" id="rec">Write it in the journal</button>'
      +'<button class="btn ghost" id="back">Leave it</button></div></div></div>');
    document.getElementById("rec").onclick=function(){
      if(!S.talked[id]){
        S.talked[id]=true; S.daylight=Math.max(0,S.daylight-1);
        E.notebook.add({tag:c.fragTag, sub:"from "+c.name, text:c.fragText, flag:!c.truthful});
        E.notebook.subtitle("clue fragments — "+E.notebook.count()+" of 3");
      }
      day();
    };
    document.getElementById("back").onclick=day;
  }

  function dusk(){
    E.nightClass(true); E.danger(true);
    E.setBg("assets/boyd.jpg","center 30%","med");
    E.sound.setMood("night");
    E.render('<div class="scene bottom fade">'
      +'<div class="vn-tag">Dusk</div>'
      +'<div class="dialogue" style="max-width:54ch"><div class="narr">'
      +'<p class="lead">The last of the daylight gutters out. Boyd sets his back against the tree he chose to believe in and touches the torch to life \u2014 the flame catches a cold, wrong blue. Past the trunks, something long and patient lets out a breath.</p>'
      +'<p>Whatever he understands now is all he gets.</p>'
      +'</div><div class="actions"><button class="btn" id="toNight">Face the night</button></div></div></div>');
    document.getElementById("toNight").onclick=function(){ S.qIndex=0; S.correct=0; nightIntro(); };
  }

  function nightIntro(){
    E.nightClass(true); E.danger(true);
    E.setBg("assets/monster-smiling.jpg","center 40%","night");
    E.render(nightBar()
      +'<div class="scene fade"><div class="eyebrow">Nightfall</div>'
      +'<div class="panel"><div class="narr">'
      +'<p class="lead">They come out of the trees wearing the faces of people, smiling, unhurried. The only thing between you and them is the charm you piece together from what you learned today.</p>'
      +'<p>Answer true, and a segment holds. Answer false, and it fails \u2014 one piece at a time.</p>'
      +'</div></div><div class="actions"><button class="btn warm" id="q">Hold the tree. Begin.</button></div></div>');
    bindJ();
    document.getElementById("q").onclick=renderQuestion;
  }

  function renderQuestion(){
    E.nightClass(true); E.danger(true); S.answered=false;
    E.setBg(S.qIndex===2?"assets/monster-house.jpg":"assets/monster-smiling.jpg","center 40%","night");
    var q=QUESTIONS[S.qIndex];
    var sh=q.opts.slice();
    for(var k=sh.length-1;k>0;k--){var j=Math.floor(Math.random()*(k+1));var t=sh[k];sh[k]=sh[j];sh[j]=t;}
    var opts=sh.map(function(o){return '<button class="opt" data-ok="'+(o.ok?1:0)+'">'+o.t+'</button>';}).join("");
    E.render(nightBar()
      +'<div class="scene fade"><div class="q-progress">Night \u2014 question '+(S.qIndex+1)+' of 3</div>'
      +'<div class="q-prompt">'+q.prompt+'</div><div class="opts">'+opts+'</div>'
      +'<div class="verdict" id="verdict"></div>'
      +'<button class="ref-toggle" id="ref">check the journal</button>'
      +'<div class="actions" id="next"></div></div>');
    bindJ();
    document.getElementById("ref").onclick=E.notebook.open;
    Array.prototype.forEach.call(document.querySelectorAll(".opt"),function(b){ b.onclick=function(){ answer(b,q); }; });
  }

  function answer(btn,q){
    if(S.answered)return; S.answered=true;
    var ok=btn.getAttribute("data-ok")==="1";
    Array.prototype.forEach.call(document.querySelectorAll(".opt"),function(b){
      b.disabled=true; if(b.getAttribute("data-ok")==="1")b.classList.add("correct");});
    if(!ok)btn.classList.add("wrong");
    if(ok)S.correct++;
    var hud=document.querySelector(".talisman-hud");
    if(hud){var lit=S.correct,whole=lit>=3;hud.innerHTML='<span class="lbl">talisman</span>'+charmSVG(lit,whole,false);}
    var v=document.getElementById("verdict");
    v.textContent=ok?q.good:q.bad; v.className="verdict show "+(ok?"good":"bad");
    var last=S.qIndex>=QUESTIONS.length-1;
    document.getElementById("next").innerHTML='<button class="btn" id="nx">'+(last?"Make the charm whole":"The eyes drift closer\u2026")+'</button>';
    document.getElementById("nx").onclick=function(){ if(last)mend(); else { S.qIndex++; renderQuestion(); } };
  }

  function end(){
    var c=S.correct, asm=!!S.assembled;
    var g = (asm && c>=3) ? 2 : ((asm || c>=3) ? 1 : 0);
    var whole=(g===2), eyebrow,title,body,img,focal,scrim,warm;
    if(g===2){ img="assets/colony-ext.jpg"; focal="center 40%"; scrim="med"; warm=true; E.nightClass(false); E.danger(false);
      eyebrow="Dawn — the charm held whole"; title="Boyd survives.";
      body='<p class="lead">The eyes thin to nothing, pulled back into whatever keeps them. The charm sits whole and warm in Boyd\u2019s fist \u2014 gold, finished, real.</p>'
        +'<p>Before he leaves the treeline he cuts what he learned into the bark himself, raw new grooves for the next soul who has to live a night out here. He survived. The town will pretend they always knew he would.</p>'; }
    else if(g===1){ img="assets/monster-diner.jpg"; focal="center 50%"; scrim="night"; warm=false; E.nightClass(true); E.danger(true);
      eyebrow="Dawn — the charm flickered, and held"; title="Boyd lives. Barely.";
      body='<p class="lead">Dawn comes, but it takes its toll. The charm held \u2014 flickering, one segment dark \u2014 and the night pressed every gap it could find.</p>'
        +'<p>Boyd is alive. His hands won\u2019t stop shaking. He knows it now in his bones: a harder night would not have let him walk away. And the nights here only get harder.</p>'; }
    else { img="assets/monster-house.jpg"; focal="center 35%"; scrim="night"; warm=false; E.nightClass(true); E.danger(true);
      eyebrow="No dawn for him"; title="The charm fails.";
      body='<p class="lead">Cold metal, dead in his hand. The thing in the doorway is still smiling as it crosses the room, and the trees keep their long silence.</p>'
        +'<p>Boyd does not see the morning. The carving stays unfinished on the bark \u2014 a warning no one left will be able to read.</p>'; }

    if(g>=1) E.complete("boyd"); // surviving (whole or barely) clears the level

    E.setBg(img,focal,scrim);
    var nxt=E.next("boyd"), canNext = nxt && E.isUnlocked(nxt.id);
    var nextBtn = canNext
      ? '<button class="btn warm" id="nextLvl">Level '+(nxt.num)+' — '+nxt.title+' \u203a</button>'
      : '';
    E.render('<div class="scene fade">'
      +'<div class="end-head">'+charmSVG(Math.min(c,3),whole,true)
      +'<div><div class="eyebrow" style="margin:0 0 6px">'+eyebrow+'</div>'
      +'<h2 class="title" style="font-size:clamp(2.3rem,7vw,3.6rem)">'+title+'</h2></div></div>'
      +'<div class="panel"><div class="narr">'+body+'</div>'
      +'<div class="narr" style="margin-top:14px;opacity:.78;font-size:1rem">Clues gathered: <strong>'+E.notebook.count()+'/3</strong> &nbsp;\u00b7&nbsp; True answers: <strong>'+c+'/3</strong> &nbsp;\u00b7&nbsp; Houses warded: <strong>'+(S.housesLit||0)+'</strong> &nbsp;\u00b7&nbsp; Talisman: <strong>'+(asm?'whole':'broken')+'</strong></div></div>'
      +'<div class="actions"><button class="btn '+(warm?'':'warm')+'" id="again">Live the day again</button>'
      + nextBtn
      +'<button class="btn ghost" id="menu">Menu</button></div>'
      +(canNext?'':'<p style="margin-top:14px;font-family:var(--displaysc);letter-spacing:.06em;font-size:.82rem;opacity:.6;text-shadow:0 1px 8px #000">Level II — Tabitha is still being carved. From here the talismans come slower.</p>')
      +'</div>');
    document.getElementById("again").onclick=boot;
    document.getElementById("menu").onclick=E.hub;
    if(canNext) document.getElementById("nextLvl").onclick=function(){ E.startLevel(nxt.id); };
  }

  /* ===========================================================================
     NEW SUB-STAGES (added to Boyd's level)
       · theRound()  — MEMORY: hang the charms before dark   (assets/town-dusk.png)
       · mend()      — ASSEMBLY: mend the broken talisman     (assets/talisman.png)
     The day feeds the night: wards earned on the rounds + true answers at night
     set the mend's swap budget and whether Boyd still has a reference to work from.
     Injects its own CSS, so index.html needs no edit.
     =========================================================================== */

  var _cssDone=false;
  function injectCSS(){
    if(_cssDone) return; _cssDone=true;
    var css = `
    /* --- The Round (memory map) --- */
    .round-wrap{max-width:min(680px,92vw);margin:16px auto 0;}
    .round-stage{position:relative;border-radius:14px;overflow:hidden;
      box-shadow:0 18px 50px rgba(0,0,0,.6),0 0 0 1px rgba(255,217,122,.12) inset;}
    .round-map{display:block;width:100%;height:auto;}
    .round-spots{position:absolute;inset:0;}
    .house{position:absolute;transform:translate(-50%,-50%);
      width:clamp(26px,5vw,40px);height:clamp(26px,5vw,40px);border-radius:50%;
      border:1.5px solid rgba(255,236,196,.45);
      background:radial-gradient(circle at 50% 40%,rgba(255,222,150,.16),rgba(20,16,12,.10));
      cursor:pointer;padding:0;
      transition:transform .12s,box-shadow .25s,background .25s,border-color .25s;}
    .house:hover:not(:disabled){border-color:rgba(255,236,196,.85);}
    .house::after{content:"";position:absolute;inset:32%;border-radius:50%;
      background:rgba(255,224,160,0);transition:background .2s,box-shadow .25s;}
    .house.lit{background:radial-gradient(circle at 50% 38%,#ffe6a6,#b5832e);
      border-color:#ffe9bd;box-shadow:0 0 16px 5px rgba(255,210,120,.7);
      transform:translate(-50%,-50%) scale(1.18);}
    .house.lit::after{background:#fff6dd;box-shadow:0 0 10px 3px #ffe0a0;}
    .house.warded{background:radial-gradient(circle at 50% 40%,#ffd97a,#7a5a22);
      border-color:#ffd97a;box-shadow:0 0 12px 3px rgba(255,200,110,.55);}
    .house.warded::after{background:#ffeec4;}
    .house.bad{border-color:#c75a4a;box-shadow:0 0 14px 4px rgba(190,70,55,.6);}
    .round-bar{display:flex;justify-content:center;gap:20px;align-items:center;
      margin:14px 0 2px;font-family:var(--displaysc,Georgia,serif);
      letter-spacing:.06em;font-size:.84rem;text-transform:uppercase;opacity:.9;}
    .round-bar .pip{color:#ffd97a;font-weight:700;}

    /* --- Mend the talisman (swap puzzle) --- */
    .mend-wrap{display:flex;flex-wrap:wrap;gap:22px;justify-content:center;
      align-items:flex-start;margin:18px auto 0;}
    .mend-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;
      width:clamp(232px,78vw,340px);aspect-ratio:1;padding:8px;
      background:rgba(10,8,6,.55);border-radius:12px;
      box-shadow:0 18px 46px rgba(0,0,0,.6),0 0 0 1px rgba(255,217,122,.12) inset;}
    .mend-tile{position:relative;aspect-ratio:1;border-radius:5px;
      background-image:url("assets/talisman.png");background-size:300% 300%;
      background-repeat:no-repeat;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.5);
      outline:2px solid transparent;outline-offset:-2px;
      transition:transform .1s,box-shadow .2s,outline-color .15s;}
    .mend-tile:hover{transform:scale(.985);}
    .mend-tile.sel{outline-color:#fff3d0;box-shadow:0 0 14px 3px rgba(255,225,150,.7);
      transform:scale(.97);z-index:2;}
    .mend-tile.lock{outline-color:rgba(255,217,122,.85);
      box-shadow:0 0 12px 2px rgba(255,200,110,.5) inset;cursor:default;}
    .mend-tile.lock::after{content:"";position:absolute;inset:0;border-radius:5px;
      background:rgba(255,217,122,.06);}
    .mend-side{flex:0 1 200px;max-width:220px;text-align:left;}
    .mend-ref{width:120px;height:120px;border-radius:8px;
      background-image:url("assets/talisman.png");background-size:cover;
      background-position:center;margin-bottom:10px;
      box-shadow:0 6px 20px rgba(0,0,0,.55),0 0 0 1px rgba(255,217,122,.18) inset;}
    .mend-ref.hidden{background:repeating-linear-gradient(45deg,#1a1612,#1a1612 8px,#221c16 8px,#221c16 16px);}
    .mend-hud{font-family:var(--displaysc,Georgia,serif);letter-spacing:.05em;
      text-transform:uppercase;font-size:.88rem;opacity:.92;}
    .mend-hud .swaps{color:#ffd97a;font-size:1.2rem;font-weight:700;}
    .mend-hud .swaps.low{color:#e08a5a;}
    .mend-note{opacity:.72;font-size:.92rem;line-height:1.5;margin-top:8px;}
    `;
    var s=document.createElement("style"); s.textContent=css; document.head.appendChild(s);
  }

  /* ---------- The Round — memory ---------- */
  var HOUSES=[
    {x:34,y:79},{x:57,y:73},{x:16,y:60},{x:24,y:50},
    {x:45,y:46},{x:69,y:55},{x:80,y:50},{x:53,y:41}
  ];
  var ROUND_LENS=[3,4,5];

  function shuffleIdx(n){ var a=[],i; for(i=0;i<n;i++)a.push(i);
    for(var k=a.length-1;k>0;k--){var j=Math.floor(Math.random()*(k+1));var t=a[k];a[k]=a[j];a[j]=t;} return a; }
  function spotEl(i){ return document.querySelector('.house[data-i="'+i+'"]'); }
  function setSpots(disabledFn,onClick){
    Array.prototype.forEach.call(document.querySelectorAll(".house"),function(b){
      var i=parseInt(b.getAttribute("data-i"),10);
      b.disabled=!!(disabledFn&&disabledFn(i));
      b.onclick=onClick?function(){ onClick(i,b); }:null;
    });
  }
  function roundMap(){
    var spots=HOUSES.map(function(h,i){
      return '<button class="house" data-i="'+i+'" style="left:'+h.x+'%;top:'+h.y+'%"></button>';
    }).join("");
    return '<div class="round-wrap"><div class="round-stage">'
      +'<img class="round-map" src="assets/town-dusk.png" alt="the town at dusk">'
      +'<div class="round-spots">'+spots+'</div></div>'
      +'<div class="round-bar"><span>round <span class="pip">'+(S.roundNo+1)+'</span> / 3</span>'
      +'<span>warded <span class="pip">'+S.housesLit+'</span></span></div></div>';
  }

  function theRound(){
    S.roundNo=0; S.wards=0; S.housesLit=0;
    E.nightClass(false); E.danger(false);
    E.setBg("assets/approach.jpg","center 55%","heavy");
    E.sound.setMood("day");
    roundIntro();
  }

  function roundIntro(){
    var len=ROUND_LENS[S.roundNo];
    E.render(statusBar()
      +'<div class="scene fade"><div class="eyebrow">Before dark \u2014 the rounds</div>'
      +'<div class="panel" style="max-width:60ch"><div class="narr" style="margin:0">'
      +(S.roundNo===0
        ? '<p class="lead">Boyd still has charms to hang before the light goes. Watch the order the lanterns light along the houses \u2014 then walk it back yourself, house for house. Every house you get right is one the dark can\u2019t open tonight.</p>'
        : '<p class="lead">The next stretch of town, and a longer round this time. Watch the lanterns, then repeat them.</p>')
      +'</div></div><div class="actions"><button class="btn warm" id="watch">Watch the round ('+len+' houses)</button></div></div>');
    bindJ();
    document.getElementById("watch").onclick=playRound;
  }

  function playRound(){
    S.seq=shuffleIdx(HOUSES.length).slice(0,ROUND_LENS[S.roundNo]);
    E.render(statusBar()
      +'<div class="scene fade"><div class="eyebrow">Watch the order</div>'
      + roundMap()
      +'<p class="mend-note" style="text-align:center">Hanging the charms\u2026 watch closely.</p></div>');
    bindJ();
    setSpots(function(){return true;},null);
    var i=0;
    (function flash(){
      if(i>0){ var prev=spotEl(S.seq[i-1]); if(prev) prev.classList.remove("lit"); }
      if(i>=S.seq.length){ setTimeout(beginInput,360); return; }
      var el=spotEl(S.seq[i]); if(el) el.classList.add("lit");
      i++; setTimeout(flash,720);
    })();
  }

  function beginInput(){
    S.step=0;
    E.render(statusBar()
      +'<div class="scene fade"><div class="eyebrow">Now walk it back</div>'
      + roundMap()
      +'<p class="mend-note" style="text-align:center">Tap the houses in the order the lanterns lit.</p></div>');
    bindJ();
    setSpots(function(){return false;},onHouseTap);
  }

  function onHouseTap(i,btn){
    if(i===S.seq[S.step]){
      btn.classList.add("warded"); S.step++;
      if(S.step>=S.seq.length){
        S.wards++; S.housesLit+=S.seq.length; S.roundNo++;
        setSpots(function(){return true;},null);
        if(S.roundNo>=ROUND_LENS.length) setTimeout(roundsDone,680);
        else setTimeout(roundIntro,680);
      }
    } else {
      btn.classList.add("bad");
      setSpots(function(){return true;},null);
      setTimeout(roundsDone,820);
    }
  }

  function roundsDone(){
    E.nightClass(false); E.danger(false);
    E.setBg("assets/town-dusk.png","center","med"); E.sound.setMood("day");
    var msg = S.wards>=3
      ? '<p class="lead">Every charm hangs true. The whole town is warded \u2014 lantern-light in the windows Boyd walked past. Whatever comes tonight finds no easy door.</p>'
      : S.wards>0
      ? '<p class="lead">Boyd warded what he could before the light failed \u2014 '+S.housesLit+' '+(S.housesLit===1?'house':'houses')+' lit and held. The rest stand dark. It will have to be enough.</p>'
      : '<p class="lead">The light went before Boyd could hang a single charm true. The houses stand dark behind him as he turns for the treeline \u2014 nothing prepared, and the night already breathing in the trees.</p>';
    E.render('<div class="scene fade"><div class="eyebrow">The rounds are done</div>'
      +'<div class="panel"><div class="narr">'+msg
      +'<p style="opacity:.75;margin-top:10px">Houses warded: <strong>'+S.housesLit+'</strong></p>'
      +'</div></div><div class="actions"><button class="btn warm" id="toDusk2">Put your back to the tree</button></div></div>');
    document.getElementById("toDusk2").onclick=dusk;
  }

  /* ---------- Mend the Talisman — assembly ---------- */
  function scrambleTiles(swaps){
    var a=[0,1,2,3,4,5,6,7,8],s;
    for(s=0;s<swaps;s++){ var i=Math.floor(Math.random()*9),j=Math.floor(Math.random()*9);
      var t=a[i];a[i]=a[j];a[j]=t; }
    for(var k=0;k<9;k++) if(a[k]!==k) return a;   // not solved -> use it
    return scrambleTiles(swaps);                   // re-roll a scramble that landed solved
  }
  function tileBG(piece){ var c=piece%3,r=Math.floor(piece/3); return (c*50)+'% '+(r*50)+'%'; }
  function isSolved(){ for(var k=0;k<9;k++) if(S.tiles[k]!==k) return false; return true; }

  function mend(){
    var prep=(S.wards||0)+(S.correct||0);
    S.budget=6+(S.wards||0)+(S.correct||0);
    S.refShown=prep>=4;
    S.tiles=scrambleTiles(5); S.sel=-1; S.assembled=false;
    E.nightClass(true); E.danger(true);
    E.setBg("assets/monster-smiling.jpg","center 40%","night"); E.sound.setMood("night");
    mendIntro();
  }

  function mendIntro(){
    E.render(nightBar()
      +'<div class="scene fade"><div class="eyebrow">The last of it</div>'
      +'<div class="panel"><div class="narr">'
      +'<p class="lead">Boyd knows the shape of it now \u2014 what the carving has to be. But knowing it and cutting it true are not the same thing, and the dark is already at the trunks. He works the broken disc with shaking hands, fitting the pieces back into one whole symbol before they reach him.</p>'
      +'<p>Swap two pieces at a time \u2014 the grain locks gold when a piece sits where it belongs. '
      +(S.refShown
        ? 'What you understood today keeps your hands steady; you can still see the whole charm clearly to work from.'
        : 'You never got a clear look at the finished charm \u2014 you\u2019re fitting it half-blind, reading the grain and the cuts.')
      +'</p></div></div><div class="actions"><button class="btn warm" id="goMend">Fit the pieces</button></div></div>');
    bindJ();
    document.getElementById("goMend").onclick=renderMend;
  }

  function renderMend(){
    var grid="",p;
    for(p=0;p<9;p++){
      var piece=S.tiles[p], lock=(piece===p);
      grid+='<div class="mend-tile'+(lock?' lock':'')+(p===S.sel?' sel':'')+'" data-p="'+p+'" '
        +'style="background-position:'+tileBG(piece)+'"></div>';
    }
    var ref=S.refShown
      ? '<div class="mend-ref" title="the whole charm"></div>'
      : '<div class="mend-ref hidden" title="no clear reference"></div>';
    var low=S.budget<=2?' low':'';
    E.render(nightBar()
      +'<div class="scene fade"><div class="q-progress">Night \u2014 mend the talisman</div>'
      +'<div class="mend-wrap"><div class="mend-grid">'+grid+'</div>'
      +'<div class="mend-side">'+ref
      +'<div class="mend-hud">swaps left <span class="swaps'+low+'">'+S.budget+'</span></div>'
      +'<div class="mend-note">'+(S.refShown
          ? 'Match the pieces to the whole charm shown here.'
          : 'No reference \u2014 read the grain and the cuts to place each piece.')+'</div>'
      +'</div></div></div>');
    bindJ();
    Array.prototype.forEach.call(document.querySelectorAll(".mend-tile"),function(t){
      if(t.classList.contains("lock")){ t.onclick=null; return; }
      t.onclick=function(){ tileClick(parseInt(t.getAttribute("data-p"),10)); };
    });
  }

  function tileClick(p){
    if(S.tiles[p]===p) return;                 // already locked in place
    if(S.sel===-1){ S.sel=p; renderMend(); return; }
    if(S.sel===p){ S.sel=-1; renderMend(); return; }
    var t=S.tiles[S.sel]; S.tiles[S.sel]=S.tiles[p]; S.tiles[p]=t;
    S.sel=-1; S.budget--;
    if(isSolved()){ S.assembled=true; setTimeout(mendWin,280); return; }
    if(S.budget<=0){ setTimeout(mendFail,280); return; }
    renderMend();
  }

  function mendWin(){
    E.nightClass(false); E.danger(false);
    E.render(nightBar()
      +'<div class="scene fade"><div class="end-head">'+charmSVG(3,true,true)
      +'<div><div class="eyebrow" style="margin:0 0 6px">The disc is whole</div>'
      +'<h2 class="title" style="font-size:clamp(2rem,6.5vw,3rem)">The symbol holds.</h2></div></div>'
      +'<div class="panel"><div class="narr"><p class="lead">The last piece seats with a sound like a held breath let go. Every groove meets the next; the wood is warm and gold under Boyd\u2019s hands. Out past the trees, the smiling things stop coming forward.</p></div></div>'
      +'<div class="actions"><button class="btn warm" id="toEnd">See what the dawn brings</button></div></div>');
    document.getElementById("toEnd").onclick=end;
  }

  function mendFail(){
    E.nightClass(true); E.danger(true);
    E.render(nightBar()
      +'<div class="scene fade"><div class="eyebrow">The pieces won\u2019t come</div>'
      +'<div class="panel"><div class="narr"><p class="lead">Boyd\u2019s hands fumble the last of it \u2014 grooves that won\u2019t meet, a symbol that won\u2019t close. The wood stays cold and broken in his grip, and he runs out of dark to work in. The smiling things are at the tree now, and the charm is still in pieces.</p></div></div>'
      +'<div class="actions"><button class="btn" id="toEnd">See what the dark brings</button></div></div>');
    document.getElementById("toEnd").onclick=end;
  }

  /* ---------- register with the engine ---------- */
  E.addLevel({ id:"boyd", num:1, title:"Boyd", tagline:"Decode the carving, survive the night", start:boot });
})();
