/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  WORLD OF DRIVER — SIGNATURE PREMIUM  v3.0                  ║
 * ║  Logo · Sons · Micro-animations · Neon LED · Dhikr Counter  ║
 * ║  + Shooting Star BG · LED Border FAB · Full Logo Replace    ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
"use strict";

// ══════════════════════════════════════════════════════════════
//  WOD SIGNATURE SONORE — Web Audio API
// ══════════════════════════════════════════════════════════════
const WOD_SOUND = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, type, vol, start, dur) {
    try {
      const c = getCtx();
      const osc  = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, c.currentTime + start);
      gain.gain.setValueAtTime(0, c.currentTime + start);
      gain.gain.linearRampToValueAtTime(vol, c.currentTime + start + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + dur);
      osc.start(c.currentTime + start);
      osc.stop(c.currentTime + start + dur + 0.01);
    } catch(e) {}
  }

  // Accord dorés premium – légèrement harmonisés
  function chime(freqs, vols, delays, durs, type='sine') {
    freqs.forEach((f,i) => tone(f, type, vols[i]||0.08, delays[i]||0, durs[i]||0.3));
  }

  return {
    // Ouverture app — accord doré ascendant cristallin
    open() {
      // Accord majeur ascendant très doux, 5 notes
      chime(
        [220, 330, 440, 550, 660],
        [0.09,0.08,0.10,0.06,0.05],
        [0,   0.12,0.22,0.30,0.42],
        [0.30,0.28,0.38,0.50,0.60]
      );
      // Overtone shimmer subtil
      setTimeout(() => tone(1320,'sine',0.025,0,0.55), 380);
    },

    // FAB principal — cristal + shimmer
    fab() {
      tone(740,'sine',0.10,0,0.14);
      tone(987,'sine',0.07,0.06,0.18);
      tone(1109,'triangle',0.04,0.14,0.22);
      // Petit écho doré
      tone(880,'sine',0.025,0.22,0.18);
    },

    // Clic standard — très court et précis
    click() {
      tone(880,'sine',0.06,0,0.07);
      tone(1100,'sine',0.025,0.02,0.05);
    },

    // Validation — 3 notes ascendantes
    success() {
      tone(523,'sine',0.08,0,0.16);
      tone(659,'sine',0.08,0.08,0.18);
      tone(784,'sine',0.10,0.16,0.32);
    },

    // Dhikr tap — cloche subtile
    dhikr() {
      tone(1047,'sine',0.06,0,0.12);
      tone(1319,'sine',0.035,0.04,0.10);
      // Harmonique douce
      tone(2093,'sine',0.012,0.02,0.08);
    },

    // Dhikr ×33 célébration — cascade dorée montante
    dhikrComplete() {
      [523,659,784,1047,880,1175,1568,2093].forEach(
        (f,i) => tone(f,'sine',0.09,i*0.10,0.22)
      );
      // Shimmer final
      setTimeout(() => {
        tone(2637,'sine',0.04,0,0.45);
        tone(3136,'sine',0.025,0.15,0.55);
      }, 700);
    },

    // Objectif atteint
    goal() {
      tone(392,'sine',0.09,0,0.14);
      tone(523,'sine',0.09,0.10,0.18);
      tone(659,'sine',0.11,0.20,0.22);
      tone(784,'sine',0.07,0.30,0.45);
    },

    // Erreur
    error() {
      tone(200,'sawtooth',0.07,0,0.11);
      tone(160,'sawtooth',0.05,0.10,0.11);
    },
  };
})();

window.playAppleSound = () => WOD_SOUND.click();

