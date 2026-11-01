const root = document.documentElement;
const nav = document.getElementById('nav');
const menuBtn = document.querySelector('.menu-btn');
const themeBtn = document.querySelector('.theme-btn');

/* Footer year */
document.getElementById('year').textContent = new Date().getFullYear();

/* Mobile menu */
menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});
nav.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
});

/* Theme toggle (remembers the choice) */
function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  themeBtn.setAttribute('aria-checked', theme === 'dark');
}
let saved = null;
try { saved = localStorage.getItem('theme'); } catch (e) {}
applyTheme(saved || 'light');

themeBtn.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  const prev = root.getAttribute('data-theme');
  const change = () => {
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    themeToast(next, prev);
  };
  themeBtn.classList.add('squish');
  setTimeout(() => themeBtn.classList.remove('squish'), 450);

  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || calm) { change(); return; }

  /* The new theme spreads out from the switch like a circle */
  const r = themeBtn.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const transition = document.startViewTransition(change);
  transition.ready.then(() => {
    root.animate(
      { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'] },
      { duration: 650, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
    );
  });
});

/* Highlight the nav link for the section on screen */
const links = document.querySelectorAll('nav a');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
document.querySelectorAll('main section').forEach((s) => observer.observe(s));

const MY_EMAIL = 'charlydomingo281@gmail.com';

/* Scroll progress bar and back-to-top button */
const progress = document.querySelector('.progress');
const toTop = document.querySelector('.to-top');
function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
  toTop.hidden = window.scrollY < 600;
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* Typing effect in the hero: change these roles */
const roles = ['Web developer', 'UI UX DESIGNER'];
const typed = document.getElementById('typed');
if (!typed) {
  /* no typing line in the hero */
} else if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  typed.textContent = roles[0];
} else {
  let r = 0, c = 0, deleting = false;
  (function tick() {
    const word = roles[r];
    c += deleting ? -1 : 1;
    typed.textContent = word.slice(0, c);
    let wait = deleting ? 40 : 90;
    if (!deleting && c === word.length) { deleting = true; wait = 1400; }
    else if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; wait = 300; }
    setTimeout(tick, wait);
  })();
}

/* Reveal sections as they scroll into view */
root.classList.add('js');
const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('in'); obs.unobserve(entry.target); }
  });
}, { threshold: 0.15 });
document.querySelectorAll('main section:not(.hero) > :not(h2):not(.deco)').forEach((el) => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* Toast (snackbar): message, optional icon, sub text and action button */
const toast = document.querySelector('.toast');
let toastTimer;
function showToast(message, opts) {
  const { icon = '', sub = '', action = null, duration = 2600 } = opts || {};
  toast.classList.remove('show');
  toast.textContent = '';
  toast.style.setProperty('--dur', duration + 'ms');

  if (icon) {
    const ico = document.createElement('span');
    ico.className = 'toast-ico';
    ico.innerHTML = icon;
    toast.appendChild(ico);
  }
  const text = document.createElement('span');
  text.className = 'toast-text';
  const strong = document.createElement('strong');
  strong.textContent = message;
  text.appendChild(strong);
  if (sub) {
    const small = document.createElement('small');
    small.textContent = sub;
    text.appendChild(small);
  }
  toast.appendChild(text);

  if (action) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toast-action';
    btn.textContent = action.label;
    btn.addEventListener('click', () => {
      clearTimeout(toastTimer);
      toast.classList.remove('show');
      action.onClick();
    });
    toast.appendChild(btn);
  }
  const bar = document.createElement('i');
  bar.className = 'toast-bar';
  toast.appendChild(bar);

  void toast.offsetWidth; /* restart the animations */
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

/* Snackbar for the mode switch: icon, message and an Undo button */
const ICON_SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
const ICON_MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
function themeToast(mode, prev) {
  const dark = mode === 'dark';
  showToast(dark ? 'Dark mode on' : 'Light mode on', {
    icon: dark ? ICON_MOON : ICON_SUN,
    sub: dark ? 'Easier on the eyes at night' : 'Bright and clear for daytime',
    duration: 3500,
    action: prev && prev !== mode ? {
      label: 'Undo',
      onClick: () => {
        applyTheme(prev);
        try { localStorage.setItem('theme', prev); } catch (e) {}
        showToast(prev === 'dark' ? 'Back to dark mode' : 'Back to light mode', { icon: prev === 'dark' ? ICON_MOON : ICON_SUN });
      }
    } : null
  });
}

/* Copy email button */
document.querySelector('.copy-btn').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(MY_EMAIL);
    showToast('Email copied');
  } catch (e) {
    showToast('Copy failed. Email: ' + MY_EMAIL);
  }
});

