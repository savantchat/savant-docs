import {defineLayoutSpec, gte, inside} from '@uilint/core';

// Existing heading IDs keep the regression runnable against the unfixed page.
export const agentBlocks = {
  claudeCodeSetup: '#claude-code + p + div pre',
  askYourAgent: '#ask-your-agent-to-connect + p + div pre',
} as const;

type Widths = Record<keyof typeof agentBlocks, {scrollWidth: number; clientWidth: number}>;

export const aiAgentsSpec = (widths: Widths) => defineLayoutSpec(ctx => {
  const content = ctx.el('article .markdown', 'docs content column');
  for (const [name, selector] of Object.entries(agentBlocks)) {
    const block = ctx.el(selector, name);
    const {scrollWidth, clientWidth} = widths[name as keyof Widths];
    ctx.must(
      inside(block, content, {left: gte(0), right: gte(0)}, `${name}/inside-docs-column`),
      () => ({
        name: `${name}/no-horizontal-overflow`,
        check: () => scrollWidth <= clientWidth ? [] : [{
          constraint: `${name}/no-horizontal-overflow`,
          message: `${name}: scrollWidth ${scrollWidth} > clientWidth ${clientWidth}`,
        }],
      }),
    );
  }
});