// ══════════════════════════════════════════════════════════════
//  IMAGE LOADER — gère les formats PNG/WEBP/JPG avec fallback SVG
// ══════════════════════════════════════════════════════════════
const WOD_IMG = {
  // logo complet (splash, célébration) puis repli sur l'original
  candidates: ['./wod-logo-full.png', './wod-logo-text.png', './logo.png', './icon-512.png', './icon-192.png'],
  markCandidates: ['./wod-logo-mark.png', './icon-192.png'],
  resolved: null, resolvedMark: null,

  fallbackSVG: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 80'%3E%3Ctext x='100' y='52' font-family='sans-serif' font-size='42' font-weight='500' fill='%23171A20' text-anchor='middle' letter-spacing='2'%3EWD%3C/text%3E%3C/svg%3E`,

  _probe(list) {
    return (async () => {
      for (const src of list) {
        const ok = await new Promise(res => { const i = new Image(); i.onload = () => res(true); i.onerror = () => res(false); i.src = src; });
        if (ok) return src;
      }
      return this.fallbackSVG;
    })();
  },
  async resolve()     { return this.resolved     || (this.resolved     = await this._probe(this.candidates)); },
  async resolveMark() { return this.resolvedMark || (this.resolvedMark = await this._probe(this.markCandidates)); },
  async resolveIcon() { return await this.resolveMark(); },

  // Splash + célébration = logo complet · en-tête = monogramme seul
  async applyToAll() {
    const full = await this.resolve();
    const mark = await this.resolveMark();
    const splashEl = document.getElementById('splash-logo-img');
    if (splashEl) { splashEl.src = full; }
    document.querySelectorAll('[data-wod-icon]').forEach(el => { el.src = mark; });
    document.querySelectorAll('[data-wod-logo]').forEach(el => { el.src = full; });
    const cel = document.getElementById('dhikr-celebration-logo');
    if (cel) cel.src = full;
    return full;
  },
};

// ══════════════════════════════════════════════════════════════
//  STYLES — widget Dhikr, célébration, micro-interactions
//  (l'ancien néon doré, les étoiles filantes et le halo FAB sont retirés)
// ══════════════════════════════════════════════════════════════
function injectSignatureStyles() {
  const style = document.createElement('style');
  style.id = 'wod-signature-styles';
  style.textContent = `
    .counter-pop { animation: cntPop .32s var(--ease) !important; }
    @keyframes cntPop { 0% { opacity:.4; transform:translateY(3px); } 100% { opacity:1; transform:none; } }
    .notif-item { animation: notifIn .26s var(--ease) both; }
    @keyframes notifIn { from { transform:translateY(4px); opacity:0; } to { transform:none; opacity:1; } }

    /* ── DHIKR ── */
    .dhikr-card { background:var(--surface); border-radius:var(--r-lg); padding:20px; margin:0 0 12px; position:relative; overflow:hidden; }
    .dhikr-title-row { display:flex; align-items:center; gap:10px; margin-bottom:16px; }
    .dhikr-icon { width:30px; height:30px; border-radius:50%; background:var(--raised); display:flex; align-items:center; justify-content:center; font-size:14px; color:var(--text); }
    .dhikr-title { font-size:1rem; font-weight:500; color:var(--text); }
    .dhikr-subtitle { font-size:.78rem; color:var(--text3); margin-left:auto; }
    .dhikr-counter-wrap { position:relative; display:flex; align-items:center; justify-content:center; margin:6px 0 16px; height:130px; }
    .dhikr-arc-svg { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); pointer-events:none; }
    .dhikr-arc-bg { fill:none; stroke:var(--surface3); stroke-width:3; stroke-linecap:round; }
    .dhikr-arc-fill { fill:none; stroke:var(--gold2); stroke-width:3; stroke-linecap:round; stroke-dasharray:283; stroke-dashoffset:283; transition:stroke-dashoffset .42s var(--ease); }
    .dhikr-btn { width:96px; height:96px; border-radius:50%; border:none; background:var(--raised); cursor:pointer; display:flex; align-items:center; justify-content:center; position:relative; transition:transform .18s var(--ease); outline:none; z-index:1; overflow:hidden; }
    .dhikr-btn:active { transform:scale(.93); }
    .dhikr-btn:focus-visible { outline:2px solid var(--ink); outline-offset:3px; }
    .dhikr-count { font-size:2.4rem; font-weight:200; color:var(--text); line-height:1; user-select:none; pointer-events:none; font-variant-numeric:tabular-nums; }
    .dhikr-count.bounce { animation:dhikrBounce .3s var(--ease); }
    @keyframes dhikrBounce { 0% { transform:scale(1); } 40% { transform:scale(1.12); } 100% { transform:scale(1); } }
    .dhikr-ripple { position:absolute; border-radius:50%; background:var(--gold-dim); pointer-events:none; transform:scale(0); animation:dhikrRipple .5s ease-out forwards; }
    @keyframes dhikrRipple { to { transform:scale(4); opacity:0; } }
    .dhikr-wave { position:absolute; top:50%; left:50%; width:96px; height:96px; border-radius:50%; border:1.5px solid var(--gold2); transform:translate(-50%,-50%) scale(1); opacity:0; pointer-events:none; animation:dhikrWave .6s ease-out forwards; }
    @keyframes dhikrWave { 0% { opacity:.6; } to { transform:translate(-50%,-50%) scale(1.9); opacity:0; } }
    .dhikr-info-row { display:flex; align-items:center; justify-content:space-between; margin-top:2px; gap:8px; }
    .dhikr-label { font-size:.78rem; color:var(--text2); }
    .dhikr-of33 { font-size:.85rem; font-weight:500; color:var(--text); font-variant-numeric:tabular-nums; }
    .dhikr-reset-btn { background:var(--raised); border:none; border-radius:14px; color:var(--text); font-size:.78rem; font-weight:500; padding:7px 12px; cursor:pointer; transition:var(--t); }
    .dhikr-reset-btn:active { transform:scale(.95); background:var(--surface2); }
    .dhikr-particle { position:absolute; width:5px; height:5px; border-radius:50%; pointer-events:none; animation:dhikrParticle .7s ease-out forwards; }
    @keyframes dhikrParticle { 0% { transform:translate(0,0) scale(1); opacity:1; } 100% { transform:translate(var(--px),var(--py)) scale(0); opacity:0; } }

    /* ── CÉLÉBRATION ── */
    .dhikr-celebration { position:fixed; inset:0; z-index:9990; display:flex; flex-direction:column; align-items:center; justify-content:center; pointer-events:none; opacity:0; transition:opacity .3s ease; }
    .dhikr-celebration.active { opacity:1; pointer-events:auto; }
    .dhikr-celebration-bg { position:absolute; inset:0; background:var(--scrim); -webkit-backdrop-filter:blur(18px); backdrop-filter:blur(18px); }
    .dhikr-celebration-logo { position:relative; z-index:1; width:220px; height:auto; object-fit:contain; animation:celebLogo 1s var(--ease); }
    @keyframes celebLogo { from { transform:scale(.92); opacity:0; } to { transform:none; opacity:1; } }
    .dhikr-celebration-text { position:relative; z-index:1; font-size:1.6rem; font-weight:300; color:var(--text); text-align:center; margin-top:24px; animation:celebSlide .5s var(--ease) .2s both; }
    .dhikr-celebration-sub { position:relative; z-index:1; font-size:.85rem; font-weight:500; color:var(--gold); text-align:center; margin-top:8px; animation:celebSlide .5s var(--ease) .35s both; }
    @keyframes celebSlide { from { transform:translateY(12px); opacity:0; } to { transform:none; opacity:1; } }
    .dhikr-confetti { position:fixed; pointer-events:none; animation:confettiFall var(--dur) ease-in var(--delay) forwards; z-index:9991; }
    @keyframes confettiFall { 0% { transform:translate(0,-20px) rotate(0deg); opacity:1; } 100% { transform:translate(var(--dx),110vh) rotate(var(--rot)); opacity:0; } }
  `;
  document.head.appendChild(style);
}

