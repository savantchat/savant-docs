// EVMBench Detect-mode leaderboard. Every row links to the primary source that
// published the number; only Savant Chat's own proof is a followed link.

export const EVMBENCH_PROOF_URL =
  'https://github.com/savantchat/savant-chat-evmbench-report';
export const EVMBENCH_UPDATED = '2026-10-20';
export const EVMBENCH_UPDATED_LABEL = 'October 20, 2026';

export const OPENAI_PAPER_URL = 'https://cdn.openai.com/evmbench/evmbench.pdf';
export const OPENAI_ANNOUNCEMENT_URL = 'https://openai.com/index/introducing-evmbench/';
export const FRONTIER_EVALS_URL =
  'https://github.com/openai/frontier-evals/tree/main/project/evmbench';
export const GROUND_TRUTH_PATCH_URL =
  'https://github.com/openai/frontier-evals/commit/20ba71827870452ecbd54df79075631da0b39d8d';

const NETHERMIND_URL =
  'https://auditagent.nethermind.io/blog/auditagent-on-evmbench-40-repositories-120-vulnerabilities-no-repos-skipped';
const TESTMACHINE_URL = 'https://testmachine.ai/evmbench';

export type EvmbenchEntry = {
  name: string;
  vendor: string;
  kind: 'Agent' | 'Base model';
  recall: number;
  found?: string;
  note?: string;
  sourceLabel: string;
  sourceUrl: string;
  ours?: boolean;
};

export const evmbenchEntries: EvmbenchEntry[] = [
  {
    name: 'Savant Chat',
    vendor: 'Savant Chat',
    kind: 'Agent',
    recall: 95.7,
    found: '112/117',
    note: 'All 117 reports, critic verdicts and reasoning published.',
    sourceLabel: 'github.com/savantchat',
    sourceUrl: EVMBENCH_PROOF_URL,
    ours: true,
  },
  {
    name: 'Cecuro',
    vendor: 'Cecuro',
    kind: 'Agent',
    recall: 91.45,
    sourceLabel: 'cecuro.ai',
    sourceUrl: 'https://cecuro.ai/benchmarks/',
  },
  {
    name: 'Azimuth',
    vendor: 'TestMachine',
    kind: 'Agent',
    recall: 86.3,
    found: '101/117',
    sourceLabel: 'testmachine.ai',
    sourceUrl: TESTMACHINE_URL,
  },
  {
    name: 'AuditAgent',
    vendor: 'Nethermind Security',
    kind: 'Agent',
    recall: 67.0,
    found: '80/120',
    sourceLabel: 'nethermind.io',
    sourceUrl: NETHERMIND_URL,
  },
  {
    name: 'Kai',
    vendor: 'Dria',
    kind: 'Agent',
    recall: 64.2,
    found: '77/120',
    sourceLabel: 'dria.co',
    sourceUrl: 'https://kai.dria.co/benchmark?tab=evmbench',
  },
  {
    name: 'GPT-5.6 (Codex)',
    vendor: 'OpenAI · run by TestMachine',
    kind: 'Base model',
    recall: 61.5,
    found: '72/117',
    sourceLabel: 'testmachine.ai',
    sourceUrl: TESTMACHINE_URL,
  },
  {
    name: 'Guardix',
    vendor: 'Guardix',
    kind: 'Agent',
    recall: 59.8,
    found: '70/117',
    sourceLabel: 'guardix.dev',
    sourceUrl: 'https://guardix.dev/blog/evmbench-benchmark-results/',
  },
  {
    name: 'Claude Opus 4.6',
    vendor: 'Anthropic · Claude Code',
    kind: 'Base model',
    recall: 45.6,
    sourceLabel: 'EVMBench paper',
    sourceUrl: OPENAI_PAPER_URL,
  },
  {
    name: 'GPT-5.3-Codex (xhigh)',
    vendor: 'OpenAI · Codex CLI',
    kind: 'Base model',
    recall: 39.2,
    sourceLabel: 'EVMBench paper',
    sourceUrl: OPENAI_PAPER_URL,
  },
  {
    name: 'GPT-5.2 (xhigh)',
    vendor: 'OpenAI · Codex CLI',
    kind: 'Base model',
    recall: 39.2,
    sourceLabel: 'EVMBench paper',
    sourceUrl: OPENAI_PAPER_URL,
  },
  {
    name: 'GLM 5.2',
    vendor: 'Zhipu AI · run by TestMachine',
    kind: 'Base model',
    recall: 38.3,
    found: '46/120',
    sourceLabel: 'testmachine.ai',
    sourceUrl: TESTMACHINE_URL,
  },
  {
    name: 'Claude Opus 4.5',
    vendor: 'Anthropic · Claude Code',
    kind: 'Base model',
    recall: 36.1,
    sourceLabel: 'EVMBench paper',
    sourceUrl: OPENAI_PAPER_URL,
  },
  {
    name: 'GPT-5.2 (OpenCode)',
    vendor: 'OpenAI · OpenCode',
    kind: 'Base model',
    recall: 30.0,
    sourceLabel: 'EVMBench paper',
    sourceUrl: OPENAI_PAPER_URL,
  },
  {
    name: 'GPT-5',
    vendor: 'OpenAI',
    kind: 'Base model',
    recall: 23.3,
    sourceLabel: 'EVMBench paper',
    sourceUrl: OPENAI_PAPER_URL,
  },
  {
    name: 'Gemini 3 Pro',
    vendor: 'Google',
    kind: 'Base model',
    recall: 20.8,
    sourceLabel: 'EVMBench paper',
    sourceUrl: OPENAI_PAPER_URL,
  },
  {
    name: 'OpenAI o3',
    vendor: 'OpenAI',
    kind: 'Base model',
    recall: 10.6,
    sourceLabel: 'EVMBench paper',
    sourceUrl: OPENAI_PAPER_URL,
  },
];