/* Project filters: buttons are built from the tags on your projects */
const filterBar = document.querySelector('.filters');
const projectCards = [...document.querySelector('.projects').children];
const tagsOf = (card) => [...card.querySelectorAll('.tags li')].map((t) => t.textContent);
const allTags = [...new Set(projectCards.flatMap(tagsOf))];
['All', ...allTags].forEach((name, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = name;
  b.setAttribute('aria-pressed', i === 0);
  b.addEventListener('click', () => {
    filterBar.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b));
    projectCards.forEach((card) => { card.hidden = name !== 'All' && !tagsOf(card).includes(name); });
  });
  filterBar.appendChild(b);
});
filterBar.remove(); /* projects are shown one at a time with the Next button, so no filter bar */

/* Count-up numbers in About */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion) {
  document.querySelectorAll('.stats strong').forEach((el) => {
    const target = parseInt(el.textContent, 10);
    el.textContent = '0';
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      (function step(now) {
        const t = Math.min((now - start) / 1000, 1);
        el.textContent = Math.round(target * t);
        if (t < 1) requestAnimationFrame(step);
      })(start);
    }, { threshold: 0.5 });
    io.observe(el);
  });
}

try { localStorage.removeItem('accent'); } catch (e) {}

/* Skills strip: repeat the items so it loops without a gap */
const track = document.querySelector('.marquee-track');
[...track.children].forEach((el) => {
  const copy = el.cloneNode(true);
  copy.classList.add('clone');
  track.appendChild(copy);
});

/* Light that follows the mouse on project cards */
projectCards.forEach((card) => {
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

/* Ripple effect when a button is pressed */
document.addEventListener('pointerdown', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn || btn.classList.contains('loading')) return;
  const rect = btn.getBoundingClientRect();
  const dot = document.createElement('span');
  dot.className = 'ripple';
  dot.style.left = (e.clientX - rect.left - 20) + 'px';
  dot.style.top = (e.clientY - rect.top - 20) + 'px';
  btn.appendChild(dot);
  dot.addEventListener('animationend', () => dot.remove());
});

/* Headline: letters rise in one by one */
const heroTitle = document.querySelector('.hero h1');
if (heroTitle) {
  const text = heroTitle.textContent;
  let n = 0;
  heroTitle.setAttribute('aria-label', text);
  heroTitle.textContent = '';
  const greet = document.createElement('span');
  greet.className = 'greet';
  greet.setAttribute('aria-hidden', 'true');
  heroTitle.appendChild(greet);
  text.split(' ').forEach((w, wi, all) => {
    const word = document.createElement('span');
    word.className = 'word';
    word.setAttribute('aria-hidden', 'true');
    [...w].forEach((ch) => {
      const s = document.createElement('span');
      s.className = ch === '.' ? 'ch dot' : 'ch';
      s.textContent = ch;
      s.style.animationDelay = (n++ * 45) + 'ms';
      word.appendChild(s);
    });
    if (wi < all.length - 1) { greet.appendChild(word); greet.appendChild(document.createTextNode(' ')); }
    else heroTitle.appendChild(word);
  });
}

