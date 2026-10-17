// sya 13d7f0: a blog post moved to /docs must keep its old /blog URL alive
// through a server-side 301. The docs image serves build/ with `serve`, which
// reads build/serve.json; Docusaurus copies static/serve.json there.
import {existsSync, readdirSync, readFileSync} from 'node:fs';
import path from 'node:path';

type Redirect = {source: string; destination: string; type?: number};

const root = process.cwd();
const serveConfig = JSON.parse(readFileSync(path.resolve(root, 'static/serve.json'), 'utf8')) as {
  redirects?: Redirect[];
};
const redirects = serveConfig.redirects ?? [];

// Every post removed from blog/ whose content now lives under docs/.
// Add a row when a post moves; the test then demands both redirect forms.
const movedPosts = [
  {
    blogSlug: 'howto-load-non-standard-projects-to-savant-chat',
    docFile: 'docs/howto-load-non-standard-projects/index.mdx',
  },
];

function frontmatterSlug(file: string): string {
  const source = readFileSync(path.resolve(root, file), 'utf8');
  const match = /^---\n[\s\S]*?^slug:\s*(\S+)\s*$[\s\S]*?^---$/m.exec(source);
  if (!match) throw new Error(`${file} has no slug frontmatter`);
  return match[1].replace(/^\//, '');
}

function liveBlogSlugs(): string[] {
  return readdirSync(path.resolve(root, 'blog'), {withFileTypes: true})
    .filter(entry => entry.isDirectory())
    .flatMap(entry => {
      const dir = path.join('blog', entry.name);
      const index = ['index.mdx', 'index.md'].find(name => existsSync(path.resolve(root, dir, name)));
      return index ? [frontmatterSlug(path.join(dir, index))] : [];
    });
}

describe('moved blog posts redirect to their docs page', () => {
  test.each(movedPosts)('/blog/$blogSlug answers 301 with and without a trailing slash', ({blogSlug, docFile}) => {
    const destination = `/docs/${frontmatterSlug(docFile)}/`;
    for (const source of [`/blog/${blogSlug}`, `/blog/${blogSlug}/`]) {
      const rule = redirects.find(r => r.source === source);
      expect(rule, `serve.json has no redirect for ${source}`).toBeDefined();
      expect(rule?.destination).toBe(destination);
      expect(rule?.type).toBe(301);
    }
  });

  it('never redirects away from a post that is still published', () => {
    const live = new Set(liveBlogSlugs().map(slug => `/blog/${slug}`));
    expect(live.size).toBeGreaterThan(0);
    for (const rule of redirects) {
      expect(live.has(rule.source.replace(/\/$/, '')), `${rule.source} shadows a live post`).toBe(false);
    }
  });
});
