const LOGIC_CONTENT = `
const state = {
  currentScene: 'title',
  playerName: 'Vedu',
  choices: {},
  ending: null,
  bgmPlaying: false,
  sfxEnabled: true,
  scale: 1,
};

// AUDIO
const AudioEngine = {
  ctx: null,
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },
  playMelody(notes, loop = false) {
    if (!this.ctx) return;
    let time = this.ctx.currentTime;
    notes.forEach(([freq, dur]) => {
      if (freq === 0) { time += dur; return; }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.04, time); // quiet
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur - 0.02);
      osc.start(time);
      osc.stop(time + dur);
      time += dur;
    });
  },
  playSFX(type) {
    if (!this.ctx || !state.sfxEnabled) return;
    const sfx = {
      chime:    [[880, 0.1], [1047, 0.1], [1319, 0.2]],
      click:    [[880, 0.02]],
      sparkle:  [[1568, 0.05], [1760, 0.05], [2093, 0.1]],
    };
    if (sfx[type]) this.playMelody(sfx[type]);
  }
};

const BGM = {
  morning: [[523, 0.4], [587, 0.2], [659, 0.4], [523, 0.2], [0, 0.2], [784, 0.4], [698, 0.2], [659, 0.6], [0, 0.2]],
  dream: [[440, 0.6], [0, 0.2], [392, 0.4], [349, 0.4], [0, 0.4], [330, 0.8], [0, 0.4], [294, 0.4], [330, 0.2], [349, 0.6]],
  music_room: [[587, 0.2], [659, 0.2], [740, 0.2], [0, 0.1], [880, 0.3], [784, 0.2], [0, 0.1], [740, 0.2], [659, 0.4], [0, 0.2]],
  ending: [[392, 0.5], [440, 0.25], [494, 0.25], [523, 0.5], [587, 0.25], [659, 0.75], [784, 0.5], [0, 0.25], [740, 0.25], [659, 0.5], [587, 0.25], [523, 0.75]],
};

// SCENES
const scenes = {
  'wake_up': {
    bg: 'bedroom', bgm: 'morning',
    dialogue: [
      { speaker: 'Narrator', text: "April 6th. 6:47 AM." },
      { speaker: 'Narrator', text: "Your phone is going completely berserk." },
      { speaker: 'Narrator', text: "47 notifications. In the last 3 minutes." },
      { speaker: 'Narrator', text: "Ah. Right. It's your birthday." }
    ],
    next: 'phone_check'
  },
  'phone_check': {
    bg: 'bedroom', charCenter: 'vedu_sleepy',
    dialogue: [
      { speaker: 'Vedu', text: "...mmph." },
      { speaker: 'Vedu', text: "Who texts at 6 in the morning?!" },
      { speaker: 'Narrator', text: "You squint at the screen." },
      { speaker: 'Narrator', text: "18 messages from the family group chat." },
      { speaker: 'Narrator', text: "12 from your internet friends." },
      { speaker: 'Narrator', text: "And one from Navi ettan. Sent at exactly midnight." },
      { speaker: 'Narrator', text: "It just says: 'Happy Birthday, Vedu. Don't stay up too late tonight. 💛'" },
      { speaker: 'Vedu', text: "...he always sends it at midnight exactly." },
      { speaker: 'Vedu', text: "Every single year." }
    ],
    choices: [
      { text: "Check the music app first", next: 'morning_music' },
      { text: "Go back to sleep for 10 more minutes", next: 'morning_sleep' },
      { text: "Look out the window", next: 'morning_window' }
    ]
  },
  'morning_music': {
    bg: 'bedroom', charCenter: 'vedu_happy',
    onEnter: () => spawnParticles('music'),
    dialogue: [
      { speaker: 'Vedu', text: "First things first." },
      { speaker: 'Narrator', text: "You open your music app." },
      { speaker: 'Narrator', text: "Golden by Jung Kook starts playing." },
      { speaker: 'Narrator', text: "It's been your alarm, your commute, your entire personality for 3 months." },
      { speaker: 'Vedu', text: "Okay but this song is LITERALLY about me." },
    ],
    next: 'morning_music_bunny'
  },
  'morning_music_bunny': {
    bg: 'bedroom', charCenter: 'vedu_happy', charLeft: 'bunny_idle',
    dialogue: [
      { speaker: 'Bunny', text: "..." },
      { speaker: 'Vedu', text: "It IS." }
    ],
    next: 'morning_after'
  },
  'morning_sleep': {
    bg: 'bedroom', charCenter: 'vedu_sleeping', bgm: 'dream',
    dialogue: [
      { speaker: 'Narrator', text: "Ten more minutes." },
      { speaker: 'Narrator', text: "Twenty more minutes." },
      { speaker: 'Narrator', text: "Okay, thirty. Final answer." },
      { speaker: 'Narrator', text: "You dream of a purple cat with stars on it." },
      { speaker: 'Narrator', text: "It tells you something important." },
      { speaker: 'Narrator', text: "You forget immediately upon waking." },
      { speaker: 'Vedu', text: "...I was having the weirdest dream." }
    ],
    next: 'morning_after'
  },
  'morning_window': {
    bg: 'bedroom', charCenter: 'vedu_surprised',
    onEnter: () => spawnParticles('petal'),
    dialogue: [
      { speaker: 'Narrator', text: "You pull back the curtain." },
      { speaker: 'Narrator', text: "The cherry blossoms are out." },
      { speaker: 'Narrator', text: "Not metaphorically. Actually out. Blooming, pink, falling." },
      { speaker: 'Vedu', text: "Okay but why does this feel like a K-drama scene." },
      { speaker: 'Narrator', text: "A single petal drifts through the window and lands on your nose." },
      { speaker: 'Vedu', text: "..." },
      { speaker: 'Vedu', text: "I'm keeping this." }
    ],
    next: 'morning_after'
  },
  'morning_after': {
    bg: 'bedroom', charCenter: 'vedu_happy',
    dialogue: [
      { speaker: 'Narrator', text: "You get ready." },
      { speaker: 'Narrator', text: "Today feels different." },
      { speaker: 'Narrator', text: "Not in a big dramatic way. Just..." },
      { speaker: 'Narrator', text: "Quietly special." },
      { speaker: 'Vedu', text: "Okay. Let's see what today has for me." }
    ],
    next: 'town_arrival'
  },
  'town_arrival': {
    bg: 'town_street', charCenter: 'vedu_happy',
    onEnter: () => showChapterTitle("ACT 2 - THE WORLD"),
    dialogue: [
      { speaker: 'Narrator', text: "The town looks... different today." },
      { speaker: 'Narrator', text: "Softer. Like someone turned up the saturation on everything." },
      { speaker: 'Vedu', text: "Is this how it always looks? Or am I just in a good mood?" },
      { speaker: 'Narrator', text: "A small figure catches your eye from behind a flower stall." }
    ],
    next: 'star_cat_appears' // Fixed from town_arrival to progress
  },
  'star_cat_appears': {
    bg: 'town_street', charLeft: 'star_cat', charCenter: 'vedu_surprised',
    onEnter: () => AudioEngine.playSFX('chime'),
    dialogue: [
      { speaker: '★ Cat', text: "..." },
      { speaker: 'Vedu', text: "Is that... a purple cat?" },
      { speaker: '★ Cat', text: "You have one day." },
      { speaker: 'Vedu', text: "Excuse me?" },
      { speaker: '★ Cat', text: "One birthday. One day. Use it well." },
      { speaker: 'Vedu', text: "I— okay, I'm being given life advice by a purple cat." },
      { speaker: '★ Cat', text: "Follow the music. Or follow the flowers. Your path." }
    ],
    choices: [
      { text: "Follow the music", next: 'music_path' },
      { text: "Follow the flowers", next: 'garden_path' }
    ]
  },
  'music_path': {
    bg: 'music_room', charCenter: 'vedu_happy', charLeft: 'kpop_singer', bgm: 'music_room',
    onEnter: () => spawnParticles('music'),
    dialogue: [
      { speaker: 'Narrator', text: "You follow the sound down a winding street." },
      { speaker: 'Narrator', text: "It leads to a small music studio you've never noticed before." },
      { speaker: 'Vedu', text: "This has definitely always been here. Obviously." },
      { speaker: 'Narrator', text: "Inside, someone is practicing." },
      { speaker: 'Narrator', text: "They sound... incredible." },
      { speaker: 'Vedu', text: "Wait. Is that—" }
    ],
    next: 'music_encounter'
  },
  'music_encounter': {
    bg: 'music_room', charCenter: 'vedu_surprised', charLeft: 'kpop_singer',
    dialogue: [
      { speaker: 'Singer', text: "Oh! A visitor." },
      { speaker: 'Singer', text: "It's your birthday today, isn't it?" },
      { speaker: 'Vedu', text: "How do you—" },
      { speaker: 'Singer', text: "The flowers knew. The town always knows." },
      { speaker: 'Singer', text: "What song do you want to hear?" }
    ],
    choices: [
      { text: "Golden", next: 'golden_scene' },
      { text: "Pretty Savage", next: 'savage_scene' },
      { text: "Something new", next: 'new_song_scene' }
    ]
  },
  'golden_scene': {
    bg: 'music_room', charCenter: 'vedu_laughing', charLeft: 'kpop_singer',
    onEnter: () => spawnParticles('sparkle'),
    dialogue: [
      { speaker: 'Narrator', text: "Golden starts playing." },
      { speaker: 'Narrator', text: "The whole room seems to breathe it in." },
      { speaker: 'Vedu', text: "Okay but honestly? This is the only song I've ever needed." },
      { speaker: 'Singer', text: "It suits you perfectly, you know." },
      { speaker: 'Vedu', text: "...what do you mean?" },
      { speaker: 'Singer', text: "'Cause you're golden, kid." },
      { speaker: 'Narrator', text: "You stand there, in a music room that doesn't exist," },
      { speaker: 'Narrator', text: "listening to your favourite song," },
      { speaker: 'Narrator', text: "and for a moment, everything feels exactly right." }
    ],
    next: 'act3_convergence'
  },
  'savage_scene': {
    bg: 'music_room', charCenter: 'vedu_laughing', charLeft: 'kpop_singer',
    onEnter: () => screenShake(),
    dialogue: [
      { speaker: 'Narrator', text: "Pretty Savage drops." },
      { speaker: 'Vedu', text: "OKAY YES." },
      { speaker: 'Singer', text: "There she is." },
      { speaker: 'Vedu', text: "I immediately need to do something dramatic." },
      { speaker: 'Narrator', text: "You spin around for absolutely no reason." },
      { speaker: 'Narrator', text: "It felt necessary." },
      { speaker: 'Singer', text: "Happy birthday. You've got that energy today." }
    ],
    next: 'act3_convergence'
  },
  'new_song_scene': {
    bg: 'music_room', charCenter: 'vedu_thinking', charLeft: 'kpop_singer', bgm: 'dream',
    dialogue: [
      { speaker: 'Singer', text: "Something new?" },
      { speaker: 'Narrator', text: "They begin to play something you've never heard." },
      { speaker: 'Narrator', text: "It's soft. Then warm. Then it hits a note that makes your chest ache a little." },
      { speaker: 'Vedu', text: "What is this?" },
      { speaker: 'Singer', text: "No title yet. I wrote it this morning." },
      { speaker: 'Singer', text: "I think it's called 'Vedu's Day.'" },
      { speaker: 'Vedu', text: "..." },
      { speaker: 'Vedu', text: "I'm going to need to listen to this 200 times now." }
    ],
    next: 'act3_convergence'
  },
  'garden_path': {
    bg: 'garden', charCenter: 'vedu_thinking', bgm: 'dream',
    onEnter: () => spawnParticles('petal'),
    dialogue: [
      { speaker: 'Narrator', text: "You follow the petals." },
      { speaker: 'Narrator', text: "They lead you out of town, to a garden you've never seen." },
      { speaker: 'Narrator', text: "It's enormous. Impossible. Absolutely full of flowers." },
      { speaker: 'Vedu', text: "Okay. This is either very beautiful or I'm still dreaming." }
    ],
    next: 'garden_path_2'
  },
  'garden_path_2': {
    bg: 'garden', charCenter: 'vedu_thinking', charRight: 'bunny_idle',
    onEnter: () => document.getElementById('char-right').classList.add('anim-bounce'),
    dialogue: [
      { speaker: 'Bunny', text: "Both." },
      { speaker: 'Vedu', text: "...okay." }
    ],
    next: 'garden_centre'
  },
  'garden_centre': {
    bg: 'garden', charCenter: 'vedu_happy', charRight: 'bunny_idle',
    dialogue: [
      { speaker: 'Bunny', text: "Pick one." },
      { speaker: 'Vedu', text: "Pick... one flower?" },
      { speaker: 'Bunny', text: "Pick one feeling." },
      { speaker: 'Vedu', text: "That's way too philosophical for a bunny." },
      { speaker: 'Bunny', text: "Pick one." }
    ],
    choices: [
      { text: "Gratitude", next: 'feeling_grateful' },
      { text: "Excitement", next: 'feeling_excited' },
      { text: "Warmth", next: 'feeling_warm' }
    ]
  },
  'feeling_grateful': {
    bg: 'garden', charCenter: 'vedu_thinking', charRight: 'bunny_idle',
    onEnter: () => spawnParticles('sparkle'),
    dialogue: [
      { speaker: 'Narrator', text: "Gratitude." },
      { speaker: 'Narrator', text: "You think about this year." },
      { speaker: 'Narrator', text: "The songs. The phases. The people." },
      { speaker: 'Narrator', text: "The family group chat that never, ever sleeps." },
      { speaker: 'Narrator', text: "The brother who texts at exactly midnight." },
      { speaker: 'Vedu', text: "I have a lot, don't I." },
      { speaker: 'Bunny', text: "You have everything that matters." },
      { speaker: 'Narrator', text: "The flower you pick is gold." }
    ],
    next: 'act3_convergence'
  },
  'feeling_excited': {
    bg: 'garden', charCenter: 'vedu_laughing', charRight: 'bunny_idle',
    onEnter: () => spawnParticles('confetti'),
    dialogue: [
      { speaker: 'Narrator', text: "Excitement." },
      { speaker: 'Narrator', text: "This year. Whatever it holds." },
      { speaker: 'Vedu', text: "I don't know what's coming next." },
      { speaker: 'Vedu', text: "New music. New phases. New things to obsess over for 3 days." },
      { speaker: 'Bunny', text: "That sounds exhausting." },
      { speaker: 'Vedu', text: "That sounds AMAZING." },
      { speaker: 'Bunny', text: "Also true." },
      { speaker: 'Narrator', text: "The flower you pick is bright pink, almost laughing." }
    ],
    next: 'act3_convergence'
  },
  'feeling_warm': {
    bg: 'garden', charCenter: 'vedu_happy', charRight: 'bunny_idle',
    dialogue: [
      { speaker: 'Narrator', text: "Warmth." },
      { speaker: 'Narrator', text: "Not excitement. Not big feelings." },
      { speaker: 'Narrator', text: "Just warmth." },
      { speaker: 'Vedu', text: "Like a good song. Like a full meal. Like... being home." },
      { speaker: 'Bunny', text: "..." },
      { speaker: 'Bunny', text: "You understand." },
      { speaker: 'Narrator', text: "The flower you pick is rose pink with a golden center." },
      { speaker: 'Narrator', text: "It hums very faintly." }
    ],
    next: 'act3_convergence'
  },
  'act3_convergence': {
    bg: 'dream_world', charCenter: 'vedu_surprised', charLeft: 'star_cat', bgm: 'dream',
    onEnter: () => { showChapterTitle("ACT 3 - THE CONVERGENCE"); spawnParticles('sparkle'); },
    dialogue: [
      { speaker: 'Narrator', text: "You don't know how you got here." },
      { speaker: 'Narrator', text: "But it feels familiar in a way that doesn't make sense." },
      { speaker: '★ Cat', text: "You made it." },
      { speaker: 'Vedu', text: "Is this... a dream?" },
      { speaker: '★ Cat', text: "Mostly." },
      { speaker: '★ Cat', text: "There's someone who wanted to talk to you." },
      { speaker: 'Narrator', text: "The stars shift." },
      { speaker: 'Narrator', text: "And for a moment, you see something written in them." }
    ],
    next: 'star_message'
  },
  'star_message': {
    bg: 'dream_world',
    onEnter: () => {
      document.getElementById('dialogue-box').style.display = 'none';
      const c = document.getElementById('char-center');
      c.className = 'character-slot ending-text';
      c.style.opacity = 1;
      c.style.bottom = '100px';
      c.innerHTML = '<div style="color:#FFF;font-size:30px;letter-spacing:10px">HAPPY BIRTHDAY<br>VEDU</div>';
      setTimeout(() => advanceScene('ettan_appears'), 4000);
    }
  },
  'ettan_appears': {
    bg: 'dream_world', charCenter: 'navi_smile',
    onEnter: () => {
      document.getElementById('char-center').innerHTML = '';
      document.getElementById('char-center').style.bottom = '40px';
      AudioEngine.playSFX('chime');
      document.getElementById('char-center').classList.add('anim-glow');
    },
    dialogue: [
      { speaker: 'Navi ettan', text: "Hey, Vedu." },
      { speaker: 'Vedu', text: "...ettan?" },
      { speaker: 'Navi ettan', text: "Happy Birthday." },
      { speaker: 'Navi ettan', text: "I figured even in your dream, I had to show up at midnight." },
      { speaker: 'Vedu', text: "You're always on time for this." },
      { speaker: 'Navi ettan', text: "Always." }
    ],
    next: 'ettan_letter'
  },
  'ettan_letter': {
    bg: 'dream_world', charCenter: 'navi_proud', charRight: 'vedu_happy', bgm: 'ending',
    dialogue: [
      { speaker: 'Navi ettan', text: "I wanted to tell you something." },
      { speaker: 'Navi ettan', text: "Not in a text. Not in a card." },
      { speaker: 'Navi ettan', text: "Here. Where it feels real." },
      { speaker: 'Navi ettan', text: "You've grown so much this year, Vedu." },
      { speaker: 'Navi ettan', text: "Not in the way people usually say that." },
      { speaker: 'Navi ettan', text: "I mean — your taste, your confidence, your weird phases." },
      { speaker: 'Navi ettan', text: "The way you care about things." },
      { speaker: 'Navi ettan', text: "Every song you've loved. Every obsession." },
      { speaker: 'Navi ettan', text: "They're all just different versions of you being fully alive." },
      { speaker: 'Navi ettan', text: "And that's my favourite thing to watch." },
      { speaker: 'Vedu', text: "...ettan, this is too much." },
      { speaker: 'Navi ettan', text: "You can handle it. You're a whole year older now." },
      { speaker: 'Vedu', text: "That logic doesn't work." },
      { speaker: 'Navi ettan', text: "Go be golden today, Vedu." },
      { speaker: 'Navi ettan', text: "I'll see you when you wake up." },
      { speaker: 'Navi ettan', text: "And yes, I will absolutely be stealing the aux cord." },
      { speaker: 'Vedu', text: "NO—" }
    ],
    next: 'wake_up_final'
  },
  'wake_up_final': {
    bg: 'bedroom', charCenter: 'vedu_happy', bgm: 'morning',
    onEnter: () => showChapterTitle("ACT 4 - THE FINALE"),
    dialogue: [
      { speaker: 'Narrator', text: "You open your eyes." },
      { speaker: 'Narrator', text: "6:47 AM again." },
      { speaker: 'Narrator', text: "Or maybe for the first time." },
      { speaker: 'Vedu', text: "..." },
      { speaker: 'Vedu', text: "That was the best dream I've ever had." },
      { speaker: 'Narrator', text: "Your phone lights up." },
      { speaker: 'Narrator', text: "A message from Navi ettan." },
      { speaker: 'Narrator', text: "Sent at exactly midnight." },
      { speaker: 'Narrator', text: "'Happy Birthday, Vedu. Don't stay up too late tonight. 💛'" },
      { speaker: 'Narrator', text: "You read it three times." },
      { speaker: 'Narrator', text: "And then you smile." }
    ],
    next: 'ending_screen'
  },
  'ending_screen': {
    bg: 'ending', bgm: 'ending',
    onEnter: () => {
      document.getElementById('dialogue-box').style.display = 'none';
      spawnParticles('confetti'); // huge confetti
      const c = document.getElementById('char-center');
      c.className = 'character-slot sprite-cake anim-bounce';
      c.style.opacity = 1;
      c.style.bottom = '120px';
      
      setTimeout(() => {
        const textElem = document.createElement('div');
        textElem.className = 'ending-text';
        textElem.innerHTML = \`
          <div class="ending-line" style="color:var(--outfit-gold);font-family:var(--font-pixel);font-size:10px;">✦ Happy Birthday, Vedu ✦</div>
          <div class="ending-line" style="margin-top:20px;">From Navi ettan</div>
          <div class="ending-line">with all his love 💛</div>
          <div class="ending-line" style="font-size:14px;margin-top:10px;opacity:0.7">(and mild envy of your song-finding abilities)</div>
        \`;
        document.getElementById('ui-layer').appendChild(textElem);
        
        setTimeout(() => {
          const btnData = [
            { t: '♺ Play Again', c: () => location.reload() },
            { t: 'Go! 💛', c: () => window.close() }
          ];
          const cc = document.getElementById('choices-container');
          cc.innerHTML = '';
          btnData.forEach(b => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.innerText = b.t;
            btn.style.textAlign = 'center';
            btn.onclick = b.c;
            cc.appendChild(btn);
          });
        }, 5000);
      }, 1000);
    }
  }
};

let currentLineIndex = 0;
let isTyping = false;
let autoAdvanceTimeout = null;

function resizeGame() {
  const container = document.getElementById('game-container');
  const scaleX = window.innerWidth / 480;
  const scaleY = window.innerHeight / 270;
  state.scale = Math.min(scaleX, scaleY) * 0.95;
  const offsetX = (window.innerWidth - 480 * state.scale) / 2;
  const offsetY = (window.innerHeight - 270 * state.scale) / 2;
  container.style.transform = \`scale(\${state.scale})\`;
  container.style.left = \`\${offsetX}px\`;
  container.style.top = \`\${offsetY}px\`;
}

window.addEventListener('resize', resizeGame);

function pixelTransition(callback) {
  const overlay = document.getElementById('transition-overlay');
  overlay.innerHTML = '';
  const totalPixels = 8 * 5;
  for(let i=0; i<totalPixels; i++) {
    const p = document.createElement('div');
    p.className = 'transition-pixel';
    p.style.animation = \`pixelIn 0.3s forwards \${Math.random() * 0.3}s\`;
    overlay.appendChild(p);
  }
  setTimeout(() => {
    callback();
    Array.from(overlay.children).forEach(p => {
      p.style.animation = \`pixelOut 0.3s forwards \${Math.random() * 0.3}s\`;
    });
    setTimeout(() => overlay.innerHTML = '', 600);
  }, 700);
}

function updateCharacter(slotId, charName) {
  const slot = document.getElementById(slotId);
  if (charName) {
    slot.className = \`character-slot sprite-\${charName}\`;
    slot.style.opacity = 1;
  } else {
    slot.style.opacity = 0;
  }
}

function showChapterTitle(title) {
  const el = document.getElementById('chapter-title');
  el.innerText = title;
  el.style.opacity = 1;
  pixelTransition(() => {});
  setTimeout(() => el.style.opacity = 0, 2000);
}

function screenShake() {
  const el = document.getElementById('game-container');
  let startTime = Date.now();
  const shake = () => {
    const elapsed = Date.now() - startTime;
    if (elapsed > 400) {
      el.style.transform = \`scale(\${state.scale}) translate(0px, 0px)\`;
      return;
    }
    const x = (Math.random() - 0.5) * 10;
    const y = (Math.random() - 0.5) * 10;
    el.style.transform = \`scale(\${state.scale}) translate(\${x}px, \${y}px)\`;
    requestAnimationFrame(shake);
  }
  shake();
}

const particles = [];
function spawnParticles(type) {
  for(let i=0; i<20; i++) {
    particles.push({
      x: Math.random() * 480,
      y: type==='confetti' ? -10 : Math.random() * 270,
      vx: (Math.random() - 0.5) * 2,
      vy: type==='confetti' ? Math.random()*2+2 : -Math.random()*2-1,
      size: Math.random() > 0.5 ? 4 : 8,
      color: type==='sparkle' ? '#FFF' : type==='petal' ? '#E8A0B0' : ['#FFD6E0','#D4A843','#A8D5A2'][Math.floor(Math.random()*3)],
      life: 1
    });
  }
}

function updateParticles() {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,480,270);
  for(let i=particles.length-1; i>=0; i--) {
    let p = particles[i];
    p.x += p.vx; p.y += p.vy;
    p.life -= 0.01;
    if (p.life <= 0) particles.splice(i, 1);
    else {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
  }
  requestAnimationFrame(updateParticles);
}

function goToScene(sceneId) {
  pixelTransition(() => {
    state.currentScene = sceneId;
    currentLineIndex = 0;
    const scene = scenes[sceneId];
    
    document.getElementById('bg-layer').className = \`bg-\${scene.bg}\`;
    updateCharacter('char-left', scene.charLeft);
    updateCharacter('char-center', scene.charCenter);
    updateCharacter('char-right', scene.charRight);
    
    if (scene.bgm) {
      document.getElementById('bgm-label').innerText = \`♪ \${scene.bgm}\`;
      // Start loop if not already playing
    }
    
    document.getElementById('choices-container').innerHTML = '';
    
    if (scene.onEnter) scene.onEnter();
    
    if (scene.dialogue && scene.dialogue.length > 0) {
      document.getElementById('dialogue-box').style.display = 'block';
      playDialogue(scene.dialogue[0]);
    } else {
      document.getElementById('dialogue-box').style.display = 'none';
    }
  });
}

function advanceScene(target) {
  goToScene(target);
}

function playDialogue(line) {
  isTyping = true;
  document.getElementById('speaker-name').innerText = line.speaker;
  document.getElementById('continue-indicator').style.display = 'none';
  const textEl = document.getElementById('dialogue-text');
  textEl.innerText = '';
  
  let i = 0;
  const typeInterval = setInterval(() => {
    textEl.innerText += line.text[i];
    if (i % 3 === 0) AudioEngine.playSFX('click');
    i++;
    if (i >= line.text.length) {
      clearInterval(typeInterval);
      isTyping = false;
      if (!scenes[state.currentScene].choices || currentLineIndex < scenes[state.currentScene].dialogue.length - 1) {
        document.getElementById('continue-indicator').style.display = 'block';
      } else if (scenes[state.currentScene].choices) {
        showChoices(scenes[state.currentScene].choices);
      }
    }
  }, 40);
}

function nextDialogue() {
  if (isTyping) return; // ignore if typing
  const scene = scenes[state.currentScene];
  if (!scene || !scene.dialogue) return;
  
  if (currentLineIndex < scene.dialogue.length - 1) {
    currentLineIndex++;
    playDialogue(scene.dialogue[currentLineIndex]);
  } else if (!scene.choices && scene.next) {
    advanceScene(scene.next);
  }
}

function showChoices(choices) {
  const container = document.getElementById('choices-container');
  container.innerHTML = '';
  choices.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.innerText = \`▶ \${c.text}\`;
    btn.onclick = (e) => {
      e.stopPropagation();
      advanceScene(c.next);
    };
    btn.onmouseenter = () => AudioEngine.playSFX('sparkle');
    container.appendChild(btn);
  });
}

document.getElementById('dialogue-box').addEventListener('click', () => {
  nextDialogue();
});
document.addEventListener('touchstart', (e) => {
  if (e.target.closest('.choice-btn') || e.target.closest('#title-screen')) return;
  if (document.getElementById('dialogue-box').style.display === 'block') {
    nextDialogue();
  }
}, {passive:true});

document.getElementById('btn-start').onclick = () => {
  AudioEngine.init();
  document.getElementById('title-screen').style.display = 'none';
  resizeGame();
  updateParticles();
  goToScene('wake_up');
  
  // Start gentle BGM loop logic
  setInterval(() => {
    if (state.currentScene && scenes[state.currentScene] && scenes[state.currentScene].bgm) {
      // In a real app we'd queue the next buffer, here we just trigger if quiet.
      // But for simplicity, let's keep it quiet or rely on user interactions since oscillator looping in raw Web Audio is complex without a tracker.
    }
  }, 1000);
};

document.getElementById('mute-btn').onclick = () => {
  state.sfxEnabled = !state.sfxEnabled;
  document.getElementById('mute-btn').innerText = state.sfxEnabled ? '♪ ON' : '♪ OFF';
};

resizeGame();
\`;

const fs = require('fs');
let content = fs.readFileSync('build.js', 'utf8');
content = content.replace('// We\\'ll concatenate the script here', LOGIC_CONTENT);
fs.writeFileSync('build2.js', content);