/* Mouse effects (mouse users only): tilting photo and magnetic hero buttons */
if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
  const hero = document.querySelector('.hero');
  const avatar = document.querySelector('.hero-photo');
  const clamp = (v) => Math.max(-1, Math.min(1, v));
  hero.addEventListener('pointermove', (e) => {
    const r = avatar.getBoundingClientRect();
    const x = clamp((e.clientX - (r.left + r.width / 2)) / r.width);
    const y = clamp((e.clientY - (r.top + r.height / 2)) / r.height);
    avatar.style.transform = 'perspective(500px) rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 8) + 'deg)';
  });
  hero.addEventListener('pointerleave', () => { avatar.style.transform = ''; });

  document.querySelectorAll('.actions .btn').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.2) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3) + 'px)';
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });
}

/* Floating nav bar: stronger shadow after scrolling */
const siteHeader = document.querySelector('.site-header');
const markScrolled = () => siteHeader.classList.toggle('scrolled', window.scrollY > 10);
window.addEventListener('scroll', markScrolled, { passive: true });
markScrolled();

/* Navigation: sliding highlight that follows the mouse and the current section */
const navPill = nav.querySelector('.nav-pill');
function placePill(link) {
  if (!link || getComputedStyle(navPill).display === 'none') return;
  navPill.style.width = link.offsetWidth + 'px';
  navPill.style.height = link.offsetHeight + 'px';
  navPill.style.transform = 'translate(' + link.offsetLeft + 'px,' + link.offsetTop + 'px)';
  navPill.style.opacity = 1;
}
function resetPill() {
  const current = nav.querySelector('a.active');
  if (current) placePill(current);
  else navPill.style.opacity = 0;
}
links.forEach((a) => {
  a.addEventListener('pointerenter', () => placePill(a));
  a.addEventListener('focus', () => placePill(a));
});
nav.addEventListener('pointerleave', resetPill);
nav.addEventListener('focusout', resetPill);
window.addEventListener('resize', resetPill);
window.addEventListener('load', resetPill);
new MutationObserver(resetPill).observe(nav, { subtree: true, attributes: true, attributeFilter: ['class'] });


/* Navigation: shows the name of the section you are reading */
const crumb = document.querySelector('.crumb');
function updateCrumb() {
  const current = nav.querySelector('a.active');
  const label = current ? current.textContent : '';
  if (crumb.textContent === label) return;
  crumb.textContent = label;
  crumb.classList.remove('swap');
  void crumb.offsetWidth;
  crumb.classList.add('swap');
}
new MutationObserver(updateCrumb).observe(nav, { subtree: true, attributes: true, attributeFilter: ['class'] });



/* About: photo tilts toward the mouse (mouse users only) */
const aboutHead = document.querySelector('.about-head');
const aboutAvatar = document.querySelector('.avatar.sm');
if (aboutHead && aboutAvatar && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
  const limit = (v) => Math.max(-1, Math.min(1, v));
  aboutHead.addEventListener('pointermove', (e) => {
    const r = aboutAvatar.getBoundingClientRect();
    const x = limit((e.clientX - (r.left + r.width / 2)) / (r.width * 2));
    const y = limit((e.clientY - (r.top + r.height / 2)) / (r.height * 2));
    aboutAvatar.style.transform = 'perspective(500px) rotateY(' + (x * 16) + 'deg) rotateX(' + (-y * 16) + 'deg)';
  });
  aboutHead.addEventListener('pointerleave', () => { aboutAvatar.style.transform = ''; });
}

/* About: soft light follows the mouse across the section */
const aboutSection = document.getElementById('about');
aboutSection.addEventListener('pointermove', (e) => {
  const r = aboutSection.getBoundingClientRect();
  aboutSection.style.setProperty('--gx', (e.clientX - r.left) + 'px');
  aboutSection.style.setProperty('--gy', (e.clientY - r.top) + 'px');
});

/* About: use the same photo as the home section inside the round frame */
const heroPhoto = document.querySelector('.hero-photo img');
const aboutCircle = document.querySelector('.avatar.sm');
function copyPhotoToAbout() {
  if (!heroPhoto || !aboutCircle || aboutCircle.querySelector('.avatar-crop')) return;
  const crop = document.createElement('span');
  crop.className = 'avatar-crop';
  const img = document.createElement('img');
  img.src = heroPhoto.dataset.avatar || heroPhoto.currentSrc || heroPhoto.src;
  img.alt = '';
  crop.appendChild(img);
  aboutCircle.appendChild(crop);
}
if (heroPhoto) {
  if (heroPhoto.complete && heroPhoto.naturalWidth > 0) copyPhotoToAbout();
  else heroPhoto.addEventListener('load', copyPhotoToAbout, { once: true });
}