// ══════════════════════════════════════════════════════════════
//  HEADER — injecter logo WOD à la place du texte
// ══════════════════════════════════════════════════════════════
function patchHeader() {
  const hdLeft = document.querySelector('.hd-left');
  if (!hdLeft) return;


  const hdTitles = hdLeft.querySelector('.hd-titles');
  if (hdTitles && !document.getElementById('hd-wod-logo')) {
    const logoImg = document.createElement('img');
    logoImg.id = 'hd-wod-logo';
    logoImg.alt = 'WORLD OF DRIVER';
    logoImg.setAttribute('data-wod-logo', '1');
    logoImg.style.cssText = 'height:28px;width:auto;object-fit:contain;display:block;';
    const sub = hdTitles.querySelector('.hd-sub');
    hdTitles.insertBefore(logoImg, sub || hdTitles.firstChild);

    const nameSpan = hdTitles.querySelector('.hd-name');
    if (nameSpan) nameSpan.style.display = 'none';
  }

  // Patch notif center header
  const notifHd = document.querySelector('.notif-hd');
  if (notifHd && !document.getElementById('notif-wod-logo')) {
    const logo = document.createElement('img');
    logo.id = 'notif-wod-logo';
    logo.className = 'notif-hd-logo';
    logo.setAttribute('data-wod-logo', '1');
    logo.alt = 'WOD';
    notifHd.insertBefore(logo, notifHd.firstChild);
  }
}

