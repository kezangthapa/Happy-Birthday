/* =====================================================
   1. CUSTOMIZE HERE: all personal text lives in CONFIG
   ===================================================== */
const CONFIG = {
  name: "Brother",
  from: "your sibling",
  age: 17,                          // shown in the hero; candles on the cake max out at 5
  heroLine: "Today is all about you. Thank you for being exactly who you are.",
  reminder: "the world is brighter because you're in it ♥",
  card: [                           // one paragraph per entry
    "Dear {name},",
    "Happy birthday. Growing up next to you has been one of the best parts of my life. You were my first friend and my loudest supporter, long before I knew how lucky I was.",
    "Thank you for the laughter, the arguments we forgot by dinner, and every time you showed up without being asked.",
    "You make the people around you feel safe and seen, and I hope you know how much that matters.",
    "I'm proud of you today and every day. Whatever this year brings, you'll never face it alone.",
    "Love always,<br>{from}"
  ],
  memories: [                       // photo: path to an image file in the img folder
    { year: "Hilltop",     title: "Always chasing the view",       text: "Add where this was taken and what made the day special.", photo: "img/photo1.jpg" },
    { year: "That grin",   title: "The smile I'd know anywhere",   text: "Add a memory of a time he made you laugh.",              photo: "img/photo2.jpg" },
    { year: "Night vibes", title: "Always up for the late ones",   text: "Add a late-night story only the two of you remember.",   photo: "img/photo3.jpg" },
    { year: "Peace out",   title: "Effortlessly cool",             text: "Add an inside joke or something he always says.",        photo: "img/photo4.jpg" },
    { year: "Ghost mode",  title: "Never a dull moment",           text: "Add the story behind this one. There's always one.",     photo: "img/photo5.jpg" }
  ]
};

const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fill = s => s.replace(/{name}/g, esc(CONFIG.name)).replace(/{from}/g, esc(CONFIG.from));

$('#heroName').textContent = CONFIG.name;
$('#heroSub').textContent = `Turning ${CONFIG.age} today`;
$('#heroLine').textContent = CONFIG.heroLine;
$('#reminder').textContent = CONFIG.reminder;
$('#coverName').textContent = CONFIG.name;
$('#footName').textContent = CONFIG.name;
$('#footFrom').textContent = CONFIG.from;
document.title = `Happy Birthday, ${CONFIG.name}!`;

/* ---------- Ransom-note title: each letter is a cut-out ---------- */
(function () {
  let i = 0;
  const word = w => [...w].map(ch => {
    const rot = ((i * 37) % 9) - 4, cls = 'l' + (i * 3 % 4); i++;
    return `<span class="rn ${cls}" style="transform:rotate(${rot}deg)" aria-hidden="true">${ch}</span>`;
  }).join('');
  $('#title').innerHTML = word('HAPPY') + '<br>' + word('BIRTHDAY');
})();

/* =====================================================
   2. CONFETTI (pink, burgundy, cream, gold)
   ===================================================== */
const cv = $('#confetti'), cx = cv.getContext('2d');
let parts = [], raf = null;
const COLORS = ['#7a1230', '#f4b6c4', '#fff1ea', '#e58aa0', '#c9a24a'];
const fit = () => { cv.width = innerWidth; cv.height = innerHeight; };
addEventListener('resize', fit); fit();
function burst(x = innerWidth / 2, y = innerHeight / 2, n = 110) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = 3 + Math.random() * 8;
    parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 5, s: 6 + Math.random() * 6, c: COLORS[i % 5], r: Math.random() * 6, vr: (Math.random() - .5) * .35, life: 170 });
  }
  go();
}
function rain(n = 70) {
  for (let i = 0; i < n; i++)
    parts.push({ x: Math.random() * cv.width, y: -20 - Math.random() * 300, vx: (Math.random() - .5) * 1.5, vy: 1.5 + Math.random() * 2.5, s: 6 + Math.random() * 5, c: COLORS[i % 5], r: Math.random() * 6, vr: (Math.random() - .5) * .25, life: 320 });
  go();
}
const go = () => { if (!raf) raf = requestAnimationFrame(tick); };
function tick() {
  cx.clearRect(0, 0, cv.width, cv.height);
  parts = parts.filter(p => p.life-- > 0 && p.y < cv.height + 30);
  for (const p of parts) {
    p.vy += .15; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); cx.restore();
  }
  raf = parts.length ? requestAnimationFrame(tick) : null;
}

/* =====================================================
   3. MUSIC: music-box "Happy Birthday" loop (Web Audio)
   ===================================================== */
