import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('@docusaurus/ExecutionEnvironment', () => ({
  default: {canUseDOM: true},
}));

type HydratedClientModule = {
  onRouteDidUpdate: (args: {
    location: Location;
    previousLocation: null;
  }) => void;
};

const NativeMutationObserver = globalThis.MutationObserver;
const observers: MutationObserver[] = [];

async function flushAsyncWork(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
}

async function loadClientModule(hint: string | null, status: number) {
  if (hint !== null) localStorage.setItem('savant_authed', hint);
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ok: status === 200, status}));

  // The lifecycle export is deliberately required at runtime, including in the RED test.
  return await import('../../src/clientModules/authCta') as unknown as HydratedClientModule;
}

function finishHydration(clientModule: HydratedClientModule): void {
  clientModule.onRouteDidUpdate({location: window.location, previousLocation: null});
}

function expectCta(anchor: HTMLAnchorElement, label: string, href: string): void {
  expect.soft(anchor.textContent).toBe(label);
  expect.soft(anchor.getAttribute('href')).toBe(href);
}

describe('auth-aware navbar CTA hydration', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    document.body.innerHTML =
      '<nav><a class="navbar-cta" href="/dashboard/auth?mode=register">Start free</a></nav>';

    // Module resets do not disconnect observers created by earlier imports.
    // Keep real jsdom mutation delivery, but release each observer after its test.
    vi.stubGlobal('MutationObserver', class extends NativeMutationObserver {
      constructor(callback: MutationCallback) {
        super(callback);
        observers.push(this);
      }
    });
  });

  afterEach(() => {
    for (const observer of observers.splice(0)) observer.disconnect();
    document.body.innerHTML = '';
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('preserves the server-rendered CTA before hydration despite a signed-in hint, response, and DOM mutation', async () => {
    await loadClientModule('1', 200);
    await flushAsyncWork();
    document.body.append(document.createElement('div'));
    await flushAsyncWork();

    expectCta(document.querySelector<HTMLAnchorElement>('a.navbar-cta')!,
      'Start free', '/dashboard/auth?mode=register');
  });

  it('applies the signed-in CTA after the initial hydration lifecycle', async () => {
    const clientModule = await loadClientModule('1', 200);
    await flushAsyncWork();

    finishHydration(clientModule);

    expectCta(document.querySelector<HTMLAnchorElement>('a.navbar-cta')!,
      'Go to dashboard', '/dashboard');
    expect(localStorage.getItem('savant_authed')).toBe('1');
  });

  it('keeps the anonymous CTA after hydration and records the anonymous hint', async () => {
    const clientModule = await loadClientModule(null, 401);
    await flushAsyncWork();

    finishHydration(clientModule);

    expectCta(document.querySelector<HTMLAnchorElement>('a.navbar-cta')!,
      'Start free', '/dashboard/auth?mode=register');
    expect(localStorage.getItem('savant_authed')).toBe('0');
  });

  it('corrects a stale signed-in hint when the anonymous response arrives after hydration', async () => {
    let resolveAuth!: (response: {ok: boolean; status: number}) => void;
    const authResponse = new Promise<{ok: boolean; status: number}>((resolve) => {
      resolveAuth = resolve;
    });
    localStorage.setItem('savant_authed', '1');
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(authResponse));
    const clientModule = await import('../../src/clientModules/authCta') as unknown as HydratedClientModule;

    // Resolve even when the lifecycle is absent, so no pending auth work leaks out.
    try {
      finishHydration(clientModule);
      expectCta(document.querySelector<HTMLAnchorElement>('a.navbar-cta')!,
        'Go to dashboard', '/dashboard');
    } finally {
      resolveAuth({ok: false, status: 401});
      await flushAsyncWork();
    }

    expectCta(document.querySelector<HTMLAnchorElement>('a.navbar-cta')!,
      'Start free', '/dashboard/auth?mode=register');
    expect(localStorage.getItem('savant_authed')).toBe('0');
  });

  it('updates a mobile menu CTA mounted after hydration to the signed-in state', async () => {
    const clientModule = await loadClientModule('1', 200);
    await flushAsyncWork();
    finishHydration(clientModule);
    await flushAsyncWork();

    const mobileCta = document.createElement('a');
    mobileCta.className = 'navbar-cta';
    mobileCta.textContent = 'Start free';
    mobileCta.setAttribute('href', '/dashboard/auth?mode=register');
    document.body.append(mobileCta);
    await flushAsyncWork();

    expectCta(mobileCta, 'Go to dashboard', '/dashboard');
  });
});