/* Skills cards: light follows the mouse */
document.querySelectorAll('.cap-card').forEach((card) => {
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

/* Loading screen: fills a progress line, then reveals the page once everything has loaded */
(function () {
  const loader = document.querySelector('.loader');
  if (!loader) return;
  const bar = loader.querySelector('.loader-bar i');
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MIN = calm ? 300 : 1400;   /* shortest time the screen stays up */
  const MAX = 5000;                /* never get stuck if something loads slowly */
  const start = performance.now();
  let pageLoaded = document.readyState === 'complete';
  let finished = false;

  window.scrollTo(0, 0);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.addEventListener('load', () => { pageLoaded = true; });

  function finish() {
    if (finished) return;
    finished = true;
    bar.style.transform = 'scaleX(1)';
    setTimeout(() => {
      loader.classList.add('done');
      document.body.classList.remove('is-loading');
      setTimeout(() => loader.remove(), 900);
    }, 250);
  }

  function tick(now) {
    if (finished) return;
    const t = now - start;
    /* Eases toward 90% while waiting, then completes once loaded and MIN has passed */
    const target = pageLoaded && t >= MIN ? 100 : Math.min(90, (t / MIN) * 90);
    const shown = Math.round(target);
    bar.style.transform = 'scaleX(' + (shown / 100) + ')';
    if (shown >= 100 || t >= MAX) finish();
    else requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* Buttons: spotlight follows the mouse */
document.addEventListener('pointermove', (e) => {
  const btn = e.target.closest && e.target.closest('.btn');
  if (!btn) return;
  const r = btn.getBoundingClientRect();
  btn.style.setProperty('--bx', (e.clientX - r.left) + 'px');
  btn.style.setProperty('--by', (e.clientY - r.top) + 'px');
}, { passive: true });

/* About: card spotlight, live local time, copy email */
document.querySelectorAll('.ab-card').forEach((card, i) => {
  card.style.setProperty('--i', i);
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

(function () {
  const card = document.querySelector('.ab-time');
  if (!card) return;
  const TZ = 'Asia/Manila';
  function tickClock() {
    const now = new Date();
    document.getElementById('ab-clock').textContent = now.toLocaleTimeString('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true });
    document.getElementById('ab-date').textContent = now.toLocaleDateString('en-US', { timeZone: TZ, weekday: 'long', month: 'long', day: 'numeric' });
    const h = parseInt(now.toLocaleString('en-US', { timeZone: TZ, hour: 'numeric', hour12: false }), 10) % 24;
    card.dataset.phase = h >= 6 && h < 18 ? 'day' : 'night';
    document.getElementById('ab-greet').textContent = h < 5 ? 'Late night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : h < 22 ? 'Good evening' : 'Good night';
  }
  tickClock();
  setInterval(tickClock, 15000);
})();



/* Chat assistant: built-in answers about Charly (optionally connect a real AI through BOT_ENDPOINT) */
(function () {
  const BOT_ENDPOINT = '';   /* leave empty to use the built-in answers; set to your own server URL to use a real AI */
  const chat = document.getElementById('chat');
  const fab = chat.querySelector('.chat-fab');
  const panel = chat.querySelector('.chat-panel');
  const log = chat.querySelector('.chat-log');
  const chips = chat.querySelector('.chat-chips');
  const form = chat.querySelector('.chat-form');
  const input = form.elements.q;
  const history = [];
  let greeted = false, busy = false;

  const topics = [
    { re: /\b(hi|hello|hey|yo|good (morning|afternoon|evening))\b/, a: "Hi there! I'm Charly's assistant. Ask me about his skills, education, projects or how to get in touch." },
    { re: /skill|tech|stack|language|code|coding|html|css|javascript|typescript|dart|python|java|php|firebase|figma|tools/, a: 'Charly works with HTML, CSS, JavaScript, TypeScript, Dart, Python, Java, PHP and Firebase, and designs in Figma. UI UX design is a growing focus for him.', link: ['See skills', '#skills'] },
    { re: /educat|study|school|student|course|degree|learn/, a: "He's a BS Information student, and he keeps learning by practicing HTML, CSS, JavaScript and Dart through personal projects.", link: ['See education', '#education'] },
    { re: /project|portfolio|built|build|work|made/, a: "His personal website is the main project so far. It has dark and light mode and this chat assistant, and more projects are on the way.", link: ['See projects', '#projects'] },
    { re: /contact|email|mail|phone|call|number|reach|hire|message|touch/, a: 'You can email charlydomingo281@gmail.com, call +63 9631 839 766.', link: ['Go to contact', '#contact'] },
    { re: /where|location|live|from|city|maragusan|davao/, a: 'Charly is based in Maragusan, Davao de Oro, in the Philippines.', link: ['See details', '#about'] },
    { re: /time|clock/, a: () => 'It is ' + new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit' }) + ' in Maragusan right now.' },
    { re: /dark|light|theme|color|colour|accent|mode/, a: 'Use the sun and moon switch in the top bar for dark or light mode.' },
    { re: /who|about|charly|yourself|you do|introduce/, a: 'Charly D. Domingo is a BS Information student who builds websites and designs simple, user-friendly interfaces.', link: ['About Charly', '#about'] },
    { re: /thank|thanks|bye|great|cool|nice/, a: "You're welcome! Let me know if you want to know anything else." }
  ];
  const fallback = { a: "I'm not sure about that one. Try asking about skills, education, projects or contact, or reach Charly by email or phone.", link: ['Go to contact', '#contact'] };

  function add(who, text, link) {
    const row = document.createElement('div');
    row.className = 'msg ' + who;
    const b = document.createElement('div');
    b.className = 'bubble';
    b.textContent = text;
    if (link) {
      const a = document.createElement('a');
      a.href = link[1]; a.textContent = link[0] + ' \u2192'; a.className = 'bubble-link';
      a.addEventListener('click', () => { if (matchMedia('(max-width: 640px)').matches) setOpen(false); });
      b.appendChild(a);
    }
    row.appendChild(b);
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
    return row;
  }

  async function answer(q) {
    if (BOT_ENDPOINT) {
      try {
        const res = await fetch(BOT_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: q, history }) });
        const data = await res.json();
        if (data && data.reply) return { a: data.reply };
      } catch (e) { /* fall back to the built-in answers */ }
    }
    const t = topics.find((x) => x.re.test(q.toLowerCase())) || fallback;
    return { a: typeof t.a === 'function' ? t.a() : t.a, link: t.link };
  }

  async function ask(q) {
    q = q.trim();
    if (!q || busy) return;
    busy = true;
    add('user', q);
    history.push({ role: 'user', content: q });
    chips.hidden = true;
    const typing = add('bot', '');
    typing.classList.add('typing');
    typing.firstChild.innerHTML = '<i></i><i></i><i></i>';
    const [r] = await Promise.all([answer(q), new Promise((ok) => setTimeout(ok, 700 + Math.random() * 500))]);
    typing.remove();
    add('bot', r.a, r.link);
    history.push({ role: 'assistant', content: r.a });
    busy = false;
  }

  ['What does Charly do?', 'Skills', 'Projects', 'Contact'].forEach((label) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = label;
    b.addEventListener('click', () => ask(label === 'Skills' ? 'What skills does he have?' : label === 'Projects' ? 'Show me projects' : label === 'Contact' ? 'How can I contact him?' : label));
    chips.appendChild(b);
  });

  function setOpen(open) {
    chat.classList.toggle('open', open);
    fab.setAttribute('aria-expanded', open);
    fab.setAttribute('aria-label', open ? 'Close chat' : 'Open chat');
    if (open) {
      chat.classList.add('seen');
      if (!greeted) {
        greeted = true;
        setTimeout(() => add('bot', "Hi! I'm Charly's assistant. Ask me anything about his skills, education, projects or contact details."), 250);
      }
      setTimeout(() => input.focus({ preventScroll: true }), 250);
    }
  }
  fab.addEventListener('click', () => setOpen(!chat.classList.contains('open')));
  chat.querySelector('.chat-close').addEventListener('click', () => { setOpen(false); fab.focus(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && chat.classList.contains('open')) { setOpen(false); fab.focus(); } });
  form.addEventListener('submit', (e) => { e.preventDefault(); const q = input.value; input.value = ''; ask(q); });
})();


/* Contact: rotating word, topic + method picker, save-contact card */
(function () {
  const root = document.getElementById('contact');
  if (!root) return;
  const PHONE = '+639631839766';

  /* rotating word in the headline */
  const word = root.querySelector('.ct-word');
  const words = ['websites', 'apps', 'designs', 'ideas', 'something together'];
  let wi = 0;
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(() => {
      word.classList.add('out');
      setTimeout(() => { wi = (wi + 1) % words.length; word.textContent = words[wi]; word.classList.remove('out'); }, 280);
    }, 2600);
  }

  /* topic chips + contact method -> one smart button */
  const topics = {
    internship: ['Internship opportunity', 'an internship opportunity'],
    freelance: ['Freelance project', 'a freelance project'],
    design: ['UI UX design inquiry', 'a UI UX design project'],
    collab: ['Collaboration idea', 'a collaboration idea']
  };
  const tagBtns = [...root.querySelectorAll('.ct-tags button')];
  const seg = root.querySelector('.ct-seg');
  const segBtns = [...seg.querySelectorAll('button')];
  const go = root.querySelector('.ct-go');
  const goLabel = go.querySelector('.ct-go-label');
  const note = document.getElementById('ct-note');
  let topic = '', method = 'email';

  function update() {
    if (method === 'email') {
      const subject = topic ? topics[topic][0] : 'Hello from your website';
      const body = 'Hi Charly,\n\n' + (topic ? "I'd like to talk about " + topics[topic][1] + '.\n\n' : '');
      go.href = 'mailto:' + MY_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      goLabel.textContent = 'Email me';
      note.textContent = topic ? 'Opens your email app with the subject "' + subject + '".' : 'Opens your email app with a ready-made message.';
    } else if (method === 'call') {
      go.href = 'tel:' + PHONE; goLabel.textContent = 'Call me';
      note.textContent = 'Starts a call to +63 9631 839 766.';
    } else {
      go.href = 'sms:' + PHONE; goLabel.textContent = 'Text me';
      note.textContent = 'Opens your messages app to +63 9631 839 766.';
    }
  }
  tagBtns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    tagBtns.forEach((x) => x.setAttribute('aria-pressed', 'false'));
    b.setAttribute('aria-pressed', on);
    topic = on ? b.dataset.t : '';
    update();
  }));
  segBtns.forEach((b, i) => b.addEventListener('click', () => {
    segBtns.forEach((x) => x.setAttribute('aria-checked', x === b));
    seg.style.setProperty('--i', i);
    method = b.dataset.m;
    update();
  }));

  /* copy button: confirmation state */
  const copy = root.querySelector('.copy-btn');
  const copyHtml = copy.innerHTML;
  copy.addEventListener('click', () => {
    copy.classList.add('done');
    copy.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg> Copied!';
    setTimeout(() => { copy.classList.remove('done'); copy.innerHTML = copyHtml; }, 1800);
  });

  /* save contact: downloads a vCard so it can be added to a phone */
  root.querySelector('.ct-vcard').addEventListener('click', () => {
    const vcf = ['BEGIN:VCARD', 'VERSION:3.0', 'N:Domingo;Charly;D.;;', 'FN:Charly D. Domingo', 'TEL;TYPE=CELL:' + PHONE,
      'EMAIL:' + MY_EMAIL, 'ADR;TYPE=HOME:;;Maragusan;Davao de Oro;;;Philippines', 'END:VCARD'].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([vcf], { type: 'text/vcard' }));
    a.download = 'Charly-Domingo.vcf';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    showToast('Contact card saved', { sub: 'Open it to add Charly to your contacts' });
  });
})();


