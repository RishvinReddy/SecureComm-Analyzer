// ===== AOS INIT =====
AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 60 });

// ===== NAVBAR SCROLL =====
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
});

// ===== PARTICLE CANVAS =====
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56,189,248,${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 120; i++) particles.push(new Particle());

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(56,189,248,${0.06 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(loop);
  }
  loop();
})();

// ===== COUNTER ANIMATION =====
function animateCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.target);
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current);
      if (current >= target) clearInterval(timer);
    }, 20);
  });
}
const heroObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) { animateCounters(); heroObserver.disconnect(); }
}, { threshold: 0.3 });
heroObserver.observe(document.getElementById('hero'));

// ===== METRIC BAR ANIMATION =====
const barObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.metric-bar').forEach(bar => {
        const w = bar.dataset.width;
        setTimeout(() => { bar.style.width = w + '%'; }, 200);
      });
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
const metricsSection = document.getElementById('metrics');
if (metricsSection) barObserver.observe(metricsSection);

// ===== LIVE CHAT DEMO =====
const chatMessages = document.getElementById('chat-messages');
const demoInput = document.getElementById('demo-input');
const sendBtn = document.getElementById('send-btn');
const encryptLog = document.getElementById('encrypt-log');
const securityBadge = document.getElementById('security-badge');

const BOT_REPLIES = [
  "Message received and verified ✓",
  "Decryption successful. Reply secured.",
  "Handshake confirmed. TLS 1.3 active.",
  "Packet integrity check: PASSED",
  "Authentication token valid. Responding.",
];

function addMessage(text, type) {
  const msg = document.createElement('div');
  msg.className = `msg ${type}`;
  msg.textContent = text;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addLog(text, type = 'info') {
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  const ts = new Date().toLocaleTimeString('en', { hour12: false });
  entry.textContent = `[${ts}] ${text}`;
  encryptLog.innerHTML = '';
  encryptLog.appendChild(entry);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function sendMessage() {
  const text = demoInput.value.trim();
  if (!text) return;
  demoInput.value = '';
  sendBtn.disabled = true;

  addMessage(text, 'sent');
  securityBadge.textContent = '⏳ Encrypting...';
  securityBadge.className = 'ep-badge';

  addLog('Initiating TLS 1.3 handshake...', 'info');
  await sleep(500);

  addLog('Generating AES-256-GCM session key...', 'info');
  await sleep(500);

  const fake = btoa(text).substring(0, 32) + '==';
  addLog(`Encrypted payload: ${fake}`, 'success');
  await sleep(400);

  addLog('Signing with RSA-4096 private key...', 'info');
  await sleep(400);

  addLog('Packet transmitted securely ✓', 'success');
  securityBadge.textContent = '🔒 Secured';
  securityBadge.className = 'ep-badge active';

  addMessage('🔒 Encrypted & transmitted', 'system');
  await sleep(800);

  const reply = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
  addLog(`Decrypting response from Bob...`, 'info');
  await sleep(500);
  addLog('Integrity verified: HMAC match ✓', 'success');
  addMessage(reply, 'received');

  sendBtn.disabled = false;
}

sendBtn.addEventListener('click', sendMessage);
demoInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

// Seed initial messages
setTimeout(() => {
  addMessage('Connection established 🔐', 'system');
  addMessage('Hey, is our channel secure?', 'received');
  addMessage('Yes — TLS 1.3 with AES-256. All messages are E2E encrypted.', 'sent');
}, 600);

// ===== ENCRYPTION VISUALIZER =====
const encInput = document.getElementById('enc-input');
const encBtn = document.getElementById('enc-btn');
const encStatus = document.getElementById('enc-status');

function fakeB64(str) { return btoa(str.substring(0, 8)).replace(/=/g, '') + '...'; }
function fakeHex(str) { return Array.from(str.substring(0, 6)).map(c => c.charCodeAt(0).toString(16).padStart(2,'0')).join('') + '...'; }
function fakeHash(str) {
  let h = 0;
  for (const c of str) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
  return Math.abs(h).toString(16).padStart(8,'0') + 'a3f...';
}

async function animateStage(id, text, delay) {
  await new Promise(r => setTimeout(r, delay));
  const el = document.getElementById(id);
  el.textContent = text;
  el.classList.add('animating');
  setTimeout(() => el.classList.remove('animating'), 600);
}

async function runEncFlow() {
  const text = encInput.value.trim() || 'Hello!';
  encBtn.disabled = true;
  encStatus.textContent = '⏳ Processing encryption pipeline...';
  encStatus.className = 'enc-status running';

  document.getElementById('cipher-text').textContent = '...';
  document.getElementById('hash-text').textContent = '...';
  document.getElementById('tls-text').textContent = '...';

  await animateStage('plain-text', text, 0);
  await animateStage('key-text', 'K=' + Math.random().toString(36).substring(2, 10).toUpperCase(), 600);
  await animateStage('cipher-text', fakeB64(text) + fakeHex(text), 1200);
  await animateStage('hash-text', fakeHash(text), 1900);
  await animateStage('tls-text', '[TLSv1.3] enc:' + fakeB64(text), 2500);

  encStatus.textContent = '✅ Message encrypted and packaged for secure transmission';
  encStatus.className = 'enc-status done';
  encBtn.disabled = false;
}

encBtn.addEventListener('click', runEncFlow);

// ===== PRELOADER =====
window.addEventListener('load', () => {
  const pl = document.getElementById('preloader');
  setTimeout(() => { pl.classList.add('hidden'); }, 800);
});

// ===== SCROLL PROGRESS + BACK TO TOP =====
const progressBar = document.getElementById('scroll-progress');
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  const doc = document.documentElement;
  const pct = (window.scrollY / (doc.scrollHeight - doc.clientHeight)) * 100;
  progressBar.style.width = pct + '%';
  backToTop.classList.toggle('visible', window.scrollY > 400);
});
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const mobileDrawer = document.getElementById('mobile-drawer');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileDrawer.classList.toggle('open');
});
mobileDrawer.querySelectorAll('.drawer-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileDrawer.classList.remove('open');
  });
});