// ══════════════════════════════════════════════════════════════
//  FAB — son au clic
// ══════════════════════════════════════════════════════════════
function hookFABSound() {
  const origToggle = window.toggleFAB;
  if (origToggle) {
    window.toggleFAB = function() {
      WOD_SOUND.fab();
      if (navigator.vibrate) navigator.vibrate([10, 15, 25]);
      origToggle.apply(this, arguments);
    };
  }
}

// ══════════════════════════════════════════════════════════════
//  SOUND HOOKS
// ══════════════════════════════════════════════════════════════
function hookSounds() {
  document.addEventListener('click', e => {
    if (e.target.closest('.btn-gold'))       { WOD_SOUND.success(); if(navigator.vibrate) navigator.vibrate([8,10,18]); }
    else if (e.target.closest('.fab-item'))   WOD_SOUND.click();
    else if (e.target.closest('.btn-ghost-sm')) WOD_SOUND.click();
    else if (e.target.closest('.btn-danger'))   WOD_SOUND.error();
    else if (e.target.closest('.dep-cat'))      WOD_SOUND.click();
    else if (e.target.closest('.poi-btn'))      WOD_SOUND.click();
    else if (e.target.closest('.theme-btn'))    WOD_SOUND.click();
    else if (e.target.closest('.acc-hd'))       WOD_SOUND.click();
    else if (e.target.closest('.modal-close'))  WOD_SOUND.click();
  }, true);

  const origToast = window.showToast;
  if (origToast) {
    window.showToast = function(msg) {
      origToast.apply(this, arguments);
      WOD_SOUND.success();
    };
  }
}

// ══════════════════════════════════════════════════════════════
//  SPLASH SOUND
// ══════════════════════════════════════════════════════════════
function hookSplashSound() {
  document.addEventListener('pointerdown', () => {
    try { new (window.AudioContext||window.webkitAudioContext)().resume(); } catch(e) {}
  }, { once: true });

  const origUnlock = window.unlockApp;
  if (origUnlock) {
    window.unlockApp = function() {
      WOD_SOUND.open();
      origUnlock.apply(this, arguments);
    };
  }
}

// ══════════════════════════════════════════════════════════════
//  ANIMATED COUNTERS
// ══════════════════════════════════════════════════════════════
function hookAnimatedCounters() {
  ['hero-net','m-brut','m-km','m-courses','dep-total','c-net'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    new MutationObserver(() => {
      el.classList.remove('counter-pop');
      void el.offsetWidth;
      el.classList.add('counter-pop');
    }).observe(el, { childList:true, subtree:true, characterData:true });
  });
}