/* Projects: show one at a time, Previous and Next move between them */
(function () {
  const slides = [...document.querySelectorAll('.projects > .featured')];
  if (slides.length < 2) return;
  let i = 0;
  function go(step, btnClass) {
    i = (i + step + slides.length) % slides.length;
    slides.forEach((x, k) => { x.hidden = k !== i; });
    const cur = slides[i];
    cur.classList.remove('slide-in', 'slide-back'); void cur.offsetWidth;
    cur.classList.add(step > 0 ? 'slide-in' : 'slide-back');
    cur.querySelector(btnClass).focus({ preventScroll: true });
  }
  slides.forEach((s) => {
    s.querySelector('.proj-next').addEventListener('click', () => go(1, '.proj-next'));
    s.querySelector('.proj-prev').addEventListener('click', () => go(-1, '.proj-prev'));
  });
})();


/* About: analog clock, copy buttons, clickable "Currently" rows, years studying */
(function () {
  const about = document.getElementById('about');
  if (!about) return;

  /* years studying, calculated from the start year */
  const since = about.querySelector('[data-since]');
  if (since) since.textContent = Math.max(0, new Date().getFullYear() - Number(since.dataset.since));

  /* analog clock (Maragusan time) */
  const hr = about.querySelector('.hand.hr'), mn = about.querySelector('.hand.mn'), sc = about.querySelector('.hand.sc');
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23' });
  function tick() {
    const p = Object.fromEntries(fmt.formatToParts(new Date()).filter((x) => x.type !== 'literal').map((x) => [x.type, +x.value]));
    hr.style.transform = 'rotate(' + (((p.hour % 12) + p.minute / 60) * 30) + 'deg)';
    mn.style.transform = 'rotate(' + ((p.minute + p.second / 60) * 6) + 'deg)';
    sc.style.transform = 'rotate(' + (p.second * 6) + 'deg)';
  }
  if (hr) { tick(); setInterval(tick, 1000); }

  /* copy buttons on contact rows */
  const contact = [...about.querySelectorAll('.ab-card')].find((c) => c.querySelector('.ab-title') && c.querySelector('.ab-title').textContent.trim() === 'Contact details');
  if (contact) contact.querySelectorAll('.ab-list li').forEach((li) => {
    const src = li.querySelector('a') || li.querySelector('div span');
    const label = li.querySelector('strong').textContent;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'copy-mini'; b.setAttribute('aria-label', 'Copy ' + label.toLowerCase());
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    b.addEventListener('click', async () => {
      const v = src.textContent.trim();
      try { await navigator.clipboard.writeText(v); showToast(label + ' copied', { sub: v, duration: 2000 }); }
      catch (e) { showToast('Could not copy', { sub: v }); }
    });
    li.appendChild(b);
  });

  /* "Currently" rows jump to the matching section */
  const now = [...about.querySelectorAll('.ab-card')].find((c) => c.querySelector('.ab-title.live'));
  if (now) now.querySelectorAll('.ab-list li').forEach((li, i) => {
    const target = ['#projects', '#skills', '#education'][i];
    if (!target) return;
    li.classList.add('go'); li.tabIndex = 0; li.setAttribute('role', 'link');
    const go = () => document.querySelector(target).scrollIntoView({ behavior: 'smooth' });
    li.addEventListener('click', go);
    li.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  });
})();

/* Phones: the back-to-top button hides while scrolling down, so it never covers the text */
(function () {
  const t = document.querySelector('.to-top');
  if (!t) return;
  const phone = window.matchMedia('(max-width: 640px)');
  let last = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (phone.matches && y > last + 4) t.classList.add('away');
    else if (y < last - 4 || !phone.matches) t.classList.remove('away');
    last = y;
  }, { passive: true });
})();