// ===== TERMINAL SIMULATOR =====
const TERMINAL_CMDS = {
  help: [
    { t: 'cmd', v: '$ help' },
    { t: 'ok',  v: 'Available commands:' },
    { t: 'info',v: '  scan        — Run a port scan simulation' },
    { t: 'info',v: '  encrypt     — Demonstrate GnuPG encryption' },
    { t: 'info',v: '  snort       — Show Snort IDS rule match' },
    { t: 'info',v: '  wireshark   — Capture sample packet dump' },
    { t: 'info',v: '  status      — Show system security status' },
    { t: 'info',v: '  clear       — Clear terminal output' },
    { t: 'ok',  v: 'Type any command above and press Run ▶' },
  ],
  scan: [
    { t: 'cmd',  v: '$ nmap -sV -T4 192.168.1.0/24' },
    { t: 'info', v: 'Starting Nmap 7.93 ( https://nmap.org )' },
    { t: 'info', v: 'Scanning 256 hosts [65535 ports]...' },
    { t: 'warn', v: 'Host 192.168.1.5 — PORT 22/tcp  OPEN  ssh' },
    { t: 'warn', v: 'Host 192.168.1.5 — PORT 80/tcp  OPEN  http' },
    { t: 'err',  v: 'Host 192.168.1.8 — PORT 4444/tcp OPEN  suspicious!' },
    { t: 'ok',   v: 'Nmap done: 256 IP addresses (12 hosts up) scanned in 4.82s' },
    { t: 'ok',   v: '⚠ Alert: 1 suspicious port detected → flagged for review' },
  ],
  encrypt: [
    { t: 'cmd',  v: '$ gpg --encrypt --recipient alice@secure.com message.txt' },
    { t: 'info', v: 'Reading key from keyring...' },
    { t: 'info', v: 'Applying AES-256-GCM cipher...' },
    { t: 'ok',   v: 'pub  4096R/A1B2C3D4 [trust: full]' },
    { t: 'info', v: 'Encrypted payload: 4a6f686e2053656375726521...' },
    { t: 'ok',   v: '✓ Output: message.txt.gpg (2.1 KB)' },
    { t: 'ok',   v: '✓ Encryption complete — original file untouched' },
  ],
  snort: [
    { t: 'cmd',  v: '$ snort -c /etc/snort/snort.conf -A console' },
    { t: 'info', v: 'Initializing Snort v3.0.0... Rules loaded: 3247' },
    { t: 'ok',   v: 'Listening on eth0...' },
    { t: 'err',  v: '[!!] ALERT: SYN flood detected from 203.x.x.12' },
    { t: 'err',  v: '[!!] ALERT: SQL injection attempt on port 3306' },
    { t: 'warn', v: '[**] Priority 2: ICMP ping sweep 10.0.0.0/8' },
    { t: 'ok',   v: '✓ All alerts logged to /var/log/snort/alert.log' },
  ],
  wireshark: [
    { t: 'cmd',  v: '$ tshark -i eth0 -c 5 -Y "http"' },
    { t: 'info', v: 'Capturing on eth0...' },
    { t: 'info', v: '  1  0.000 192.168.1.2 → 142.250.80.46  GET /index.html HTTP/1.1' },
    { t: 'err',  v: '  2  0.031 142.250.80.46 → 192.168.1.2  [UNENCRYPTED] 200 OK' },
    { t: 'warn', v: '  3  0.045 [INSECURE] Credentials visible in plain HTTP!' },
    { t: 'ok',   v: '  4  1.102 TLS handshake completed — channel now encrypted' },
    { t: 'ok',   v: '5 packets captured. 1 vulnerability flagged.' },
  ],
  status: [
    { t: 'cmd',  v: '$ ./securecomm --status' },
    { t: 'ok',   v: '══════════════════════════════' },
    { t: 'ok',   v: ' SecureComm-Analyzer v1.0.0 ' },
    { t: 'ok',   v: '══════════════════════════════' },
    { t: 'info', v: ' [✓] TLS 1.3       ACTIVE' },
    { t: 'info', v: ' [✓] AES-256-GCM   ACTIVE' },
    { t: 'info', v: ' [✓] Snort IDS     RUNNING' },
    { t: 'info', v: ' [✓] GnuPG Keys    LOADED' },
    { t: 'info', v: ' [✓] Packet Log    RECORDING' },
    { t: 'ok',   v: ' Security Score: 9.5 / 10 ✓' },
  ],
};

