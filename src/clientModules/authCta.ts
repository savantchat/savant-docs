import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

// Make the navbar "Start free" CTA auth-aware. The docs, the app (/dashboard) and the API
// (/api) share one origin, and the session cookie is HttpOnly (not JS-readable), so we detect
// sign-in with a credentialed same-origin GET /api/v1/me (200 = authed, else anonymous).
//
// The SSG HTML ships the signed-out CTA (correct default for SEO + the logged-out majority).
// A localStorage hint (persists across the app -> docs hard navigation, same origin) lets us
// record the last-known state before the /me round-trip. Apply it in onRouteDidUpdate,
// after hydration and before paint, avoiding both a hydration mismatch and a flash for
// returning signed-in users. Start observing later-mounted CTAs only after hydration.

const AUTHED_LABEL = 'Go to dashboard';
const AUTHED_HREF = '/dashboard';
const ANON_LABEL = 'Start free';
const ANON_HREF = '/dashboard/auth?mode=register';
const HINT_KEY = 'savant_authed';

let known = false;
let hydrated = false;

function applyCta(authed: boolean): void {
  const label = authed ? AUTHED_LABEL : ANON_LABEL;
  const href = authed ? AUTHED_HREF : ANON_HREF;
  document.querySelectorAll<HTMLAnchorElement>('a.navbar-cta').forEach((a) => {
    if (a.textContent !== label) a.textContent = label;
    if (a.getAttribute('href') !== href) a.setAttribute('href', href);
  });
}

async function detectAuth(): Promise<boolean> {
  try {
    const res = await fetch('/api/v1/me', {
      credentials: 'same-origin',
      headers: {Accept: 'application/json'},
    });
    return res.ok;
  } catch {
    return false;
  }
}

if (ExecutionEnvironment.canUseDOM) {
  known = window.localStorage.getItem(HINT_KEY) === '1';

  void detectAuth().then((authed) => {
    known = authed;
    window.localStorage.setItem(HINT_KEY, authed ? '1' : '0');
    if (hydrated) applyCta(known);
  });
}

export function onRouteDidUpdate(): void {
  if (!ExecutionEnvironment.canUseDOM) return;

  const firstUpdate = !hydrated;
  hydrated = true;
  applyCta(known);

  if (!firstUpdate) return;

  // The desktop CTA is in the SSG HTML, but the mobile CTA is (re)mounted when the hamburger
  // menu opens and on client-side route changes — re-apply the current known state whenever a
  // navbar-cta anchor appears.
  const observer = new MutationObserver(() => {
    if (document.querySelector('a.navbar-cta')) applyCta(known);
  });
  observer.observe(document.body, {childList: true, subtree: true});
}