const BEAT = .6;
const TUNE = [
  [392,.75],[392,.25],[440,1],[392,1],[523.25,1],[493.88,2],
  [392,.75],[392,.25],[440,1],[392,1],[587.33,1],[523.25,2],
  [392,.75],[392,.25],[783.99,1],[659.25,1],[523.25,1],[493.88,1],[440,1],
  [698.46,.75],[698.46,.25],[659.25,1],[523.25,1],[587.33,1],[523.25,2]
];
const CHORDS = [130.81, 98, 130.81, 87.31];
let ac, master, loopT, playing = false;
function note(f, t, d, type = 'sine', vol = .16) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .02);
  g.gain.exponentialRampToValueAtTime(.001, t + Math.max(d, .6));
  o.connect(g); g.connect(master); o.start(t); o.stop(t + Math.max(d, .6) + .1);
}
function playTune() {
  const t0 = ac.currentTime + .1; let t = t0;
  for (const [f, b] of TUNE) { note(f, t, b * BEAT); note(f * 2, t, b * BEAT, 'triangle', .035); t += b * BEAT; }
  CHORDS.forEach((c, i) => {
    const s = t0 + i * 6 * BEAT;
    note(c, s, 3 * BEAT, 'triangle', .13);
    note(i === 3 ? 130.81 : c, s + 3 * BEAT, 3 * BEAT, 'triangle', .13);
  });
  loopT = setTimeout(playTune, (24 * BEAT + 2.5) * 1000);
}
function musicOn() {
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain(); master.gain.value = .7; master.connect(ac.destination);
    ac.resume(); playTune(); playing = true; syncMusic();
  } catch (e) { playing = false; syncMusic(true); }
}
function musicOff() { clearTimeout(loopT); if (master) master.disconnect(); playing = false; syncMusic(); }
function syncMusic(failed) {
  const b = $('#musicBtn');
  b.textContent = failed ? '♪ Audio blocked. Tap to retry' : playing ? '♪ Music on' : '♪ Music off';
  b.setAttribute('aria-pressed', playing);
}
$('#musicBtn').onclick = () => playing ? musicOff() : musicOn();

/* =====================================================
   4. ENVELOPE INTRO
   ===================================================== */
$('#envBtn').onclick = e => {
  e.currentTarget.classList.add('open');
  const r = e.currentTarget.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, 120);
  musicOn();                                  // allowed: this is a user click
  setTimeout(() => { $('#intro').classList.add('gone'); rain(80); }, 1000);
};
$('#popBtn').onclick = e => { const r = e.target.getBoundingClientRect(); burst(r.left + r.width / 2, r.top, 130); };

/* =====================================================
   5. CAKE: tap candles to blow them out
   ===================================================== */
const candleBox = $('#candles');
function light() {
  const n = Math.min(Math.max(CONFIG.age, 1), 5);
  candleBox.innerHTML = Array.from({ length: n }, (_, i) => `<button class="candle" aria-label="Blow out candle ${i + 1}"></button>`).join('');
  $('#wishMsg').textContent = 'Make a wish, then tap each candle.';
  $('#relightBtn').classList.add('hidden');
}
candleBox.addEventListener('click', e => {
  const c = e.target.closest('.candle'); if (!c) return;
  c.classList.add('out');
  if ([...candleBox.children].every(k => k.classList.contains('out'))) {
    $('#wishMsg').textContent = 'May every wish come true ♥';
    $('#relightBtn').classList.remove('hidden');
    burst(innerWidth / 2, innerHeight / 2, 160); rain(60);
  }
});
$('#relightBtn').onclick = light;
light();

/* =====================================================
   6. GREETING CARD
   ===================================================== */
$('#inside').innerHTML = CONFIG.card.map((p, i) => `<p style="--i:${i}">${fill(p)}</p>`).join('');
$('#cover').onclick = () => { $('#gcard').classList.add('open'); burst(innerWidth / 2, innerHeight * .55, 70); };
$('#foldBtn').onclick = () => $('#gcard').classList.remove('open');

/* =====================================================
   7. MEMORIES: polaroids with sticky-note stories
   ===================================================== */
$('#timeline').innerHTML = CONFIG.memories.map((m, i) => {
  const tilt = i % 2 ? 2.5 : -2.5, tape = i % 2 ? 'dots' : 'gingham';
  return `<article class="rv" style="--r:${tilt}deg">
    <div class="pol"><div class="tape ${tape}"></div>
      <div class="ph">${m.photo ? `<img src="${esc(m.photo)}" alt="${esc(m.title)}">` : 'Add photo'}</div>
      <p class="cap">${esc(m.year)}</p></div>
    <div class="paper -mt-2 ml-auto mr-2 w-[78%] p-4 hand text-xl leading-snug" style="transform:rotate(${-tilt}deg)">
      <b class="text-2xl">${esc(m.title)}</b><br>${esc(m.text)}</div>
  </article>`;
}).join('');

/* =====================================================
   8. SCROLL REVEAL
   ===================================================== */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));
