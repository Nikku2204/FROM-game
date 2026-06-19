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
  function reset(){ S={daylight:3,talked:{},qIndex:0,correct:0,answered:false}; }

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
      +(S.daylight===0?'<div class="actions"><button class="btn warm" id="toDusk">Put your back to the tree</button></div>':'')
      +'</div>');
    bindJ();
    Array.prototype.forEach.call(document.querySelectorAll(".npc[data-id]"),function(b){
      if(b.disabled)return; b.onclick=function(){ talkTo(b.getAttribute("data-id")); };});
    var d=document.getElementById("toDusk"); if(d) d.onclick=dusk;
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
    document.getElementById("next").innerHTML='<button class="btn" id="nx">'+(last?"See what the dawn brings":"The eyes drift closer\u2026")+'</button>';
    document.getElementById("nx").onclick=function(){ if(last)end(); else { S.qIndex++; renderQuestion(); } };
  }

  function end(){
    var c=S.correct, whole=(c>=3), eyebrow,title,body,img,focal,scrim,warm;
    if(c>=3){ img="assets/colony-ext.jpg"; focal="center 40%"; scrim="med"; warm=true; E.nightClass(false); E.danger(false);
      eyebrow="Dawn — the charm held whole"; title="Boyd survives.";
      body='<p class="lead">The eyes thin to nothing, pulled back into whatever keeps them. The charm sits whole and warm in Boyd\u2019s fist \u2014 gold, finished, real.</p>'
        +'<p>Before he leaves the treeline he cuts what he learned into the bark himself, raw new grooves for the next soul who has to live a night out here. He survived. The town will pretend they always knew he would.</p>'; }
    else if(c===2){ img="assets/monster-diner.jpg"; focal="center 50%"; scrim="night"; warm=false; E.nightClass(true); E.danger(true);
      eyebrow="Dawn — the charm flickered, and held"; title="Boyd lives. Barely.";
      body='<p class="lead">Dawn comes, but it takes its toll. The charm held \u2014 flickering, one segment dark \u2014 and the night pressed every gap it could find.</p>'
        +'<p>Boyd is alive. His hands won\u2019t stop shaking. He knows it now in his bones: a harder night would not have let him walk away. And the nights here only get harder.</p>'; }
    else { img="assets/monster-house.jpg"; focal="center 35%"; scrim="night"; warm=false; E.nightClass(true); E.danger(true);
      eyebrow="No dawn for him"; title="The charm fails.";
      body='<p class="lead">Cold metal, dead in his hand. The thing in the doorway is still smiling as it crosses the room, and the trees keep their long silence.</p>'
        +'<p>Boyd does not see the morning. The carving stays unfinished on the bark \u2014 a warning no one left will be able to read.</p>'; }

    if(c>=2) E.complete("boyd"); // surviving (whole or barely) clears the level

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
      +'<div class="narr" style="margin-top:14px;opacity:.78;font-size:1rem">Clues gathered: <strong>'+E.notebook.count()+'/3</strong> &nbsp;\u00b7&nbsp; True answers: <strong>'+c+'/3</strong></div></div>'
      +'<div class="actions"><button class="btn '+(warm?'':'warm')+'" id="again">Live the day again</button>'
      + nextBtn
      +'<button class="btn ghost" id="menu">Menu</button></div>'
      +(canNext?'':'<p style="margin-top:14px;font-family:var(--displaysc);letter-spacing:.06em;font-size:.82rem;opacity:.6;text-shadow:0 1px 8px #000">Level II — Tabitha is still being carved. From here the talismans come slower.</p>')
      +'</div>');
    document.getElementById("again").onclick=boot;
    document.getElementById("menu").onclick=E.hub;
    if(canNext) document.getElementById("nextLvl").onclick=function(){ E.startLevel(nxt.id); };
  }

  /* ---------- register with the engine ---------- */
  E.addLevel({ id:"boyd", num:1, title:"Boyd", tagline:"Decode the carving, survive the night", start:boot });
})();