const tInput = document.getElementById('t-input');
const tRun = document.getElementById('t-run');
const tOutput = document.getElementById('t-output');
const termBody = document.getElementById('terminal-body');

function termPrint(lines) {
  tOutput.innerHTML = '';
  lines.forEach((line, i) => {
    setTimeout(() => {
      const d = document.createElement('div');
      d.className = `t-out-line ${line.t}`;
      d.textContent = line.v;
      tOutput.appendChild(d);
      termBody.scrollTop = termBody.scrollHeight;
    }, i * 90);
  });
}

function runTerminal(cmd) {
  const key = cmd.trim().toLowerCase();
  if (key === 'clear') { tOutput.innerHTML = ''; tInput.value = ''; return; }
  const result = TERMINAL_CMDS[key];
  if (result) termPrint(result);
  else termPrint([
    { t: 'err', v: `bash: ${cmd}: command not found` },
    { t: 'info',v: 'Type "help" to see available commands.' },
  ]);
  tInput.value = '';
}

tRun.addEventListener('click', () => { if (tInput.value.trim()) runTerminal(tInput.value); });
tInput.addEventListener('keydown', e => { if (e.key === 'Enter' && tInput.value.trim()) runTerminal(tInput.value); });
document.querySelectorAll('.hint-tag').forEach(tag => {
  tag.addEventListener('click', () => { tInput.value = tag.dataset.cmd; runTerminal(tag.dataset.cmd); });
});

// Auto-run help on load
setTimeout(() => termPrint(TERMINAL_CMDS.help), 1200);

