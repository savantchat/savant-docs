import {defineScenario} from '@uilint/cli';
import {agentBlocks, aiAgentsSpec} from '../specs/ai-agents.spec';

export default defineScenario('ai-agents', async runtime => {
  await runtime.goto('/docs/ai-agents');
  await runtime.page.waitForLoadState('networkidle');
  const widths = await runtime.page.evaluate(selectors => Object.fromEntries(
    Object.entries(selectors).map(([name, selector]) => {
      const block = document.querySelector(selector);
      if (!block) throw new Error(`Missing agent code block: ${name}`);
      return [name, {scrollWidth: block.scrollWidth, clientWidth: block.clientWidth}];
    }),
  ), agentBlocks);
  await runtime.snapshot('ai-agents', aiAgentsSpec(widths as Parameters<typeof aiAgentsSpec>[0]));
});
