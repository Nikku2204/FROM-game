/* ===========================================================================
   Level 3 — JADE  ·  "Assemble the symbols, or the night gets in"
   SIGIL-ASSEMBLY puzzle, now in THREE escalating seals:
     Seal 1 — 3x3   (9 pieces)
     Seal 2 — 6x6   (36 pieces)   different, denser symbol
     Seal 3 — 9x9   (81 pieces)   most intricate symbol
   By day you recover the pieces and choose whose version to trust (which sets
   how many swaps you get). By night you swap fragments around each grid until
   the symbol is whole; tiles glow gold as they lock. Clear the seals to live.

   Injects its own CSS, uses only existing art -> drop-in (no index.html edit).
   =========================================================================== */
(function(){
  "use strict";
  var E = window.Engine;

  /* ---------- styles ---------- */
  if(!document.getElementById("lvl3-style")){
    var st=document.createElement("style"); st.id="lvl3-style";
    st.textContent =
      ".pz-outer{margin:22px auto 4px;max-width:380px}"
     +".pz-wrap{position:relative;width:100%;max-width:344px;margin:0 auto;aspect-ratio:1/1}"
     +".pz-ghost{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:.13;pointer-events:none}"
     +".pz-ghost svg{width:96%;height:96%;stroke:var(--moon);fill:none;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}"
     +".pz-grid{position:relative;display:grid;width:100%;height:100%}"
     +".pz-tile{position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;background:rgba(8,8,12,.5);border:1px solid rgba(255,255,255,.14);border-radius:5px;overflow:hidden;transition:transform .1s,border-color .2s,box-shadow .2s,background .2s}"
     +".pz-tile svg{width:100%;height:100%;display:block;stroke:var(--moon);fill:none;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;opacity:.85}"
     +".pz-tile:hover{border-color:var(--lantern)}"
     +".pz-tile.sel{border-color:var(--lantern-bright);box-shadow:0 0 0 2px var(--lantern-bright),0 0 16px rgba(240,189,94,.5);transform:scale(1.06);z-index:2}"
     +".pz-tile.ok{border-color:var(--talisman)}"
     +".pz-tile.ok svg{stroke:var(--talisman-bright);opacity:1}"
     +".pz-grid.solved .pz-tile{border-color:var(--talisman-bright);background:rgba(230,180,80,.12)}"
     +".pz-grid.solved .pz-tile svg{stroke:var(--talisman-bright);opacity:1;filter:drop-shadow(0 0 5px var(--talisman-bright))}"
     +".pz-hud{display:flex;align-items:center;gap:9px}"
     +".pz-left{font-family:var(--display);font-size:1.3rem;border:1px solid rgba(255,255,255,.4);border-radius:3px;padding:0 11px;min-width:2.4em;text-align:center}"
     +".pz-left.low{color:var(--eye-glow);border-color:var(--eye)}"
     +".pz-src{margin-top:22px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px}"
     +".pz-card{text-align:left;cursor:pointer;padding:14px 16px;background:rgba(8,8,12,.5);border:1px solid rgba(255,255,255,.16);border-radius:8px;color:inherit;font-family:inherit;transition:transform .15s,border-color .2s,background .2s}"
     +".pz-card:hover{transform:translateY(-3px);border-color:var(--lantern)}"
     +".pz-card.done{opacity:.5;cursor:default;pointer-events:none}"
     +".pz-card .pc-frag{height:70px;display:flex;align-items:center;justify-content:center;margin-bottom:8px}"
     +".pz-card .pc-frag svg{height:100%;stroke:var(--talisman);fill:none;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;opacity:.9}"
     +".pz-card .pc-where{font-family:var(--display);font-size:1.1rem;line-height:1.15}"
     +".pz-card .pc-state{font-family:var(--displaysc);letter-spacing:.08em;font-size:.74rem;opacity:.7;margin-top:5px}"
     +".pz-card.done .pc-state{color:var(--moss)}"
     +"@media(max-width:520px){.pz-src{grid-template-columns:1fr}.pz-card .pc-frag{height:54px}}"
     +"@media(max-width:420px){.pz-wrap{max-width:312px}}";
    document.head.appendChild(st);
  }

  /* ---------- three symbols, increasing intricacy (all in a 300x300 field) ---------- */
  var SYM_A =
     '<circle cx="150" cy="150" r="118"/>'
    +'<circle cx="150" cy="150" r="80"/>'
    +'<circle cx="150" cy="150" r="30"/>'
    +'<path d="M150 24 V276"/>'
    +'<path d="M24 150 H276"/>'
    +'<path d="M62 62 L238 238"/>'
    +'<path d="M238 62 L62 238"/>'
    +'<path d="M150 92 l-24 -24 M150 92 l24 -24 M150 122 l-32 -32 M150 122 l32 -32"/>'
    +'<path d="M150 208 l-24 24 M150 208 l24 24 M150 178 l-32 32 M150 178 l32 32"/>'
    +'<circle cx="150" cy="150" r="6"/>';

  var SYM_B =
     '<circle cx="150" cy="150" r="132"/>'
    +'<circle cx="150" cy="150" r="104"/>'
    +'<circle cx="150" cy="150" r="72"/>'
    +'<circle cx="150" cy="150" r="40"/>'
    +'<path d="M150 14 V286"/>'
    +'<path d="M14 150 H286"/>'
    +'<path d="M48 48 L252 252"/>'
    +'<path d="M252 48 L48 252"/>'
    +'<path d="M150 30 L257 214 H43 Z"/>'
    +'<path d="M150 270 L43 86 H257 Z"/>'
    +'<path d="M150 94 l-18 -18 M150 94 l18 -18"/>'
    +'<path d="M150 206 l-18 18 M150 206 l18 18"/>'
    +'<path d="M94 150 l-18 -18 M94 150 l-18 18"/>'
    +'<path d="M206 150 l18 -18 M206 150 l18 18"/>'
    +'<circle cx="150" cy="150" r="6"/>';

  var SYM_C =
     '<circle cx="150" cy="150" r="134"/>'
    +'<circle cx="150" cy="150" r="64"/>'
    +'<path d="M150 28 L264 244 H36 Z"/>'
    +'<path d="M150 28 V272"/>'
    +'<path d="M30 150 H270"/>'
    +'<path d="M24 24 L276 276"/>'
    +'<path d="M276 24 L24 276"/>'
    +'<circle cx="150" cy="150" r="6"/>';

  function frag(k,N,sym){ var cell=300/N, col=k%N, row=Math.floor(k/N);
    return '<svg viewBox="'+(col*cell)+' '+(row*cell)+' '+cell+' '+cell+'" preserveAspectRatio="xMidYMid meet" aria-hidden="true">'+sym+'</svg>'; }
  function fullSym(sym){ return '<svg viewBox="0 0 300 300" aria-hidden="true">'+sym+'</svg>'; }

  /* ---------- pieces recovered by day ---------- */
  var SOURCES = [
    { id:0, frag:2, where:"On the roadblock tree", note:{tag:"Piece \u00b7 the trunk", text:"Cut into the tree that turns the road back on itself. The oldest stroke."} },
    { id:1, frag:4, where:"Scratched in Colony House", note:{tag:"Piece \u00b7 the wall", text:"Scored into the plaster behind a bed \u2014 by someone who didn\u2019t want it found."} },
    { id:2, frag:6, where:"Drawn by the children", note:{tag:"Piece \u00b7 the drawing", text:"The children draw it over and over, the same way every time. They never get it wrong."} }
  ];

  /* ---------- state ---------- */
  var S, PZ;
  function reset(){ S={ got:{}, trustJade:false, stages:[], stageIdx:0, cleared:0 }; PZ=null; }
  function buildStages(){
    var tight=!!S.trustJade;
    S.stages=[
      { N:3, sym:SYM_A, budget: tight?16:22, bg:"assets/bottle-tree.jpg" },
      { N:6, sym:SYM_B, budget: tight?48:60, bg:"assets/bottle-tree.jpg" },
      { N:9, sym:SYM_C, budget: tight?120:150, bg:"assets/bottle-tree.jpg" }
    ];
  }

  /* ---------- helpers ---------- */
  function bindJ(){ var t=document.getElementById("jtab"); if(t) t.onclick=E.notebook.open; }
  function isSolved(g){ for(var i=0;i<g.length;i++){ if(g[i]!==i) return false; } return true; }
  function shuffled(count){ var g=[]; for(var i=0;i<count;i++) g.push(i);
    do{ for(var j=g.length-1;j>0;j--){ var r=Math.floor(Math.random()*(j+1)); var t=g[j]; g[j]=g[r]; g[r]=t; } }while(isSolved(g));
    return g; }

  /* ---------- entry ---------- */
  function boot(){
    reset();
    E.notebook.clear(); E.notebook.config("Jade\u2019s Cipher"); E.notebook.subtitle("pieces of the symbol \u2014 0 of 3");
    intro();
  }

  function intro(){
    E.nightClass(false); E.danger(false);
    E.setBg("assets/jade.jpg","center 22%","vn");
    E.render('<div class="scene bottom fade">'
      +'<div class="vn-tag">Level Three — Jade</div>'
      +'<div class="dialogue" style="max-width:60ch"><div class="speaker">Jade</div>'
      +'<div class="line">\u201cYou came to the right lunatic. Everyone else here is trying to forget the symbol. I\u2019ve been taking it apart.\u201d</div>'
      +'<div class="line">\u201cIt isn\u2019t decoration and it isn\u2019t a warning \u2014 it\u2019s a key. Whole, the dark can\u2019t cross it. But it isn\u2019t one figure, it\u2019s three, nested, each finer than the last. Tonight you build all three, or you don\u2019t see morning.\u201d</div>'
      +'<div class="actions"><button class="btn warm" id="go">Show me the pieces</button>'
      +'<button class="btn ghost" id="menu">Menu</button></div></div></div>');
    document.getElementById("go").onclick=function(){ E.startMusic(); gather(); };
    document.getElementById("menu").onclick=E.hub;
  }

  function statusBar(){
    return '<div class="status"><div class="pz-hud"><span class="lbl">the symbol</span><span class="pz-left">'+E.notebook.count()+' / 3</span><span class="lbl" style="opacity:.6">pieces</span></div>'
      +'<button class="journal-tab" id="jtab"><span class="lbl">notes</span><span class="count">'+E.notebook.count()+'</span></button></div>';
  }

  function gather(){
    E.nightClass(false); E.danger(false);
    E.setBg("assets/bottle-tree.jpg","center 55%","heavy");
    var cards=SOURCES.map(function(s){
      var done=!!S.got[s.id];
      return '<button class="pz-card'+(done?' done':'')+'" data-id="'+s.id+'"'+(done?' disabled':'')+'>'
        +'<div class="pc-frag">'+frag(s.frag,3,SYM_A)+'</div>'
        +'<div class="pc-where">'+s.where+'</div>'
        +'<div class="pc-state">'+(done?'recovered':'recover this piece')+'</div></button>';
    }).join("");
    var n=E.notebook.count(), all=n>=3;
    E.render(statusBar()
      +'<div class="scene fade"><div class="eyebrow">Day — recover the pieces</div>'
      +'<div class="panel" style="display:inline-block;max-width:60ch"><div class="narr" style="margin:0"><p style="margin:0">'
      + (all ? "That\u2019s all three. Jade lays them out beside his own drawing of the whole \u2014 and that\u2019s where it gets complicated."
            : "Jade brings you to the bottle tree \u2014 the children\u2019s tree, hung with glass to catch whatever wanders in the dark. He\u2019s mapped where every piece of the symbol ended up. Recover all three before the light goes.")
      +'</p></div></div>'
      +'<div class="pz-src">'+cards+'</div>'
      + (all ? '<div class="actions"><button class="btn warm" id="next">Lay them beside his drawing</button></div>' : '')
      +'</div>');
    bindJ();
    Array.prototype.forEach.call(document.querySelectorAll(".pz-card[data-id]"), function(b){
      if(b.disabled) return;
      b.onclick=function(){
        var id=parseInt(b.getAttribute("data-id"),10), s=SOURCES[id];
        if(!S.got[id]){ S.got[id]=true; E.notebook.add({tag:s.note.tag, sub:s.where.toLowerCase(), text:s.note.text}); E.notebook.subtitle("pieces of the symbol \u2014 "+E.notebook.count()+" of 3"); }
        gather();
      };
    });
    var nx=document.getElementById("next"); if(nx) nx.onclick=trust;
  }

  function trust(){
    E.nightClass(false); E.danger(false);
    E.setBg("assets/colony-int.jpg","center 40%","med");
    E.render(statusBar()
      +'<div class="scene fade"><div class="eyebrow">Day — whose version?</div>'
      +'<div class="panel"><div class="narr">'
      +'<p class="lead">Jade has the pieces \u2014 but his own drawing and the children\u2019s don\u2019t agree on the figure. His is cleaner, simpler; he\u2019s <em>certain</em> of it. The children\u2019s is more tangled, but they never draw it wrong.</p>'
      +'<p>Believe the children and you\u2019ll build toward the truer, fuller shape \u2014 with room to spare across all three seals tonight. Believe Jade and you\u2019ll work with far less margin, nine-by-nine deep, if he\u2019s wrong.</p>'
      +'</div><div class="actions">'
      +'<button class="btn" id="kids">Trust the children\u2019s drawing</button>'
      +'<button class="btn" id="jade">Trust Jade\u2019s certainty</button>'
      +'</div></div></div>');
    bindJ();
    document.getElementById("kids").onclick=function(){
      S.trustJade=false;
      E.notebook.add({tag:"Decision \u00b7 the drawing", text:"Going with the children\u2019s version \u2014 the truer shape. The seals come a little easier tonight."});
      dusk();
    };
    document.getElementById("jade").onclick=function(){
      S.trustJade=true;
      E.notebook.add({tag:"Decision \u00b7 Jade", flag:true, text:"Going with Jade\u2019s certainty. He swears the figures are simpler than they look \u2014 so there are fewer swaps to spare if he\u2019s wrong."});
      dusk();
    };
  }

  function dusk(){
    E.nightClass(true); E.danger(true);
    E.setBg("assets/bottle-tree.jpg","center 45%","night");
    E.sound.setMood("night");
    E.render('<div class="scene fade">'
      +'<div class="eyebrow">Dusk</div>'
      +'<div class="panel"><div class="narr">'
      +'<p class="lead">The pieces are laid out in the dirt at the foot of the bottle tree, pale against the dark, the glass overhead clinking in a wind you can\u2019t feel. Jade goes quiet for the first time all day. Out past the trunks, the smiling things have started to gather, in no hurry at all.</p>'
      +'<p>Three seals to build, each larger than the last \u2014 nine pieces, then thirty-six, then eighty-one. No charm, no marked tree. Only the symbols, and however long the dark gives you.</p>'
      +'</div></div><div class="actions"><button class="btn warm" id="b">Begin the first seal</button></div></div>');
    document.getElementById("b").onclick=nightIntro;
  }

  function nightIntro(){
    buildStages(); S.cleared=0;
    nightStage(0);
  }

  /* ---------- the puzzle (per stage) ---------- */
  function innerPuzzle(){
    var N=PZ.N, gap = N<=3?4:(N<=6?3:2), cells='';
    for(var c=0;c<N*N;c++){ var p=PZ.grid[c], ok=(p===c);
      cells+='<button class="pz-tile'+(PZ.sel===c?' sel':'')+(ok?' ok':'')+'" data-c="'+c+'">'+frag(p,N,PZ.sym)+'</button>'; }
    return '<div class="pz-ghost">'+fullSym(PZ.sym)+'</div>'
      +'<div class="pz-grid'+(PZ.solved?' solved':'')+'" style="grid-template-columns:repeat('+N+',1fr);grid-template-rows:repeat('+N+',1fr);gap:'+gap+'px">'+cells+'</div>';
  }
  function refreshPuzzle(){ var w=document.getElementById("pzwrap"); if(w){ w.innerHTML=innerPuzzle(); bindTiles(); } }
  function bindTiles(){ Array.prototype.forEach.call(document.querySelectorAll(".pz-tile"), function(b){ b.onclick=function(){ tapTile(parseInt(b.getAttribute("data-c"),10)); }; }); }
  function budgetLeft(){ return PZ.budget - PZ.used; }
  function budgetHUD(i){
    var left=PZ?budgetLeft():0;
    return '<div class="status"><div class="pz-hud"><span class="lbl">seal '+(i+1)+'/3</span><span class="pz-left'+(left<=4?' low':'')+'" id="pzleft">'+left+'</span><span class="lbl" style="opacity:.6">swaps left</span></div>'
      +'<button class="journal-tab" id="jtab"><span class="lbl">notes</span><span class="count">'+E.notebook.count()+'</span></button></div>';
  }
  function updateBudget(){ var e=document.getElementById("pzleft"); if(e){ var l=budgetLeft(); e.textContent=l; if(l<=4) e.classList.add("low"); } }

  function nightStage(i){
    S.stageIdx=i; var st=S.stages[i];
    PZ={ N:st.N, sym:st.sym, grid:shuffled(st.N*st.N), sel:-1, budget:st.budget, used:0, solved:false, over:false };
    E.nightClass(true); E.danger(true);
    E.setBg(st.bg,"center 40%","night");
    E.render(budgetHUD(i)
      +'<div class="scene fade">'
      +'<div class="q-progress">Night — seal '+(i+1)+' of 3 \u00b7 '+st.N+'\u00d7'+st.N+'</div>'
      +'<div class="q-prompt" style="font-size:clamp(1.2rem,3.6vw,1.6rem)">Tap two pieces to swap them. Make the symbol whole before the swaps run out.</div>'
      +'<div id="pzwrap" class="pz-outer pz-wrap">'+innerPuzzle()+'</div>'
      +'<div class="watch-tag" id="pzmsg">&nbsp;</div>'
      +'<button class="ref-toggle" id="ref">check Jade\u2019s notes</button>'
      +'</div>');
    bindJ(); bindTiles();
    document.getElementById("ref").onclick=E.notebook.open;
  }

  function tapTile(c){
    if(!PZ || PZ.solved || PZ.over) return;
    if(PZ.sel===-1){ PZ.sel=c; refreshPuzzle(); return; }
    if(PZ.sel===c){ PZ.sel=-1; refreshPuzzle(); return; }
    var a=PZ.sel, t=PZ.grid[a]; PZ.grid[a]=PZ.grid[c]; PZ.grid[c]=t;
    PZ.sel=-1; PZ.used++;
    if(isSolved(PZ.grid)){
      PZ.solved=true; S.cleared++; refreshPuzzle(); updateBudget();
      var last=(S.stageIdx>=S.stages.length-1);
      var msg=document.getElementById("pzmsg"); if(msg) msg.textContent = last ? "The last seal closes." : "Seal "+(S.stageIdx+1)+" holds.";
      setTimeout(function(){ if(last) end(); else stageClear(S.stageIdx+1); }, 950);
      return;
    }
    refreshPuzzle(); updateBudget();
    if(budgetLeft()<=0){ PZ.over=true; var m=document.getElementById("pzmsg"); if(m) m.textContent="No more time to move."; setTimeout(end,800); return; }
    if(budgetLeft()<=4){ var mm=document.getElementById("pzmsg"); if(mm) mm.textContent="They\u2019re at the edge of the clearing."; }
  }

  function stageClear(nextIdx){
    E.nightClass(true); E.danger(true);
    E.setBg("assets/bottle-tree.jpg","center 45%","night");
    var next=S.stages[nextIdx];
    E.render('<div class="scene fade"><div class="eyebrow">Seal '+nextIdx+' of 3 \u2014 held</div>'
      +'<div class="panel"><div class="narr"><p class="lead">The pieces lock and the symbol catches a cold gold light, complete. One seal holds \u2014 but the dark only leans in harder, and Jade is already scratching out the next, larger figure.</p>'
      +'<p style="opacity:.8">Next: a '+next.N+'\u00d7'+next.N+' seal. '+(next.N*next.N)+' pieces. Less mercy.</p></div></div>'
      +'<div class="actions"><button class="btn warm" id="b">Assemble the next seal</button></div></div>');
    document.getElementById("b").onclick=function(){ nightStage(nextIdx); };
  }

  function end(){
    var c=S.cleared; // 0..3
    var eyebrow,title,body,img,focal,scrim,warm;
    if(c>=3){ img="assets/colony-ext.jpg"; focal="center 40%"; scrim="med"; warm=true; E.nightClass(false); E.danger(false);
      eyebrow="Dawn — all three seals held"; title="Jade was right.";
      body='<p class="lead">The last of eighty-one pieces drops into place and the whole nested figure catches a cold gold light, sealed three layers deep. The smiling things stop at the edge of it and will not come closer, and stay stopped until the sky greys over.</p>'
        +'<p>Jade laughs once, not entirely sane, entirely vindicated. You out-patterned the dark, all the way down. He cuts the finished symbols fresh into the bark so the next soul won\u2019t have to scatter for the pieces.</p>'; }
    else if(c===2){ img="assets/monster-house.jpg"; focal="center 35%"; scrim="night"; warm=false; E.nightClass(true); E.danger(true);
      eyebrow="Dawn — two seals, then the swaps ran out"; title="Held. Barely.";
      body='<p class="lead">Two of the three came together before your hands ran out of moves \u2014 and two was just enough. The outer seals held the night off the way a cracked door holds a storm, and dawn found you still standing behind them.</p>'
        +'<p>You\u2019re alive. The third figure lies unfinished in the dirt, and you both know the next night won\u2019t leave that gap unpunished.</p>'; }
    else { img="assets/monster-smiling.jpg"; focal="center 40%"; scrim="night"; warm=false; E.nightClass(true); E.danger(true);
      eyebrow="No morning for them"; title="The pattern never closed.";
      body= '<p class="lead">The seals never came whole. The swaps ran out with the symbol still broken in the dirt, and a broken symbol seals nothing at all.</p>'
        +'<p>The smiling things step over the unfinished figures as if they were only scratches in the mud. For Jade, they always were.</p>'; }

    if(c>=2) E.complete("jade");

    E.setBg(img,focal,scrim);
    var nxt=E.next("jade"), canNext = nxt && E.isUnlocked(nxt.id);
    var nextBtn = canNext ? '<button class="btn warm" id="nextLvl">Level '+nxt.num+' — '+nxt.title+' \u203a</button>' : '';
    E.render('<div class="scene fade">'
      +'<div class="end-head" style="gap:18px"><div style="width:84px;height:84px;flex:0 0 auto">'
      +'<svg viewBox="0 0 300 300" style="width:100%;height:100%;stroke:'+(c>=2?'var(--talisman-bright)':'var(--moon-dim)')+';fill:none;stroke-width:6;stroke-linecap:round;stroke-linejoin:round;'+(c>=2?'filter:drop-shadow(0 0 7px var(--talisman-bright))':'opacity:.5')+'">'+SYM_A+'</svg></div>'
      +'<div><div class="eyebrow" style="margin:0 0 6px">'+eyebrow+'</div>'
      +'<h2 class="title" style="font-size:clamp(2.3rem,7vw,3.6rem)">'+title+'</h2></div></div>'
      +'<div class="panel"><div class="narr">'+body+'</div>'
      +'<div class="narr" style="margin-top:14px;opacity:.78;font-size:1rem">Seals completed: <strong>'+c+' / 3</strong></div></div>'
      +'<div class="actions"><button class="btn '+(warm?'':'warm')+'" id="again">Face the seals again</button>'
      + nextBtn
      +'<button class="btn ghost" id="menu">Menu</button></div>'
      +(canNext?'':'<p style="margin-top:14px;font-family:var(--displaysc);letter-spacing:.06em;font-size:.82rem;opacity:.6;text-shadow:0 1px 8px #000">Level IV is still being carved.</p>')
      +'</div>');
    document.getElementById("again").onclick=function(){ S.cleared=0; buildStages(); nightStage(0); };
    document.getElementById("menu").onclick=E.hub;
    if(canNext) document.getElementById("nextLvl").onclick=function(){ E.startLevel(nxt.id); };
  }

  /* ---------- register ---------- */
  E.addLevel({ id:"jade", num:3, title:"Jade", tagline:"Assemble three seals, or the night gets in", start:boot });
})();
