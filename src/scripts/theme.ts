// Theme switcher: Light / Dark / System. The choice lives in
// localStorage.theme ("light" | "dark"); no entry means "follow the system".
// Layout.astro applies it before first paint.
type Choice = 'light' | 'dark' | 'system';

const root = document.documentElement;
const systemLight = matchMedia('(prefers-color-scheme: light)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const themeColors = { light: '#ECECEF', dark: '#0A0B10' };

const choice = (): Choice => (root.dataset.theme === 'light' || root.dataset.theme === 'dark' ? root.dataset.theme : 'system');
const effective = (c: Choice = choice()) => (c === 'system' ? (systemLight.matches ? 'light' : 'dark') : c);

function store(c: Choice) {
  try {
    if (c === 'system') localStorage.removeItem('theme');
    else localStorage.setItem('theme', c);
  } catch {
    /* storage unavailable (private mode): the choice lasts for this page only */
  }
}

function sync() {
  const current = choice();
  for (const btn of document.querySelectorAll<HTMLButtonElement>('[data-theme-value]')) {
    btn.setAttribute('aria-pressed', String(btn.dataset.themeValue === current));
  }
  const color = themeColors[effective()];
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) meta.content = color;
}

function apply(c: Choice) {
  if (c === 'system') delete root.dataset.theme;
  else root.dataset.theme = c;
  store(c);
  sync();
}

function setTheme(next: Choice, origin?: HTMLElement) {
  if (next === choice()) return;
  const changesLook = effective(next) !== effective();
  if (!changesLook || reducedMotion.matches || !document.startViewTransition) {
    apply(next);
    return;
  }
  // Reveal the new theme as a circle growing out of the clicked button.
  const r = origin?.getBoundingClientRect();
  const x = r ? r.left + r.width / 2 : innerWidth / 2;
  const y = r ? r.top + r.height / 2 : 0;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const transition = document.startViewTransition(() => apply(next));
  transition.ready.then(() => {
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 600, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' },
    );
  });
}

document.addEventListener('click', (e) => {
  const btn = (e.target as Element).closest<HTMLButtonElement>('[data-theme-value]');
  if (btn) setTheme(btn.dataset.themeValue as Choice, btn);
});
systemLight.addEventListener('change', sync);
sync();