// ===== LIVE THREAT MONITOR =====
const THREAT_EVENTS = [
  { type: 'crit', msg: 'SYN flood attack from 185.220.x.x — 4800 pkt/s' },
  { type: 'warn', msg: 'Port scan detected: 192.168.1.44 → 1-65535' },
  { type: 'block',msg: 'SQL injection attempt blocked — URI: /login?id=1 OR 1=1' },
  { type: 'warn', msg: 'Unusual DNS query: malware-c2.ru (blocked)' },
  { type: 'crit', msg: 'Brute-force login: 312 failed attempts on SSH port 22' },
  { type: 'block',msg: 'Phishing URL intercepted: secure-bank-login.xyz' },
  { type: 'warn', msg: 'ARP spoofing detected on LAN segment 10.0.0.0/24' },
  { type: 'block',msg: 'XSS payload in HTTP header — request dropped' },
  { type: 'crit', msg: 'Ransomware signature match: CryptoLocker variant detected' },
  { type: 'block',msg: 'Unauthorized API key usage — rate limit enforced' },
  { type: 'warn', msg: 'ICMP ping sweep: 254 hosts probed in 0.3s' },
  { type: 'block',msg: 'Malicious payload in SMTP attachment — quarantined' },
];

const feed = document.getElementById('threat-feed');
const tsBlocked = document.getElementById('ts-blocked');
const tsWarned = document.getElementById('ts-warned');
const tsCritical = document.getElementById('ts-critical');
const toggleBtn = document.getElementById('threat-toggle');
const clearBtn = document.getElementById('threat-clear');

let blocked = 0, warned = 0, critical = 0, threatRunning = true;
let threatInterval;

function addThreatEvent() {
  const ev = THREAT_EVENTS[Math.floor(Math.random() * THREAT_EVENTS.length)];
  const ts = new Date().toLocaleTimeString('en', { hour12: false });
  const div = document.createElement('div');
  div.className = `threat-event ${ev.type}`;
  div.innerHTML = `<span class="te-ts">[${ts}]</span><span class="te-msg">${ev.type === 'block' ? '🛡 BLOCKED' : ev.type === 'warn' ? '⚠ WARNING' : '🔴 CRITICAL'} — ${ev.msg}</span>`;
  feed.appendChild(div);
  feed.scrollTop = feed.scrollHeight;
  if (feed.children.length > 30) feed.removeChild(feed.firstChild);
  if (ev.type === 'block') tsBlocked.textContent = ++blocked;
  else if (ev.type === 'warn') tsWarned.textContent = ++warned;
  else tsCritical.textContent = ++critical;
}

function startThreat() {
  threatInterval = setInterval(addThreatEvent, 1800);
}

// Start automatically when section visible
const threatObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && threatRunning && !threatInterval) startThreat();
  if (!entries[0].isIntersecting) { clearInterval(threatInterval); threatInterval = null; }
}, { threshold: 0.2 });
const threatSection = document.getElementById('threat');
if (threatSection) threatObserver.observe(threatSection);

toggleBtn.addEventListener('click', () => {
  threatRunning = !threatRunning;
  if (threatRunning) { startThreat(); toggleBtn.textContent = '⏸ Pause'; toggleBtn.classList.add('active'); }
  else { clearInterval(threatInterval); threatInterval = null; toggleBtn.textContent = '▶ Resume'; toggleBtn.classList.remove('active'); }
});
clearBtn.addEventListener('click', () => {
  feed.innerHTML = '';
  blocked = 0; warned = 0; critical = 0;
  tsBlocked.textContent = '0'; tsWarned.textContent = '0'; tsCritical.textContent = '0';
});

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-q').addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ===== TYPEWRITER CYCLING TEXT =====
(function initTypewriter() {
  const el = document.getElementById('tw-phrase');
  if (!el) return;
  const phrases = ['real-time encryption','intrusion detection','packet analysis','threat mitigation','TLS 1.3 security','AES-256 ciphering','Snort IDS monitoring','secure protocols'];
  let pi = 0, ci = 0, deleting = false;
  function tick() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) { deleting = true; setTimeout(tick, 1800); return; }
      setTimeout(tick, 60);
    } else {
      el.textContent = phrase.slice(0, --ci);
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(tick, 400); return; }
      setTimeout(tick, 35);
    }
  }
  setTimeout(tick, 1200);
})();

// ===== CURSOR GLOW =====
(function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;
  window.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
})();

// ===== MOUSE PARALLAX ON HERO PARTICLES =====
(function initParallax() {
  const hero = document.getElementById('hero');
  if (!hero) return;
  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width  - 0.5;
    const my = (e.clientY - rect.top)  / rect.height - 0.5;
    const canvas = document.getElementById('particle-canvas');
    if (canvas) canvas.style.transform = `translate(${mx * 18}px, ${my * 12}px)`;
  });
  hero.addEventListener('mouseleave', () => {
    const canvas = document.getElementById('particle-canvas');
    if (canvas) canvas.style.transform = 'translate(0,0)';
  });
})();