// ══════════════════════════════════════════════════════════════
//  DHIKR COUNTER WIDGET
// ══════════════════════════════════════════════════════════════
const DHIKR = {
  count: 0,
  MAX: 33,
  celebrating: false,

  init() {
    this.count = parseInt(localStorage.getItem('wod_dhikr') || '0');
    this._injectWidget();
    this._injectCelebration();
    this._updateArc();
  },

  _injectWidget() {
    if (document.getElementById('dhikr-widget')) return;
    // Widget Dhikr injecté dans screen-muslim (par wod-muslim.js)
    const muslimScroll = document.querySelector('#screen-muslim .screen-scroll');
    if (!muslimScroll) {
      // Retry si le screen muslim n'est pas encore injecté
      setTimeout(() => this._injectWidget(), 500);
      return;
    }

    const widget = document.createElement('div');
    widget.id = 'dhikr-widget';
    widget.className = 'dhikr-card';
    widget.innerHTML = `
      <div class="dhikr-title-row">
        <div class="dhikr-icon">☽</div>
        <span class="dhikr-title">Dhikr</span>
        <span class="dhikr-subtitle">Compteur · 33</span>
      </div>
      <div class="dhikr-counter-wrap" id="dhikr-counter-wrap">
        <svg class="dhikr-arc-svg" width="130" height="130" viewBox="0 0 130 130">
          <circle class="dhikr-arc-bg"   cx="65" cy="65" r="45" transform="rotate(-90 65 65)"/>
          <circle class="dhikr-arc-fill" cx="65" cy="65" r="45" id="dhikr-arc-fill" transform="rotate(-90 65 65)"/>
        </svg>
        <button class="dhikr-btn" id="dhikr-btn" onclick="DHIKR.tap(event)" ontouchstart="">
          <span class="dhikr-count" id="dhikr-count">${this.count}</span>
        </button>
      </div>
      <div class="dhikr-info-row">
        <span class="dhikr-label">Toucher pour compter</span>
        <span class="dhikr-of33" id="dhikr-of33">${this.count} / 33</span>
        <button class="dhikr-reset-btn" onclick="DHIKR.reset()">Remise à zéro</button>
      </div>
    `;

    // Insérer le widget Dhikr en haut de l'onglet Muslim (après bismi)
    const bismi = muslimScroll.querySelector('.msl-bismi');
    if (bismi) bismi.insertAdjacentElement('afterend', widget);
    else muslimScroll.insertBefore(widget, muslimScroll.firstChild);
  },

  _injectCelebration() {
    if (document.getElementById('dhikr-celebration')) return;
    const div = document.createElement('div');
    div.id = 'dhikr-celebration';
    div.className = 'dhikr-celebration';
    div.innerHTML = `
      <div class="dhikr-celebration-bg"></div>
      <img class="dhikr-celebration-logo" id="dhikr-celebration-logo"
        data-wod-logo="1" alt="WOD" src="./wod-logo-text.png">
      <div class="dhikr-celebration-text">سُبْحَانَ ٱللَّٰهِ × 33</div>
      <div class="dhikr-celebration-sub">Mashallah · série complète</div>
    `;
    div.addEventListener('click', () => this._hideCelebration());
    document.body.appendChild(div);
    WOD_IMG.applyToAll();
  },

  tap(e) {
    if (this.celebrating) return;
    this.count++;
    if (navigator.vibrate) navigator.vibrate(12);
    WOD_SOUND.dhikr();

    const countEl = document.getElementById('dhikr-count');
    if (countEl) {
      countEl.textContent = this.count;
      countEl.classList.remove('bounce');
      void countEl.offsetWidth;
      countEl.classList.add('bounce');
    }
    const of33 = document.getElementById('dhikr-of33');
    if (of33) of33.textContent = `${this.count} / 33`;

    this._updateArc();
    this._spawnRipple(e);
    this._spawnParticles();
    this._spawnWave();
    localStorage.setItem('wod_dhikr', this.count);

    if (this.count >= this.MAX) setTimeout(() => this._celebrate(), 260);
  },

  _updateArc() {
    const arc = document.getElementById('dhikr-arc-fill');
    if (!arc) return;
    arc.style.strokeDashoffset = 283 - Math.min(this.count / this.MAX, 1) * 283;
  },

  _spawnRipple(e) {
    const btn = document.getElementById('dhikr-btn');
    if (!btn) return;
    const r = document.createElement('div');
    r.className = 'dhikr-ripple';
    const rect = btn.getBoundingClientRect();
    const t = e.touches?.[0] || e;
    const x = ((t.clientX||rect.left+rect.width/2) - rect.left) - 20;
    const y = ((t.clientY||rect.top+rect.height/2) - rect.top) - 20;
    r.style.cssText = `left:${x}px;top:${y}px;width:40px;height:40px;`;
    btn.appendChild(r);
    r.addEventListener('animationend', () => r.remove());
  },

  _spawnWave() {
    const wrap = document.getElementById('dhikr-counter-wrap');
    if (!wrap) return;
    const w = document.createElement('div');
    w.className = 'dhikr-wave';
    wrap.appendChild(w);
    w.addEventListener('animationend', () => w.remove());
  },

  _spawnParticles() {
    const wrap = document.getElementById('dhikr-counter-wrap');
    if (!wrap) return;
    const colors = ['#B8963F','#D4B866','#171A20','#8E9095','#E8D9AE'];
    for (let i = 0; i < 9; i++) {
      const p = document.createElement('div');
      p.className = 'dhikr-particle';
      const angle = (i / 9) * Math.PI * 2;
      const dist = 52 + Math.random() * 28;
      p.style.cssText = `left:calc(50% - 3px);top:calc(50% - 3px);
        background:${colors[i % colors.length]};
        --px:${Math.cos(angle)*dist}px;--py:${Math.sin(angle)*dist}px;
        animation-duration:${0.45+Math.random()*0.35}s;`;
      wrap.appendChild(p);
      p.addEventListener('animationend', () => p.remove());
    }
  },

  _celebrate() {
    this.celebrating = true;
    if (navigator.vibrate) navigator.vibrate([30,60,30,60,100]);
    WOD_SOUND.dhikrComplete();
    this._launchConfetti();
    const ov = document.getElementById('dhikr-celebration');
    if (ov) ov.classList.add('active');
    setTimeout(() => this._hideCelebration(), 3500);
  },

  _hideCelebration() {
    const ov = document.getElementById('dhikr-celebration');
    if (ov) ov.classList.remove('active');
    this.count = 0; this.celebrating = false;
    localStorage.setItem('wod_dhikr', '0');
    const c = document.getElementById('dhikr-count');
    if (c) c.textContent = '0';
    const o = document.getElementById('dhikr-of33');
    if (o) o.textContent = '0 / 33';
    this._updateArc();
    document.querySelectorAll('.dhikr-confetti').forEach(x => x.remove());
  },

  _launchConfetti() {
    const colors = ['#B8963F','#D4B866','#171A20','#8E9095','#E8D9AE','#8A6C22'];
    for (let i = 0; i < 52; i++) {
      setTimeout(() => {
        const c = document.createElement('div');
        c.className = 'dhikr-confetti';
        c.style.cssText = `
          left:${10+Math.random()*80}vw; top:0;
          width:${4+Math.random()*7}px; height:${4+Math.random()*7}px;
          background:${colors[i%colors.length]};
          border-radius:${Math.random()>.5?'50%':'2px'};
          opacity:${0.7+Math.random()*0.3};
          --dx:${(Math.random()-.5)*200}px;
          --rot:${Math.random()*720-360}deg;
          --dur:${1.4+Math.random()}s; --delay:0s;`;
        document.body.appendChild(c);
        c.addEventListener('animationend', () => c.remove());
      }, i * 38);
    }
  },

  reset() {
    this.count = 0;
    localStorage.setItem('wod_dhikr','0');
    if (navigator.vibrate) navigator.vibrate(18);
    WOD_SOUND.click();
    const c = document.getElementById('dhikr-count');
    if (c) c.textContent = '0';
    const o = document.getElementById('dhikr-of33');
    if (o) o.textContent = '0 / 33';
    this._updateArc();
  },
};
window.DHIKR = DHIKR;

