// @vitest-environment node
// AC13: run `npm ci && npm run build && npm test -- tests/acceptance/ai-agents-static.test.ts`
// from landing/. The build is separate so a missing page fails as an assertion,
// and CI cannot mistake a build failure for proof of the no-JavaScript contract.
import {existsSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe, expect, it} from 'vitest';
import {JSDOM} from 'jsdom';

const builtPage = resolve(process.cwd(), 'build/docs/ai-agents/index.html');

// Strip markup (including all scripts) without executing JavaScript or mounting
// a component. Highlighted command tokens may be split across span elements.
function staticText(html: string): string {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');
}

describe('MCP AC13: agent instructions survive static HTML fetch', () => {
  it('links both API key instructions to the app dashboard', () => {
    const document = new JSDOM(readFileSync(builtPage, 'utf8')).window.document;
    const hrefs = Array.from(document.querySelectorAll('a[href]'), link => link.getAttribute('href'));
    expect.soft(hrefs).not.toContain('https://savant.chat/api-keys');
    expect(hrefs.filter(href => href === 'https://savant.chat/dashboard/api-keys')).toHaveLength(2);
  });

  it('ships the docs route and every client command without script execution', () => {
    expect(existsSync(builtPage), 'Docusaurus must emit build/docs/ai-agents/index.html').toBe(true);
    const html = readFileSync(builtPage, 'utf8');
    const text = staticText(html);
    expect(text).toContain('Instructions for AI agents');
    // The procedure must be an ordered list in the server-rendered document.
    const heading = html.indexOf('Instructions for AI agents');
    expect(html.slice(heading)).toMatch(/<ol\b[\s\S]*?<li\b[\s\S]*?<\/ol>/);
    for (const phrase of ['Claude Code', 'Codex CLI', 'Cursor', 'Other', 'user scope',
      'get_account', 'SAVANT_API_KEY', 'YOUR_API_KEY']) {
      expect(text, `static instructions missing ${phrase}`).toContain(phrase);
    }
    expect(text).toMatch(/never[^.]*key[^.]*(repository|version control)/i);
    expect(text).toMatch(/restart|reconnect/i);
    expect(text).toMatch(/permissions/i);
    expect(text).toMatch(/spend limit/i);
    expect(text).toMatch(/transcript|conversation/i);
    expect(text).toContain('claude mcp add --transport http --scope user savant ');
    expect(text).toContain('--header "Authorization: Bearer YOUR_API_KEY"');
    expect(text).toContain('~/.codex/config.toml');
    expect(text).toContain('[mcp_servers.savant]');
    expect(text).toContain('bearer_token_env_var = "SAVANT_API_KEY"');
    expect(text).toContain('~/.cursor/mcp.json');
    expect(text).toContain('"Authorization": "Bearer ${env:SAVANT_API_KEY}"');
    expect(text).toMatch(/"url":\s*"https?:\/\/[^\s"]+\/mcp"/);
    expect(text).toContain('"Authorization": "Bearer YOUR_API_KEY"');
    expect(text).toContain('Set up the Savant MCP server for me by following the instructions at ');
    expect(text).toContain('/docs/ai-agents. Use this API key: YOUR_API_KEY. Do not save the key anywhere inside this repository.');
  });
});
