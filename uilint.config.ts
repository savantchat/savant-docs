import {defineUilintConfig} from '@uilint/cli';

export default defineUilintConfig({
  layout: {
    build: 'npm run build',
    distDir: './build',
    scenarios: {
      'ai-agents': {
        module: './uilint/scenarios/ai-agents.ts',
        viewports: ['mobile', 'desktop', 'laptop', 'wide', 'widescreen'],
      },
      home: {
        module: './uilint/scenarios/home.ts',
        viewports: ['mobile', 'desktop', 'laptop', 'wide', 'widescreen'],
      },
      blog: {
        module: './uilint/scenarios/blog.ts',
        viewports: ['mobile', 'desktop', 'wide', 'widescreen'],
      },
      pricing: {
        module: './uilint/scenarios/pricing.ts',
        viewports: ['mobile', 'desktop', 'wide', 'widescreen'],
      },
    },
    viewports: {
      laptop: {width: 1280, height: 800},
      wide: {width: 1440, height: 900},
      widescreen: {width: 1920, height: 1080},
    },
  },
});