// ===== 3D CARD TILT =====
(function initTilt() {
  const cards = document.querySelectorAll('.feature-card, .tech-card, .score-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(600px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

// ===== TOAST NOTIFICATION SYSTEM =====
const TOAST_DATA = [
  { type:'success', icon:'🛡️', title:'Threat Blocked',     msg:'SQL injection attempt from 91.x.x.12 was neutralized.' },
  { type:'danger',  icon:'🔴', title:'Critical Alert',     msg:'Brute-force SSH detected — 400 attempts in 60s.' },
  { type:'warn',    icon:'⚠️', title:'Suspicious Traffic', msg:'Unusual DNS query flagged: malware-c2.ru' },
  { type:'success', icon:'🔒', title:'Encryption Active',  msg:'AES-256-GCM session key refreshed successfully.' },
  { type:'info',    icon:'📡', title:'Packet Captured',    msg:'Wireshark captured 1,024 packets for analysis.' },
  { type:'danger',  icon:'🚨', title:'Port Scan Detected', msg:'NMAP scan from 203.x.x.5 — ports 1-65535.' },
  { type:'success', icon:'✅', title:'IDS Rule Matched',   msg:'Snort Rule #2001219 triggered — payload blocked.' },
  { type:'warn',    icon:'🎣', title:'Phishing Attempt',   msg:'Phishing URL intercepted: secure-bank-login.xyz' },
];
const toastStack = document.getElementById('toast-stack');
function spawnToast() {
  if (!toastStack) return;
  const data = TOAST_DATA[Math.floor(Math.random() * TOAST_DATA.length)];
  const div = document.createElement('div');
  div.className = `toast ${data.type}`;
  div.innerHTML = `<div class="toast-icon">${data.icon}</div><div class="toast-body"><div class="toast-title">${data.title}</div><div class="toast-msg">${data.msg}</div></div>`;
  toastStack.appendChild(div);
  setTimeout(() => {
    div.classList.add('removing');
    setTimeout(() => div.remove(), 400);
  }, 4000);
}
setTimeout(spawnToast, 3000);
setInterval(spawnToast, () => 6000 + Math.random() * 5000);
setInterval(spawnToast, 8000);

// ===== GLITCH DATA-TEXT ATTRIBUTE =====
(function setGlitchAttr() {
  const h1 = document.querySelector('#hero h1');
  if (h1) h1.setAttribute('data-text', h1.textContent);
})();

// ===== NETWORK TOPOLOGY CANVAS =====
(function initTopology() {
  const canvas = document.getElementById('topology-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const NODES = [
    { label:'User', icon:'👤', color:'#38bdf8' },
    { label:'TCP/IP', icon:'🌐', color:'#a78bfa' },
    { label:'TLS/SSL', icon:'🔒', color:'#10b981' },
    { label:'Monitor', icon:'📡', color:'#38bdf8' },
    { label:'Snort IDS', icon:'🚨', color:'#f59e0b' },
    { label:'Response', icon:'🛡️', color:'#10b981' },
  ];

  const packets = [];
  let frame = 0;

  function getNodePos(i, total) {
    const W = canvas.width, H = canvas.height;
    const cols = Math.min(3, total);
    const rows = Math.ceil(total / cols);
    const col = i % cols, row = Math.floor(i / cols);
    const px = (W / (cols + 1)) * (col + 1);
    const py = (H / (rows + 1)) * (row + 1);
    return { x: px, y: py };
  }

  function spawnPacket() {
    const fromIdx = Math.floor(Math.random() * (NODES.length - 1));
    const toIdx = fromIdx + 1;
    const fromPos = getNodePos(fromIdx, NODES.length);
    const toPos   = getNodePos(toIdx,   NODES.length);
    const isTheat = Math.random() < 0.18;
    packets.push({ fx: fromPos.x, fy: fromPos.y, tx: toPos.x, ty: toPos.y, t: 0, speed: 0.008 + Math.random() * 0.006, threat: isTheat, color: isTheat ? '#ef4444' : (Math.random() < 0.5 ? '#38bdf8' : '#a78bfa') });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const W = canvas.width, H = canvas.height;

    // Draw edges
    for (let i = 0; i < NODES.length - 1; i++) {
      const a = getNodePos(i, NODES.length), b = getNodePos(i + 1, NODES.length);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = 'rgba(56,189,248,0.12)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 8]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Also draw cross-links for visual richness
    [[0,2],[1,3],[2,4],[3,5]].forEach(([a,b]) => {
      const pa = getNodePos(a, NODES.length), pb = getNodePos(b, NODES.length);
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y);
      ctx.strokeStyle = 'rgba(167,139,250,0.06)'; ctx.lineWidth = 1; ctx.stroke();
    });

    // Draw packets
    packets.forEach(p => {
      const x = p.fx + (p.tx - p.fx) * p.t;
      const y = p.fy + (p.ty - p.fy) * p.t;
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 14; ctx.shadowColor = p.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw nodes
    NODES.forEach((node, i) => {
      const pos = getNodePos(i, NODES.length);
      // Outer ring
      const pulse = Math.sin(frame * 0.04 + i * 1.2) * 6;
      ctx.beginPath(); ctx.arc(pos.x, pos.y, 28 + pulse, 0, Math.PI * 2);
      ctx.strokeStyle = node.color + '30'; ctx.lineWidth = 2; ctx.stroke();
      // Node circle
      ctx.beginPath(); ctx.arc(pos.x, pos.y, 24, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(pos.x, pos.y, 4, pos.x, pos.y, 24);
      grad.addColorStop(0, node.color + '40'); grad.addColorStop(1, node.color + '10');
      ctx.fillStyle = grad; ctx.fill();
      ctx.strokeStyle = node.color + '80'; ctx.lineWidth = 2; ctx.stroke();
      // Icon text
      ctx.font = '18px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(node.icon, pos.x, pos.y - 1);
      // Label
      ctx.font = '600 11px Inter, sans-serif'; ctx.fillStyle = '#e2e8f0';
      ctx.fillText(node.label, pos.x, pos.y + 40);
    });

    // Advance packets
    for (let i = packets.length - 1; i >= 0; i--) {
      packets[i].t += packets[i].speed;
      if (packets[i].t >= 1) packets.splice(i, 1);
    }

    frame++;
    if (frame % 60 === 0) spawnPacket();
    requestAnimationFrame(draw);
  }

  // Initial packets
  for (let i = 0; i < 3; i++) setTimeout(spawnPacket, i * 800);
  draw();
})();

// ===== MATRIX HEX RAIN =====
(function initMatrixRain() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const CHARS = '0123456789ABCDEF①②③④⑤⑥⑦⑧⑨⑩∑∆Ω≡≠∞αβγδεζ★●◆▲✦';
  let W, H, cols, drops;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    const colW = 18;
    cols = Math.ceil(W / colW);
    drops = new Array(cols).fill(1).map(() => Math.random() * H);
  }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.fillStyle = 'rgba(2,8,18,0.12)';
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < cols; i++) {
      const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
      const intensity = Math.random();
      if (intensity > 0.85) ctx.fillStyle = '#fff';
      else if (intensity > 0.5) ctx.fillStyle = '#38bdf8';
      else ctx.fillStyle = '#10b981';
      ctx.font = '14px JetBrains Mono, monospace';
      ctx.fillText(ch, i * 18, drops[i]);
      if (drops[i] > H && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 16;
    }
  }

  // Only run when section visible
  let matrixInterval = null;
  const matrixObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) matrixInterval = matrixInterval || setInterval(draw, 50);
    else { clearInterval(matrixInterval); matrixInterval = null; }
  }, { threshold: 0.1 });
  const ms = document.getElementById('matrix-section');
  if (ms) matrixObs.observe(ms);

  // Animated counters
  let byteCount = 0, packetCount = 0;
  const mBytes = document.getElementById('m-bytes');
  const mPackets = document.getElementById('m-packets');
  setInterval(() => {
    byteCount   += Math.floor(Math.random() * 800 + 400);
    packetCount += Math.floor(Math.random() * 30 + 10);
    if (mBytes)   mBytes.textContent   = byteCount.toLocaleString();
    if (mPackets) mPackets.textContent = packetCount.toLocaleString();
  }, 800);
})();