// ══════════════════════════════════════════════════════════════
//  INIT PRINCIPAL
// ══════════════════════════════════════════════════════════════
async function initWODSignature() {
  injectSignatureStyles();
  patchHeader();
  hookSplashSound();
  hookFABSound();
  hookSounds();

  await WOD_IMG.applyToAll();

  // Dhikr — attendre que l'app soit visible ET que screen-muslim soit injecté
  const tryInitDhikr = () => {
    const appVisible = !document.getElementById('app')?.classList.contains('hidden');
    const muslimExists = !!document.getElementById('screen-muslim');

    if (appVisible && muslimExists) {
      setTimeout(() => { DHIKR.init(); WOD_IMG.applyToAll(); }, 200);
    } else if (!appVisible) {
      // Attendre que l'app soit visible
      const obs = new MutationObserver(() => {
        if (!document.getElementById('app')?.classList.contains('hidden')) {
          obs.disconnect();
          // screen-muslim peut ne pas encore exister → attendre encore
          const waitMuslim = setInterval(() => {
            if (document.getElementById('screen-muslim')) {
              clearInterval(waitMuslim);
              setTimeout(() => { DHIKR.init(); WOD_IMG.applyToAll(); }, 200);
            }
          }, 150);
          // Timeout sécurité 5s
          setTimeout(() => clearInterval(waitMuslim), 5000);
        }
      });
      const app = document.getElementById('app');
      if (app) obs.observe(app, { attributes:true, attributeFilter:['class'] });
    } else {
      // App visible mais screen-muslim pas encore là — attendre
      const waitMuslim = setInterval(() => {
        if (document.getElementById('screen-muslim')) {
          clearInterval(waitMuslim);
          setTimeout(() => { DHIKR.init(); WOD_IMG.applyToAll(); }, 200);
        }
      }, 150);
      setTimeout(() => clearInterval(waitMuslim), 5000);
    }
  };
  tryInitDhikr();

  setTimeout(hookAnimatedCounters, 2500);
  setTimeout(() => WOD_IMG.applyToAll(), 2000);
  setTimeout(() => WOD_IMG.applyToAll(), 5000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWODSignature);
} else {
  initWODSignature();
}
