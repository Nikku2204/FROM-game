/* ===========================================================================
   Level 4 — JULIE  ·  "The Room That Remembers"
   A POINT-AND-CLICK ESCAPE in three rooms, on one falling-light timer:
     1. the nursery  — find the key, read the drawing (chest code) and the clock
                       (door mark), open the chest for the music box, work the door
     2. the cellar   — a candle to read the wall, an iron crank to free the seized
                       hatch, then its four-mark order
     3. the lake     — ready the boat (oars + bung), read the carved post, unlock
                       the winch chain, and row out before the dark gets in

   Injects its own CSS and uses only the level's own art, so adding it to the
   game needs NO index.html edit — just drop levels/level4.js in (with the
   nursery / cellar / lake assets in assets/).
   =========================================================================== */
(function(){
  "use strict";
  var E = window.Engine;

  /* ---------- styles ---------- */
  if(!document.getElementById("lvl4-style")){
    var st=document.createElement("style"); st.id="lvl4-style";
    st.textContent =
      ".er-room{margin-top:20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:12px;max-width:660px}"
     +".er-card{cursor:pointer;text-align:center;padding:16px 12px;background:rgba(8,8,12,.5);border:1px solid rgba(255,255,255,.16);border-radius:10px;color:inherit;font-family:inherit;transition:transform .15s,border-color .2s,background .2s}"
     +".er-card:hover{transform:translateY(-3px);border-color:var(--lantern)}"
     +".er-card.solved{border-color:var(--talisman)}"
     +".er-ico{height:44px;display:flex;align-items:center;justify-content:center;margin-bottom:8px}"
     +".er-ico svg{height:100%;stroke:var(--moon);fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;opacity:.85}"
     +".er-card.solved .er-ico svg{stroke:var(--talisman);opacity:1}"
     +".er-name{font-family:var(--display);font-size:1.05rem}"
     +".er-tag{font-family:var(--displaysc);letter-spacing:.06em;font-size:.7rem;opacity:.6;margin-top:3px}"
     +".er-card.solved .er-tag{color:var(--moss);opacity:.85}"
     +".er-inv{display:flex;align-items:center;gap:9px;flex-wrap:wrap}"
     +".er-chip{display:inline-flex;align-items:center;gap:7px;padding:5px 11px;background:rgba(230,180,80,.12);border:1px solid var(--talisman);border-radius:20px;font-family:var(--displaysc);letter-spacing:.05em;font-size:.78rem}"
     +".er-chip svg{width:17px;height:17px;stroke:var(--talisman-bright);fill:none;stroke-width:2.4}"
     +".er-light{display:flex;align-items:center;gap:7px}"
     +".er-pip{width:12px;height:19px;border-radius:3px;background:var(--talisman);border:1px solid var(--talisman-bright);box-shadow:0 0 7px var(--talisman-bright);transition:all .4s}"
     +".er-pip.out{background:transparent;border-color:var(--moon-dim);opacity:.35;box-shadow:none}"
     +".er-close{max-width:60ch;margin:0 auto}"
     +".er-figure{display:flex;gap:18px;justify-content:center;margin:18px 0}"
     +".er-figure .er-g{width:62px;height:62px}"
     +".er-g svg{width:100%;height:100%;stroke:var(--talisman);fill:none;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}"
     +".er-clock{width:170px;height:170px;margin:14px auto}"
     +".er-entry{display:flex;gap:12px;justify-content:center;margin:16px 0}"
     +".er-slot{width:54px;height:54px;border:1px dashed rgba(255,255,255,.32);border-radius:8px;display:flex;align-items:center;justify-content:center;background:rgba(8,8,12,.4)}"
     +".er-slot svg{width:62%;height:62%;stroke:var(--talisman-bright);fill:none;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}"
     +".er-keys{display:flex;gap:11px;justify-content:center;flex-wrap:wrap;margin:14px 0}"
     +".er-key{width:58px;height:58px;cursor:pointer;background:rgba(8,8,12,.5);border:1px solid rgba(255,255,255,.2);border-radius:8px;display:flex;align-items:center;justify-content:center;transition:transform .1s,border-color .2s,box-shadow .2s}"
     +".er-key:hover{border-color:var(--lantern);transform:translateY(-2px)}"
     +".er-key.pick{border-color:var(--lantern-bright);box-shadow:0 0 0 2px var(--lantern-bright),0 0 14px rgba(240,189,94,.5)}"
     +".er-key svg{width:58%;height:58%;stroke:var(--moon);fill:none;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}"
     +".er-msg{min-height:1.5em;font-family:var(--displaysc);letter-spacing:.08em;text-align:center;margin-top:8px;opacity:.9}"
     +".er-msg.bad{color:var(--eye-glow)}"
     +".er-msg.good{color:var(--talisman-bright)}"
     +"@media(max-width:520px){.er-clock{width:140px;height:140px}.er-figure .er-g{width:50px;height:50px}}";
    document.head.appendChild(st);
  }

  /* ---------- the four marks (same as Jade's, for continuity) ---------- */
  var MARK = [
    '<svg viewBox="0 0 40 40">'+'<path d="M20 6 V34 M20 14 l-7 -7 M20 14 l7 -7 M20 23 l-8 -8 M20 23 l8 -8"/></svg>',
    '<svg viewBox="0 0 40 40">'+'<path d="M20 7 L33 31 H7 Z"/></svg>',
    '<svg viewBox="0 0 40 40">'+'<circle cx="20" cy="20" r="12"/><path d="M9 20 H31"/></svg>',
    '<svg viewBox="0 0 40 40">'+'<path d="M7 12 L15 30 L20 16 L25 30 L33 12"/></svg>'
  ];
  function markG(m, color){ return '<svg viewBox="0 0 40 40" style="stroke:'+(color||'var(--talisman)')+';fill:none;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round">'+MARK[m]+'</svg>'; }

  /* ---------- object icons ---------- */
  var ICON = {
    desk:'<svg viewBox="0 0 48 48"><rect x="7" y="13" width="34" height="5" rx="1"/><path d="M11 18 V40 M37 18 V40 M11 28 H37"/><rect x="19" y="7" width="12" height="6" rx="1"/></svg>',
    floor:'<svg viewBox="0 0 48 48"><path d="M6 15 H42 M6 24 H42 M6 33 H42 M6 42 H42 M19 15 V24 M31 24 V33 M19 33 V42"/></svg>',
    clock:'<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="16"/><path d="M24 14 V24 L31 28"/></svg>',
    chest:'<svg viewBox="0 0 48 48"><path d="M13 19 a11 8 0 0 1 22 0"/><rect x="9" y="19" width="30" height="20" rx="2"/><path d="M9 27 H39 M24 24 V31"/></svg>',
    door:'<svg viewBox="0 0 48 48"><rect x="14" y="7" width="20" height="35" rx="1"/><path d="M14 42 H34"/><circle cx="29" cy="26" r="1.7"/></svg>',
    key:'<svg viewBox="0 0 48 48"><circle cx="16" cy="19" r="7"/><path d="M21 23 L39 41 M34 36 l4 -4 M30 32 l4 -4"/></svg>',
    box:'<svg viewBox="0 0 48 48"><rect x="10" y="20" width="28" height="16" rx="2"/><path d="M10 26 H38 M16 20 v-3 a8 4 0 0 1 16 0 v3"/><circle cx="24" cy="30" r="2"/></svg>',
    furnace:'<svg viewBox="0 0 48 48"><path d="M24 14 V9 h7"/><rect x="15" y="14" width="18" height="24" rx="2"/><rect x="19" y="19" width="10" height="9" rx="1"/><path d="M19 33 H29 M17 38 v3 M31 38 v3"/></svg>',
    shelf:'<svg viewBox="0 0 48 48"><path d="M8 13 H40 M8 25 H40 M8 37 H40"/><rect x="12" y="15" width="6" height="8" rx="1"/><rect x="22" y="15" width="6" height="8" rx="1"/><rect x="15" y="27" width="6" height="8" rx="1"/><rect x="26" y="27" width="6" height="8" rx="1"/></svg>',
    basin:'<svg viewBox="0 0 48 48"><ellipse cx="24" cy="18" rx="16" ry="5"/><path d="M8 18 L12 36 a12 4 0 0 0 24 0 L40 18"/></svg>',
    wall:'<svg viewBox="0 0 48 48"><path d="M7 14 H41 M7 24 H41 M7 34 H41 M18 14 V24 M30 14 V24 M12 24 V34 M24 24 V34 M36 24 V34 M18 34 V41 M30 34 V41"/></svg>',
    hatch:'<svg viewBox="0 0 48 48"><path d="M9 33 L24 17 L39 33 M24 17 V33 M9 33 H39"/><rect x="21" y="25" width="6" height="5" rx="1"/><path d="M13 38 H35 M16 42 H32"/></svg>',
    boathouse:'<svg viewBox="0 0 48 48"><path d="M10 38 V21 L24 11 L38 21 V38"/><path d="M18 38 V28 a6 6 0 0 1 12 0 V38"/><path d="M10 38 H38"/></svg>',
    reeds:'<svg viewBox="0 0 48 48"><path d="M8 40 H40"/><path d="M15 40 C13 30 12 22 15 13 M23 40 C23 28 21 20 23 11 M31 40 C29 31 28 24 31 15"/><ellipse cx="15" cy="12" rx="2" ry="4"/><ellipse cx="23" cy="10" rx="2" ry="4"/></svg>',
    post:'<svg viewBox="0 0 48 48"><rect x="21" y="9" width="6" height="29" rx="1"/><path d="M16 31 q8 7 16 0 M16 35 q8 7 16 0"/></svg>',
    boat:'<svg viewBox="0 0 48 48"><path d="M7 25 q17 15 34 0"/><path d="M7 25 H41"/><path d="M14 28 v4 M24 29 v5 M34 28 v4"/><path d="M27 24 L33 13"/></svg>',
    winch:'<svg viewBox="0 0 48 48"><circle cx="22" cy="24" r="11"/><circle cx="22" cy="24" r="3"/><path d="M22 13 V8 h5 M11 24 H6 M38 24 H33"/></svg>',
    candle:'<svg viewBox="0 0 48 48"><rect x="20" y="18" width="8" height="20" rx="1"/><path d="M18 38 H30"/><path d="M24 18 c-3 -3 -1 -7 0 -10 c1 3 3 7 0 10 Z"/></svg>',
    crank:'<svg viewBox="0 0 48 48"><path d="M16 36 V14 H30 M30 14 V22"/><circle cx="16" cy="36" r="2"/></svg>',
    oars:'<svg viewBox="0 0 48 48"><path d="M12 36 L30 14"/><ellipse cx="32" cy="12" rx="4" ry="6"/><path d="M18 38 L36 16"/><ellipse cx="38" cy="14" rx="4" ry="6"/></svg>',
    bung:'<svg viewBox="0 0 48 48"><path d="M18 16 H30 L27 36 H21 Z"/><path d="M24 16 q7 -3 9 3"/></svg>'
  };

  /* ---------- state ---------- */
  var J;
  function reset(){
    J = {
      daylight:9, max:9,
      room:"nursery",
      has:{ key:false, box:false, candle:false, crank:false, oars:false, bung:false },
      seen:{ note:false, drawing:false, clock:false, furnace:false, wall:false, post:false },
      drawerOpen:false, chestOpen:false,
      hatchOpen:false, boatReady:false, winchOpen:false, bungIn:false, oarsIn:false,
      chestCode:[ rnd4(), rnd4(), rnd4() ],
      doorMark: rnd4(),
      cellarCode:[ rnd4(), rnd4(), rnd4(), rnd4() ],
      winchCode:[ rnd4(), rnd4(), rnd4(), rnd4() ],
      chestInput:[], doorPick:-1, cellarInput:[], winchInput:[],
      msg:null, msgCls:""
    };
  }
  function rnd4(){ return Math.floor(Math.random()*4); }

  /* ---------- helpers ---------- */
  function bindJ(){ var t=document.getElementById("jtab"); if(t) t.onclick=E.notebook.open; }
  function scrimNow(){ return J.daylight>5 ? "med" : (J.daylight>2 ? "heavy" : "night"); }
  function spendLight(){ J.daylight--; if(J.daylight<0) J.daylight=0; return J.daylight<=0; }
  function note(tag, sub, text){ E.notebook.add({tag:tag, sub:sub, text:text}); }

  function lightPips(){
    var p=''; for(var i=0;i<J.max;i++){ p+='<span class="er-pip'+(i<J.daylight?'':' out')+'"></span>'; }
    return '<div class="status"><div class="er-light"><span class="lbl">daylight</span>'+p+'</div>'
      +'<button class="journal-tab" id="jtab"><span class="lbl">notes</span><span class="count">'+E.notebook.count()+'</span></button></div>';
  }
  function invBar(){
    function chip(ic,label){ return '<span class="er-chip">'+ICON[ic].replace('<svg','<svg style="width:17px;height:17px;stroke:var(--talisman-bright);fill:none;stroke-width:2.4"')+label+'</span>'; }
    var chips='';
    if(J.has.key)    chips+=chip('key','brass key');
    if(J.has.candle) chips+=chip('candle','candle');
    if(J.has.crank)  chips+=chip('crank','iron crank');
    if(J.has.box)    chips+=chip('box','music box');
    if(J.has.oars)   chips+=chip('oars','oars');
    if(J.has.bung)   chips+=chip('bung','bung');
    if(!chips) chips='<span style="opacity:.5;font-family:var(--displaysc);letter-spacing:.06em;font-size:.8rem">your hands are empty</span>';
    return '<div class="er-inv" style="margin:14px 0 0">'+chips+'</div>';
  }
  function backBtn(extra){ return '<div class="actions">'+(extra||'')+'<button class="btn ghost" id="back">\u2190 Back to the room</button></div>'; }
  function wireBack(){ var b=document.getElementById("back"); if(b) b.onclick=renderRoom; }

  /* ---------- entry ---------- */
  function boot(){
    reset();
    E.notebook.clear(); E.notebook.config("Julie\u2019s Notes"); E.notebook.subtitle("a locked room");
    intro();
  }

  function intro(){
    E.nightClass(false); E.danger(false);
    E.setBg("assets/julie.jpg","center 22%","vn");
    E.render('<div class="scene bottom fade">'
      +'<div class="vn-tag">Level Four — Julie</div>'
      +'<div class="dialogue" style="max-width:60ch"><div class="speaker">Julie</div>'
      +'<div class="line">\u201cThe children walked me up here like it was a game \u2014 and the second I was inside, the door just\u2026 shut. Nothing on this side of it does anything.\u201d</div>'
      +'<div class="line">\u201cThe room\u2019s wrong. Old, like nobody\u2019s touched it in eighty years. They want the music box locked in that chest. I get it open, I find the way out, and I do it before the light goes. Simple.\u201d</div>'
      +'<div class="actions"><button class="btn warm" id="go">Look around the room</button>'
      +'<button class="btn ghost" id="menu">Menu</button></div></div>');
    document.getElementById("go").onclick=function(){ E.startMusic(); renderRoom(); };
    document.getElementById("menu").onclick=E.hub;
  }

  /* ---------- the room hubs ---------- */
  function renderRoom(){
    if(J.room==="cellar") return renderCellar();
    if(J.room==="lake")   return renderLake();
    return renderNursery();
  }

  function renderHub(eyebrow, objs){
    var cards=objs.map(function(o){
      return '<button class="er-card'+(o.solved?' solved':'')+'" data-k="'+o.k+'">'
        +'<div class="er-ico">'+ICON[o.k]+'</div>'
        +'<div class="er-name">'+o.name+'</div>'
        +'<div class="er-tag">'+o.tag+'</div></button>';
    }).join("");
    E.render(lightPips()
      +'<div class="scene fade"><div class="eyebrow">'+eyebrow+'</div>'
      + invBar()
      +'<div class="er-room">'+cards+'</div>'
      +'<p style="margin-top:16px;font-family:var(--displaysc);letter-spacing:.05em;font-size:.82rem;opacity:.6;text-shadow:0 1px 8px #000">Wrong guesses on the locks cost daylight. Read before you try.</p>'
      +'</div>');
    bindJ();
    Array.prototype.forEach.call(document.querySelectorAll(".er-card[data-k]"), function(b){
      b.onclick=function(){ open(b.getAttribute("data-k")); };
    });
  }

  function renderNursery(){
    var low = J.daylight<=3;
    E.nightClass(low); E.danger(low);
    E.setBg("assets/room.jpg","center 45%", scrimNow());
    renderHub("The locked room — examine everything", [
      { k:"desk",  name:"The desk",  tag:J.drawerOpen?"drawer open":"a locked drawer", solved:J.drawerOpen },
      { k:"floor", name:"The floor", tag:J.has.key?"board pried up":"a loose board",    solved:J.has.key },
      { k:"clock", name:"The clock", tag:J.seen.clock?"stopped \u00b7 read":"stopped",  solved:J.seen.clock },
      { k:"chest", name:"The chest", tag:J.chestOpen?"open \u00b7 emptied":"locked",     solved:J.chestOpen },
      { k:"door",  name:"The door",  tag:J.has.box?"unwilling \u00b7 try it":"the way out", solved:false }
    ]);
  }

  function renderCellar(){
    var low = J.daylight<=3;
    E.nightClass(true); E.danger(low);
    E.setBg("assets/julie_cellar.png","center 50%", scrimNow());
    renderHub("The cellar — examine everything", [
      { k:"furnace", name:"The furnace", tag:J.seen.furnace?"a burnt note read":"cold \u00b7 ash within", solved:J.seen.furnace },
      { k:"shelf",   name:"The shelves", tag:J.has.candle?"a jar emptied":"jars \u00b7 something sealed in", solved:J.has.candle },
      { k:"basin",   name:"The washtub", tag:J.has.crank?"reached \u00b7 drained":"black water",   solved:J.has.crank },
      { k:"wall",    name:"The wall",    tag:J.seen.wall?"marks read":"scratches in the dark",   solved:J.seen.wall },
      { k:"hatch",   name:"The hatch",   tag:"the way up",                                         solved:false }
    ]);
  }

  function renderLake(){
    var low = J.daylight<=3;
    E.nightClass(low); E.danger(low);
    E.setBg("assets/lake.png","center 50%", scrimNow());
    renderHub("The water\u2019s edge — examine everything", [
      { k:"boathouse", name:"The boathouse", tag:J.has.oars?"oars taken":"a dark doorway",   solved:J.has.oars },
      { k:"reeds",     name:"The reeds",     tag:J.has.bung?"taken":"something snagged",      solved:J.has.bung },
      { k:"post",      name:"The post",      tag:J.seen.post?"marks read":"carved",           solved:J.seen.post },
      { k:"boat",      name:"The boat",      tag:J.boatReady?"ready":"won\u2019t float yet",   solved:J.boatReady },
      { k:"winch",     name:"The winch",     tag:J.winchOpen?"unchained":"chained shut",      solved:J.winchOpen }
    ]);
  }

  function open(k){
    switch(k){
      case "desk":      return openDesk();
      case "floor":     return openFloor();
      case "clock":     return openClock();
      case "chest":     return openChest();
      case "door":      return openDoor();
      case "furnace":   return openFurnace();
      case "shelf":     return openShelf();
      case "basin":     return openBasin();
      case "wall":      return openWall();
      case "hatch":     return openHatch();
      case "boathouse": return openBoathouse();
      case "reeds":     return openReeds();
      case "post":      return openPost();
      case "boat":      return openBoat();
      case "winch":     return openWinch();
    }
  }

  /* ---------- desk ---------- */
  function openDesk(){
    E.setBg(J.drawerOpen?"assets/room-desk-open.png":"assets/room-desk.jpg","center 58%","med");
    if(!J.seen.note){ J.seen.note=true; note("The room\u2019s rules","a note on the desk","Scrawled on the blotter: \u2018the chest keeps the order the children drew \u2014 the clock keeps the mark of the door.\u2019"); }
    var body, extra="";
    if(J.drawerOpen){
      body='<p class="lead">The drawer hangs open. Inside is the child\u2019s drawing \u2014 three marks, pressed hard into the paper, in this order:</p>'
        +'<div class="er-figure">'+J.chestCode.map(function(m){ return '<div class="er-g">'+markG(m)+'</div>'; }).join("")+'</div>'
        +'<p style="opacity:.8">This is the order the chest wants.</p>';
    } else if(J.has.key){
      body='<p class="lead">A child\u2019s desk, the blotter covered in the same three marks over and over. The drawer is locked \u2014 but you\u2019re holding a small brass key that looks about right.</p>';
      extra='<button class="btn warm" id="usekey">Use the brass key</button>';
    } else {
      body='<p class="lead">A child\u2019s desk. A note on the blotter reads: <em>the chest keeps the order the children drew \u2014 the clock keeps the mark of the door.</em> The drawer is locked, and there\u2019s no key in sight.</p>';
    }
    E.render(lightPips()+'<div class="scene fade"><div class="eyebrow">The desk</div>'
      +'<div class="panel er-close"><div class="narr">'+body+'</div></div>'
      + backBtn(extra)+'</div>');
    bindJ(); wireBack();
    var uk=document.getElementById("usekey");
    if(uk) uk.onclick=function(){ J.drawerOpen=true; if(!J.seen.drawing){ J.seen.drawing=true; note("The chest\u2019s order","the child\u2019s drawing","Three marks in order on the drawing in the drawer. Enter them on the chest."); } openDesk(); };
  }

  /* ---------- floorboard ---------- */
  function openFloor(){
    E.setBg(J.has.key?"assets/room-floor-empty.png":"assets/room-floor.jpg","center 62%","med");
    var body, extra="";
    if(J.has.key){
      body='<p class="lead">The board is up. The little hollow beneath it is empty now \u2014 you already took the brass key.</p>';
    } else {
      body='<p class="lead">One floorboard sits proud of the others, its nails long gone. It lifts with a tug \u2014 and underneath, wrapped in a scrap of cloth, is a small brass key.</p>';
      extra='<button class="btn warm" id="takekey">Take the brass key</button>';
    }
    E.render(lightPips()+'<div class="scene fade"><div class="eyebrow">The floor</div>'
      +'<div class="panel er-close"><div class="narr">'+body+'</div></div>'
      + backBtn(extra)+'</div>');
    bindJ(); wireBack();
    var tk=document.getElementById("takekey");
    if(tk) tk.onclick=function(){ J.has.key=true; note("Brass key","under the floorboard","A small brass key. Something in this room is locked."); openFloor(); };
  }

  /* ---------- clock ---------- */
  function openClock(){
    E.setBg("assets/room-clock.jpg","center 42%","med");
    if(!J.seen.clock){ J.seen.clock=true; note("The door\u2019s mark","the stopped clock","The clock\u2019s hand has stopped resting on a single mark. That is the mark the door wants."); }
    E.render(lightPips()+'<div class="scene fade"><div class="eyebrow">The clock</div>'
      +'<div class="panel er-close"><div class="narr">'
      +'<p class="lead">A mantel clock, stopped dead, its glass cracked across. You wipe the dust away and find, scratched faintly beneath the numerals, four small marks \u2014 and the stopped hand resting on one of them.</p></div>'
      +'<div class="er-clock">'+clockSVG(J.doorMark)+'</div>'
      +'<p style="text-align:center;opacity:.8">The hand rests on this mark. Remember it for the door.</p></div>'
      + backBtn()+'</div>');
    bindJ(); wireBack();
  }
  function clockSVG(dm){
    var pos=[[100,40],[160,100],[100,160],[40,100]];
    var hand=[[100,54],[146,100],[100,146],[54,100]][dm];
    var marks='';
    for(var i=0;i<4;i++){
      marks+='<svg x="'+(pos[i][0]-15)+'" y="'+(pos[i][1]-15)+'" width="30" height="30" viewBox="0 0 40 40" style="stroke:'+(i===dm?'var(--talisman-bright)':'var(--moon-dim)')+';stroke-width:2.4">'+MARK[i]+'</svg>';
    }
    return '<svg viewBox="0 0 200 200" style="width:100%;height:100%;fill:none;stroke:var(--moon);stroke-width:2;stroke-linecap:round;stroke-linejoin:round">'
      +'<circle cx="100" cy="100" r="88"/>'
      + marks
      +'<line x1="100" y1="100" x2="'+hand[0]+'" y2="'+hand[1]+'" style="stroke:var(--lantern-bright);stroke-width:3"/>'
      +'<circle cx="100" cy="100" r="4" style="stroke:var(--lantern-bright);fill:var(--lantern-bright)"/></svg>';
  }

  /* ---------- chest (3-mark code) ---------- */
  function openChest(){
    E.setBg(J.chestOpen?"assets/room-chest-open.png":"assets/room-chest.jpg","center 48%","med");
    if(J.chestOpen){
      E.render(lightPips()+'<div class="scene fade"><div class="eyebrow">The chest</div>'
        +'<div class="panel er-close"><div class="narr"><p class="lead">The lid is open. The music box is already in your hands \u2014 small, cold, heavier than it looks.</p></div>'
        +'<div class="er-figure"><div class="er-g" style="width:78px;height:78px">'+ICON.box.replace('<svg','<svg style="width:100%;height:100%;stroke:var(--talisman-bright);fill:none;stroke-width:2.4"')+'</div></div></div>'
        + backBtn()+'</div>');
      bindJ(); wireBack(); return;
    }
    var slots='';
    for(var i=0;i<3;i++){ slots+='<div class="er-slot">'+(J.chestInput[i]!=null?markG(J.chestInput[i],'var(--talisman-bright)'):'')+'</div>'; }
    var keys='';
    for(var k=0;k<4;k++){ keys+='<button class="er-key" data-m="'+k+'">'+markG(k,'var(--moon)')+'</button>'; }
    var msg = J.msg?('<div class="er-msg '+(J.msgCls||'')+'">'+J.msg+'</div>'):'<div class="er-msg">&nbsp;</div>';
    J.msg=null;
    E.render(lightPips()+'<div class="scene fade"><div class="eyebrow">The chest</div>'
      +'<div class="panel er-close"><div class="narr"><p class="lead">A heavy toy chest, its lid held by a dial of marks. Three of them, in the right order.</p>'
      + (J.seen.drawing?'<p style="opacity:.75">The child\u2019s drawing in the desk drawer holds the order.</p>':'<p style="opacity:.75">You don\u2019t know the order yet \u2014 something in the room must.</p>')
      +'</div>'
      +'<div class="er-entry">'+slots+'</div>'
      +'<div class="er-keys">'+keys+'</div>'
      + msg
      +'</div>'
      + backBtn('<button class="btn" id="clr">Clear</button><button class="btn warm" id="try">Try the lock</button>')+'</div>');
    bindJ(); wireBack();
    Array.prototype.forEach.call(document.querySelectorAll(".er-key[data-m]"), function(b){
      b.onclick=function(){ if(J.chestInput.length<3){ J.chestInput.push(parseInt(b.getAttribute("data-m"),10)); openChest(); } };
    });
    document.getElementById("clr").onclick=function(){ J.chestInput=[]; openChest(); };
    document.getElementById("try").onclick=function(){
      if(J.chestInput.length<3){ J.msg="Enter all three marks."; J.msgCls=""; openChest(); return; }
      if(J.chestInput.join()===J.chestCode.join()){
        J.chestOpen=true; J.has.box=true; J.chestInput=[];
        note("The music box","recovered from the chest","Out of the chest at last \u2014 the thing the children keep humming about. Now the door.");
        J.msg=null; openChest();
      } else {
        J.chestInput=[];
        var dead=spendLight();
        if(dead){ end(false); return; }
        J.msg="The lock holds. The light dims."; J.msgCls="bad"; openChest();
      }
    };
  }

  /* ---------- door (1-mark + needs box) ---------- */
  function openDoor(){
    E.setBg("assets/room-door.jpg","center 45%","med");
    if(!J.has.box){
      E.render(lightPips()+'<div class="scene fade"><div class="eyebrow">The door</div>'
        +'<div class="panel er-close"><div class="narr"><p class="lead">The way out. You pull, and it doesn\u2019t give an inch \u2014 not locked so much as <em>unwilling</em>, as if the room won\u2019t let you leave empty-handed. Whatever it wants, you don\u2019t have it yet.</p></div></div>'
        + backBtn()+'</div>');
      bindJ(); wireBack(); return;
    }
    var keys='';
    for(var k=0;k<4;k++){ keys+='<button class="er-key'+(J.doorPick===k?' pick':'')+'" data-m="'+k+'">'+markG(k,'var(--moon)')+'</button>'; }
    var msg = J.msg?('<div class="er-msg '+(J.msgCls||'')+'">'+J.msg+'</div>'):'<div class="er-msg">&nbsp;</div>';
    J.msg=null;
    E.render(lightPips()+'<div class="scene fade"><div class="eyebrow">The door</div>'
      +'<div class="panel er-close"><div class="narr"><p class="lead">With the music box in hand, the door\u2019s lock turns at your touch \u2014 a single dial of marks. Set it to the one the clock gave you.</p>'
      + (J.seen.clock?'':'<p style="opacity:.75">You haven\u2019t read the clock yet.</p>')
      +'</div>'
      +'<div class="er-keys">'+keys+'</div>'
      + msg
      +'</div>'
      + backBtn('<button class="btn warm" id="turn">Turn the lock</button>')+'</div>');
    bindJ(); wireBack();
    Array.prototype.forEach.call(document.querySelectorAll(".er-key[data-m]"), function(b){
      b.onclick=function(){ J.doorPick=parseInt(b.getAttribute("data-m"),10); openDoor(); };
    });
    document.getElementById("turn").onclick=function(){
      if(J.doorPick<0){ J.msg="Choose a mark first."; J.msgCls=""; openDoor(); return; }
      if(J.doorPick===J.doorMark){ enterCellar(); }
      else {
        var dead=spendLight();
        if(dead){ end(false); return; }
        J.msg="Wrong mark. The dark gains."; J.msgCls="bad"; J.doorPick=-1; openDoor();
      }
    };
  }

  /* =========================== CELLAR (room 2) =========================== */
  function enterCellar(){
    J.room="cellar"; J.daylight=Math.max(0,J.daylight-1);
    E.nightClass(true); E.danger(true);
    E.setBg("assets/julie_cellar.png","center 50%","heavy"); E.sound.setMood("night");
    E.render(lightPips()+'<div class="scene fade"><div class="eyebrow">Down</div>'
      +'<div class="panel er-close"><div class="narr"><p class="lead">The door swings inward on cold, earth-smelling dark \u2014 not the outside at all, but stone steps going down. The little room sighs shut behind her, and there\u2019s no handle on this side either. The music box is cold in her hands. Down is the only way on.</p></div></div>'
      +'<div class="actions"><button class="btn warm" id="go">Down into the cellar</button></div></div>');
    document.getElementById("go").onclick=renderRoom;
  }

  function openFurnace(){
    E.setBg("assets/cellar-furnace.png","center 55%","med");
    if(!J.seen.furnace){ J.seen.furnace=true; note("The cellar\u2019s rule","a burnt page in the stove","Half-burned in the ash: \u2018what the children chalked on the wall opens the way up \u2014 but the dark keeps it. Carry a light to read it.\u2019"); }
    E.render(lightPips()+'<div class="scene fade"><div class="eyebrow">The furnace</div>'
      +'<div class="panel er-close"><div class="narr"><p class="lead">A cold cast-iron stove, its door fallen open on grey ash. One scrap of paper survived the burning \u2014 just enough to read: <em>what the children chalked on the wall opens the way up, but the dark keeps it. Carry a light.</em></p><p style="opacity:.8">Light to read the wall \u2014 and the wall holds the order for the hatch.</p></div></div>'
      + backBtn()+'</div>');
    bindJ(); wireBack();
  }

  function openShelf(){
    E.setBg("assets/cellar-shelf.png","center 50%","med");
    var body, extra="";
    if(J.has.candle){
      body='<p class="lead">Rows of dead preserves behind clouded glass. The one jar that mattered stands open and empty now \u2014 you\u2019ve taken the candle stub that was sealed inside it.</p>';
    } else {
      body='<p class="lead">Rows of old preserving jars, most gone to rot. One holds no fruit at all \u2014 a stub of tallow candle, sealed in clean and dry, with the means to light it. A way to make light down here.</p>';
      extra='<button class="btn warm" id="takec">Take the candle</button>';
    }
    E.render(lightPips()+'<div class="scene fade"><div class="eyebrow">The shelves</div>'
      +'<div class="panel er-close"><div class="narr">'+body+'</div></div>'
      + backBtn(extra)+'</div>');
    bindJ(); wireBack();
    var t=document.getElementById("takec");
    if(t) t.onclick=function(){ J.has.candle=true; note("A candle","sealed in a jar","A stub of candle, lit. The cellar\u2019s too dark to read the wall without it."); openShelf(); };
  }

  function openBasin(){
    E.setBg(J.has.crank?"assets/cellar-basin-empty.png":"assets/cellar-basin.png","center 55%","med");
    var body, extra="";
    if(J.has.crank){
      body='<p class="lead">The black water sits low and disturbed where you reached in. Whatever it was hiding \u2014 a cold iron crank \u2014 is in your hand now.</p>';
    } else {
      body='<p class="lead">A galvanized tub brimful of cold black water, a skin of scum and a dead leaf on top. Something metal rests just under the surface. You roll up a sleeve.</p>';
      extra='<button class="btn warm" id="takecr">Reach into the water</button>';
    }
    E.render(lightPips()+'<div class="scene fade"><div class="eyebrow">The washtub</div>'
      +'<div class="panel er-close"><div class="narr">'+body+'</div></div>'
      + backBtn(extra)+'</div>');
    bindJ(); wireBack();
    var t=document.getElementById("takecr");
    if(t) t.onclick=function(){ J.has.crank=true; note("An iron crank","under the black water","A crank handle, cold from the tub. The hatch\u2019s mechanism is seized \u2014 this should turn it."); openBasin(); };
  }

  function openWall(){
    E.setBg("assets/cellar-wall.png","center 42%","med");
    if(!J.has.candle){
      E.render(lightPips()+'<div class="scene fade"><div class="eyebrow">The wall</div>'
        +'<div class="panel er-close"><div class="narr"><p class="lead">Your fingers find grooves cut and chalked into the stone \u2014 marks, a row of them \u2014 but the cellar dark swallows the shapes. You can\u2019t read what you can\u2019t see. You need a light.</p></div></div>'
        + backBtn()+'</div>');
    } else {
      if(!J.seen.wall){ J.seen.wall=true; note("The hatch\u2019s order","chalked on the cellar wall","Four marks, chalked in order on the wall. Set them on the hatch dial."); }
      E.render(lightPips()+'<div class="scene fade"><div class="eyebrow">The wall</div>'
        +'<div class="panel er-close"><div class="narr"><p class="lead">You hold the candle close and the chalk leaps out of the dark \u2014 four marks, pressed in a deliberate row:</p>'
        +'<div class="er-figure">'+J.cellarCode.map(function(m){ return '<div class="er-g">'+markG(m)+'</div>'; }).join("")+'</div>'
        +'<p style="opacity:.8">This is the order the hatch wants.</p></div></div>'
        + backBtn()+'</div>');
    }
    bindJ(); wireBack();
  }

  function openHatch(){
    if(!J.has.crank){
      E.setBg("assets/cellar-hatch.png","center 40%","med");
      E.render(lightPips()+'<div class="scene fade"><div class="eyebrow">The hatch</div>'
        +'<div class="panel er-close"><div class="narr"><p class="lead">A slanted wooden hatch at the head of the steps, barred by an iron lock seized solid with rust. The dial won\u2019t so much as twitch by hand \u2014 you\u2019d need something to turn it.</p></div></div>'
        + backBtn()+'</div>');
      bindJ(); wireBack(); return;
    }
    lockScreen({ eyebrow:"The hatch", img:"assets/cellar-hatch.png", focal:"center 40%",
      leadHTML:'<p class="lead">The crank bites into the seized lock and grinds it round \u2014 a dial of four marks, in the right order.</p>'+(J.seen.wall?'<p style="opacity:.75">The chalk on the wall holds the order.</p>':'<p style="opacity:.75">You don\u2019t know the order yet \u2014 the wall must.</p>'),
      len:4, inputKey:"cellarInput", code:J.cellarCode,
      onSolve:function(){ J.hatchOpen=true; note("Out of the cellar","the hatch gives","The lock turns, the hatch lifts \u2014 cold air, not a house. Out."); enterLake(); } });
  }

  /* =========================== LAKE (room 3) =========================== */
  function enterLake(){
    J.room="lake"; J.daylight=Math.max(0,J.daylight-1);
    E.nightClass(true); E.danger(true);
    E.setBg("assets/lake.png","center 50%","heavy"); E.sound.setMood("night");
    E.render(lightPips()+'<div class="scene fade"><div class="eyebrow">Out</div>'
      +'<div class="panel er-close"><div class="narr"><p class="lead">She heaves the hatch up and cold lake air pours over her \u2014 no house above at all, but a grey, drowned shore: black water, fog, a leaning boathouse, a rowboat in the mud. Somewhere across the water is away. The boat is the only way to reach it.</p></div></div>'
      +'<div class="actions"><button class="btn warm" id="go">Down to the water</button></div></div>');
    document.getElementById("go").onclick=renderRoom;
  }

  function openBoathouse(){
    E.setBg("assets/lake-boathouse.png","center 45%","med");
    var body, extra="";
    if(J.has.oars){
      body='<p class="lead">The boathouse holds nothing else that floats \u2014 a rusted lantern, coils of rope, the wet slipway, and the bare pegs on the wall where the oars hung before you took them.</p>';
    } else {
      body='<p class="lead">A black doorway over a flooded slipway. Inside, leaning in the dark against tarred planks, a pair of long wooden oars \u2014 and the boat outside had none.</p>';
      extra='<button class="btn warm" id="takeo">Take the oars</button>';
    }
    E.render(lightPips()+'<div class="scene fade"><div class="eyebrow">The boathouse</div>'
      +'<div class="panel er-close"><div class="narr">'+body+'</div></div>'
      + backBtn(extra)+'</div>');
    bindJ(); wireBack();
    var t=document.getElementById("takeo");
    if(t) t.onclick=function(){ J.has.oars=true; note("Oars","from the boathouse","A pair of oars. The boat will need them \u2014 and a way to stop it taking water."); openBoathouse(); };
  }

  function openReeds(){
    E.setBg(J.has.bung?"assets/lake-reeds-empty.png":"assets/lake-reeds.png","center 55%","med");
    var body, extra="";
    if(J.has.bung){
      body='<p class="lead">Just black water and bent reeds where it was caught. You\u2019ve worked the wooden bung free and pocketed it.</p>';
    } else {
      body='<p class="lead">Dead reeds at the muddy waterline, fog sitting low on the lake. Something is snagged among the stalks \u2014 a wooden bung on a frayed cord, the kind that stops a drain hole in a hull.</p>';
      extra='<button class="btn warm" id="takeb">Take the bung</button>';
    }
    E.render(lightPips()+'<div class="scene fade"><div class="eyebrow">The reeds</div>'
      +'<div class="panel er-close"><div class="narr">'+body+'</div></div>'
      + backBtn(extra)+'</div>');
    bindJ(); wireBack();
    var t=document.getElementById("takeb");
    if(t) t.onclick=function(){ J.has.bung=true; note("A bung","caught in the reeds","A wooden bung on a cord. For the leak in the boat\u2019s bottom."); openReeds(); };
  }

  function openPost(){
    E.setBg("assets/lake-post.png","center 42%","med");
    if(!J.seen.post){ J.seen.post=true; note("The chain\u2019s order","carved down the mooring post","Marks carved in order down the post. The winch\u2019s lock wants them."); }
    E.render(lightPips()+'<div class="scene fade"><div class="eyebrow">The mooring post</div>'
      +'<div class="panel er-close"><div class="narr"><p class="lead">A split, lichened mooring post, rope looped at its foot \u2014 and carved down its grey grain, deliberate and deep, a column of marks in order:</p>'
      +'<div class="er-figure">'+J.winchCode.map(function(m){ return '<div class="er-g">'+markG(m)+'</div>'; }).join("")+'</div>'
      +'<p style="opacity:.8">This is the order the winch lock wants.</p></div></div>'
      + backBtn()+'</div>');
    bindJ(); wireBack();
  }

  function openBoat(){
    if(J.boatReady){
      E.setBg("assets/lake-boat-ready.png","center 55%","med");
      E.render(lightPips()+'<div class="scene fade"><div class="eyebrow">The boat</div>'
        +'<div class="panel er-close"><div class="narr"><p class="lead">The boat sits ready at the jetty \u2014 bailed out, the bung driven home, the oars shipped and waiting. The only thing holding it to the shore now is the winch chain.</p></div></div>'
        + backBtn()+'</div>');
      bindJ(); wireBack(); return;
    }
    E.setBg("assets/lake-boat.png","center 55%","med");
    var body='<p class="lead">A small wooden rowboat half on the mud, a hand\u2019s depth of black water and dead leaves pooled in its bottom. It won\u2019t carry anyone across like this.</p>';
    var extra="";
    if(J.has.bung && !J.bungIn) extra+='<button class="btn warm" id="plug">Plug the drain hole</button>';
    if(J.has.oars && !J.oarsIn) extra+='<button class="btn warm" id="oar">Ship the oars</button>';
    if(!J.has.bung && !J.has.oars){ body+='<p style="opacity:.75">You\u2019ll need to stop the leak and find something to row with \u2014 and you have neither yet.</p>'; }
    else {
      var need=[];
      if(!J.bungIn) need.push(J.has.bung?'plug the leak':'a bung for the leak');
      if(!J.oarsIn) need.push(J.has.oars?'ship the oars':'oars to row');
      if(need.length) body+='<p style="opacity:.75">Still to do: '+need.join(' \u00b7 ')+'.</p>';
    }
    E.render(lightPips()+'<div class="scene fade"><div class="eyebrow">The boat</div>'
      +'<div class="panel er-close"><div class="narr">'+body+'</div></div>'
      + backBtn(extra)+'</div>');
    bindJ(); wireBack();
    var p=document.getElementById("plug"); if(p) p.onclick=function(){ J.bungIn=true; afterBoatStep(); };
    var o=document.getElementById("oar");  if(o) o.onclick=function(){ J.oarsIn=true; afterBoatStep(); };
  }
  function afterBoatStep(){
    if(J.bungIn && J.oarsIn && !J.boatReady){ J.boatReady=true; note("The boat\u2019s ready","plugged and oared","Bailed, plugged, oars shipped. Only the chain holds it now."); }
    if(J.boatReady && J.winchOpen){ end(true); return; }
    openBoat();
  }

  function openWinch(){
    lockScreen({ eyebrow:"The winch", img:"assets/lake-winch.png", focal:"center 45%",
      leadHTML:'<p class="lead">A rusted winch pins the boat to the jetty with a chained padlock \u2014 a dial of four marks.</p>'+(J.seen.post?'<p style="opacity:.75">The carved post holds the order.</p>':'<p style="opacity:.75">You don\u2019t know the order yet \u2014 the post must.</p>'),
      len:4, inputKey:"winchInput", code:J.winchCode,
      onSolve:function(){ J.winchOpen=true; note("The chain falls","the winch lock opens","The padlock springs and the chain pours off the drum into the water."); if(J.boatReady){ end(true); } else { winchFreed(); } } });
  }
  function winchFreed(){
    E.setBg("assets/lake-winch.png","center 45%","med");
    E.render(lightPips()+'<div class="scene fade"><div class="eyebrow">The winch</div>'
      +'<div class="panel er-close"><div class="narr"><p class="lead">The chain slithers off the drum and into the black water. The boat is loose \u2014 but it still sits low and oarless. It won\u2019t carry you anywhere until it\u2019s seaworthy.</p></div></div>'
      + backBtn()+'</div>');
    bindJ(); wireBack();
  }

  /* generic multi-mark lock — used by the cellar hatch and the lake winch */
  function lockScreen(o){
    E.setBg(o.img, o.focal, "med");
    var input=J[o.inputKey];
    var slots=''; for(var i=0;i<o.len;i++){ slots+='<div class="er-slot">'+(input[i]!=null?markG(input[i],'var(--talisman-bright)'):'')+'</div>'; }
    var keys='';  for(var k=0;k<4;k++){ keys+='<button class="er-key" data-m="'+k+'">'+markG(k,'var(--moon)')+'</button>'; }
    var msg = J.msg?('<div class="er-msg '+(J.msgCls||'')+'">'+J.msg+'</div>'):'<div class="er-msg">&nbsp;</div>'; J.msg=null;
    E.render(lightPips()+'<div class="scene fade"><div class="eyebrow">'+o.eyebrow+'</div>'
      +'<div class="panel er-close"><div class="narr">'+o.leadHTML+'</div>'
      +'<div class="er-entry">'+slots+'</div>'
      +'<div class="er-keys">'+keys+'</div>'
      + msg +'</div>'
      + backBtn('<button class="btn" id="clr">Clear</button><button class="btn warm" id="try">Try the lock</button>')+'</div>');
    bindJ(); wireBack();
    Array.prototype.forEach.call(document.querySelectorAll(".er-key[data-m]"), function(b){
      b.onclick=function(){ if(J[o.inputKey].length<o.len){ J[o.inputKey].push(parseInt(b.getAttribute("data-m"),10)); lockScreen(o); } };
    });
    document.getElementById("clr").onclick=function(){ J[o.inputKey]=[]; lockScreen(o); };
    document.getElementById("try").onclick=function(){
      if(J[o.inputKey].length<o.len){ J.msg="Enter all "+o.len+" marks."; J.msgCls=""; lockScreen(o); return; }
      if(J[o.inputKey].join()===o.code.join()){ J[o.inputKey]=[]; J.msg=null; o.onSolve(); }
      else { J[o.inputKey]=[]; var dead=spendLight(); if(dead){ end(false); return; } J.msg="The lock holds. The light dims."; J.msgCls="bad"; lockScreen(o); }
    };
  }

  /* ---------- endings ---------- */
  function end(won){
    var eyebrow,title,body,img,focal,scrim,warm;
    if(won && J.daylight>=4){ img="assets/lake.png"; focal="center 45%"; scrim="med"; warm=true; E.nightClass(false); E.danger(false);
      eyebrow="Away — with light to spare"; title="Julie rows out.";
      body='<p class="lead">The chain falls, the oars bite, and the boat slides off the mud into the still black water \u2014 the music box riding in the bow, the leaning house shrinking into the fog behind her while a little grey light still holds.</p>'
        +'<p>She read three rooms faster than the house could close on her: the nursery, the cellar, the shore. Whatever the box is for, she has it now, and the time to carry it where it needs to go.</p>'; }
    else if(won){ img="assets/lake.png"; focal="center 45%"; scrim="night"; warm=false; E.nightClass(true); E.danger(true);
      eyebrow="Away — barely"; title="The boat slips into the dark.";
      body='<p class="lead">The last of the light dies as the bow comes round, and behind her the whole shore seems to wake \u2014 the boathouse, the reeds, the house with its broken roof. She pulls hard at the oars and the fog folds over her a heartbeat ahead of whatever was rising at the waterline.</p>'
        +'<p>She got out. She got the box. She also knows she cut it far, far too close.</p>'; }
    else { img="assets/monster-house.jpg"; focal="center 35%"; scrim="night"; warm=false; E.nightClass(true); E.danger(true);
      eyebrow="The light ran out"; title="The dark gets in.";
      body='<p class="lead">The daylight gutters and goes, wherever she is standing when it does \u2014 and the cold comes in behind it. The marks she couldn\u2019t read stay locked, the way out stays shut, and the children\u2019s humming gets closer in the black.</p>'
        +'<p>The house that has no business standing keeps one more thing it has no business keeping.</p>'; }

    if(won) E.complete("julie");

    E.setBg(img,focal,scrim);
    var nxt=E.next("julie"), canNext = nxt && E.isUnlocked(nxt.id);
    var nextBtn = canNext ? '<button class="btn warm" id="nextLvl">Level '+nxt.num+' — '+nxt.title+' \u203a</button>' : '';
    E.render('<div class="scene fade">'
      +'<div class="end-head"><div style="width:74px;height:74px;flex:0 0 auto">'+ICON.box.replace('<svg','<svg style="width:100%;height:100%;stroke:'+(won?'var(--talisman-bright)':'var(--moon-dim)')+';fill:none;stroke-width:2.2;'+(won?'filter:drop-shadow(0 0 6px var(--talisman-bright))':'opacity:.5')+'"')+'</div>'
      +'<div><div class="eyebrow" style="margin:0 0 6px">'+eyebrow+'</div>'
      +'<h2 class="title" style="font-size:clamp(2.3rem,7vw,3.6rem)">'+title+'</h2></div></div>'
      +'<div class="panel"><div class="narr">'+body+'</div>'
      +'<div class="narr" style="margin-top:14px;opacity:.78;font-size:1rem">'+(won?('Out on the water with <strong>'+J.daylight+'</strong> daylight to spare'):'The way out stays shut')+'</div></div>'
      +'<div class="actions"><button class="btn '+(warm?'':'warm')+'" id="again">Try the escape again</button>'
      + nextBtn
      +'<button class="btn ghost" id="menu">Menu</button></div>'
      +(canNext?'':'<p style="margin-top:14px;font-family:var(--displaysc);letter-spacing:.06em;font-size:.82rem;opacity:.6;text-shadow:0 1px 8px #000">The last one belongs to Victor \u2014 still being carved.</p>')
      +'</div>');
    document.getElementById("again").onclick=boot;
    document.getElementById("menu").onclick=E.hub;
    if(canNext) document.getElementById("nextLvl").onclick=function(){ E.startLevel(nxt.id); };
  }

  /* ---------- register ---------- */
  E.addLevel({ id:"julie", num:4, title:"Julie", tagline:"Solve the locked room before the dark gets in", start:boot });
})();
