/* ===========================================================================
   Level 4 — JULIE  ·  "The Room That Remembers"
   A fourth distinct kind of game: a POINT-AND-CLICK ESCAPE ROOM.
   Examine the room, find a key, read two clues (the children's drawing = the
   chest code; the stopped clock = the door's mark), open the chest for the
   music box, and unlock the door before the daylight runs out.

   Injects its own CSS and uses only existing art, so adding it to the game
   needs NO index.html edit — just drop levels/level4.js in.
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
    box:'<svg viewBox="0 0 48 48"><rect x="10" y="20" width="28" height="16" rx="2"/><path d="M10 26 H38 M16 20 v-3 a8 4 0 0 1 16 0 v3"/><circle cx="24" cy="30" r="2"/></svg>'
  };

  /* ---------- state ---------- */
  var J;
  function reset(){
    J = {
      daylight:6, max:6,
      has:{ key:false, box:false },
      seen:{ note:false, drawing:false, clock:false },
      drawerOpen:false, chestOpen:false, escaped:false,
      chestCode:[ rnd4(), rnd4(), rnd4() ],
      doorMark: rnd4(),
      chestInput:[], doorPick:-1, msg:null, msgCls:""
    };
  }
  function rnd4(){ return Math.floor(Math.random()*4); }

  /* ---------- helpers ---------- */
  function bindJ(){ var t=document.getElementById("jtab"); if(t) t.onclick=E.notebook.open; }
  function scrimNow(){ return J.daylight>3 ? "med" : (J.daylight>1 ? "heavy" : "night"); }
  function spendLight(){ J.daylight--; if(J.daylight<0) J.daylight=0; return J.daylight<=0; }
  function note(tag, sub, text){ E.notebook.add({tag:tag, sub:sub, text:text}); }

  function lightPips(){
    var p=''; for(var i=0;i<J.max;i++){ p+='<span class="er-pip'+(i<J.daylight?'':' out')+'"></span>'; }
    return '<div class="status"><div class="er-light"><span class="lbl">daylight</span>'+p+'</div>'
      +'<button class="journal-tab" id="jtab"><span class="lbl">notes</span><span class="count">'+E.notebook.count()+'</span></button></div>';
  }
  function invBar(){
    var chips='';
    if(J.has.key) chips+='<span class="er-chip">'+ICON.key.replace('<svg','<svg style="width:17px;height:17px;stroke:var(--talisman-bright);fill:none;stroke-width:2.4"')+'brass key</span>';
    if(J.has.box) chips+='<span class="er-chip">'+ICON.box.replace('<svg','<svg style="width:17px;height:17px;stroke:var(--talisman-bright);fill:none;stroke-width:2.4"')+'music box</span>';
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

  /* ---------- the room hub ---------- */
  function renderRoom(){
    var low = J.daylight<=2;
    E.nightClass(low); E.danger(low);
    E.setBg("assets/room.jpg","center 45%", scrimNow());
    var objs=[
      { k:"desk",  name:"The desk",   tag:J.drawerOpen?"drawer open":"a locked drawer", solved:J.drawerOpen },
      { k:"floor", name:"The floor",  tag:J.has.key?"board pried up":"a loose board",    solved:J.has.key },
      { k:"clock", name:"The clock",  tag:J.seen.clock?"stopped \u00b7 read":"stopped",  solved:J.seen.clock },
      { k:"chest", name:"The chest",  tag:J.chestOpen?"open \u00b7 emptied":"locked",     solved:J.chestOpen },
      { k:"door",  name:"The door",   tag:"the way out",                                  solved:false }
    ];
    var cards=objs.map(function(o){
      return '<button class="er-card'+(o.solved?' solved':'')+'" data-k="'+o.k+'">'
        +'<div class="er-ico">'+ICON[o.k]+'</div>'
        +'<div class="er-name">'+o.name+'</div>'
        +'<div class="er-tag">'+o.tag+'</div></button>';
    }).join("");
    E.render(lightPips()
      +'<div class="scene fade"><div class="eyebrow">The locked room — examine everything</div>'
      + invBar()
      +'<div class="er-room">'+cards+'</div>'
      +'<p style="margin-top:16px;font-family:var(--displaysc);letter-spacing:.05em;font-size:.82rem;opacity:.6;text-shadow:0 1px 8px #000">Wrong guesses on the locks cost daylight. Read the room before you try them.</p>'
      +'</div>');
    bindJ();
    Array.prototype.forEach.call(document.querySelectorAll(".er-card[data-k]"), function(b){
      b.onclick=function(){ open(b.getAttribute("data-k")); };
    });
  }

  function open(k){
    if(k==="desk") return openDesk();
    if(k==="floor") return openFloor();
    if(k==="clock") return openClock();
    if(k==="chest") return openChest();
    if(k==="door") return openDoor();
  }

  /* ---------- desk ---------- */
  function openDesk(){
    E.setBg("assets/room-desk.jpg","center 58%","med");
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
    E.setBg("assets/room-floor.jpg","center 62%","med");
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
    E.setBg("assets/room-chest.jpg","center 48%","med");
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
      if(J.doorPick===J.doorMark){ J.escaped=true; end(true); }
      else {
        var dead=spendLight();
        if(dead){ end(false); return; }
        J.msg="Wrong mark. The dark gains."; J.msgCls="bad"; J.doorPick=-1; openDoor();
      }
    };
  }

  /* ---------- endings ---------- */
  function end(won){
    var eyebrow,title,body,img,focal,scrim,warm;
    if(won && J.daylight>=4){ img="assets/aerial.jpg"; focal="center 40%"; scrim="med"; warm=true; E.nightClass(false); E.danger(false);
      eyebrow="Out — with light to spare"; title="Julie walks out whole.";
      body='<p class="lead">The lock turns, the door gives, and she steps back into a town that still has some grey light left in it \u2014 the music box clutched to her chest, the little room sealing shut behind her like it was never there.</p>'
        +'<p>She read the room faster than it could close on her. Whatever the box is for, she has it now, and she has the time to carry it where it needs to go.</p>'; }
    else if(won){ img="assets/colony-ext.jpg"; focal="center 45%"; scrim="night"; warm=false; E.nightClass(true); E.danger(true);
      eyebrow="Out — barely"; title="The door opens on the dark.";
      body='<p class="lead">The dial clicks home as the last of the light dies, and the door swings open onto a night already breathing. She runs, the music box cold against her, and makes the treeline a heartbeat ahead of what was waking in the room.</p>'
        +'<p>She got out. She got the box. She also knows she cut it far, far too close.</p>'; }
    else { img="assets/monster-house.jpg"; focal="center 35%"; scrim="night"; warm=false; E.nightClass(true); E.danger(true);
      eyebrow="The light ran out"; title="The room keeps her.";
      body='<p class="lead">The daylight gutters and goes, and the little room is no longer empty. The marks she couldn\u2019t read stay locked, the door stays shut, and the children\u2019s humming gets closer in the dark.</p>'
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
      +'<div class="narr" style="margin-top:14px;opacity:.78;font-size:1rem">'+(won?('Escaped with <strong>'+J.daylight+'</strong> daylight to spare'):'The music box stays in the chest')+'</div></div>'
      +'<div class="actions"><button class="btn '+(warm?'':'warm')+'" id="again">Try the room again</button>'
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
