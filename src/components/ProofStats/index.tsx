import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';

import {EVMBENCH_PROOF_URL} from '@site/src/config/evmbench';

import BalancedHeading from '../BalancedHeading';
import styles from './styles.module.css';

type ProofStatsProps = {
  signupUrl: string;
};

const proofStats = [
  {
    value: 'Top-6',
    label:
      'in the Sherlock Symbiotic contest (Sep 2025) — competing against dozens of expert human auditors.',
    sourceUrl:
      'https://www.globenewswire.com/news-release/2025/09/02/3143051/0/en/savant-chat-achieves-a-historic-top-6-ranking-in-the-sherlock-defi-audit-contest.html',
  },
  {
    value: '100% recall',
    label:
      'on the Crestal Sherlock contest in an independent blind pilot: 7/7 judge-adjudicated issues, each with a PoC.',
    sourceUrl: 'https://github.com/LyuboslavLyubenov/ai-audit-tools-eval',
  },
  {
    value: '17.9%',
    label:
      'precision — the best among AI auditors across three judge-adjudicated contests in the same pilot.',
    sourceUrl: 'https://github.com/LyuboslavLyubenov/ai-audit-tools-eval',
  },
  {
    value: '87–95%',
    label:
      'accuracy on CTFBench, our open smart contract benchmark (methodology published on ethresear.ch).',
    sourceUrl: 'https://github.com/savantchat/ctfbench',
  },
  {
    value: '200+',
    label:
      'vulnerability classes, curated from a reference book of 20,000 real-world smart contract vulnerabilities.',
    sourceUrl:
      'https://savant.chat/blog/building-autonomous-auditor-vulnerability-reference-book/',
  },
];

export default function ProofStats({signupUrl}: ProofStatsProps): ReactNode {
  const signupPath = signupUrl.replace(/^pathname:\/\//, '');
  const signupSourceUrl = signupPath.startsWith('/')
    ? `https://savant.chat${signupPath}`
    : signupUrl;

  return (
    <section className={styles.proofStats} data-testid="proof-stats" id="proof">
      <div className={styles.header}>
        <p className={styles.kicker}>PROOF</p>
        <BalancedHeading as="h2" className={styles.title}>
          The numbers behind the name.
        </BalancedHeading>
        <p className={styles.subtitle} data-testid="proof-subtitle">
          Every number below comes from public, verifiable smart contract
          audits and benchmarks — links included.
        </p>
      </div>
      <div className={styles.grid}>
        <article
          className={`${styles.statCard} ${styles.featuredCard}`}
          data-testid="stat-card">
          <strong className={styles.statValue}>#1 · 95.7%</strong>
          <p className={styles.statLabel}>
            recall on EVMBench, the OpenAI &amp; Paradigm smart contract
            benchmark — 112 of 117 high-severity bugs detected, the highest of any
            AI auditor or frontier model.{' '}
            <Link to="/evmbench/">See the EVMBench leaderboard →</Link>
          </p>
          <a className={styles.sourceLink} href={EVMBENCH_PROOF_URL}>
            Source ↗
          </a>
        </article>
        {proofStats.map(stat => (
          <article className={styles.statCard} data-testid="stat-card" key={stat.value}>
            <strong className={styles.statValue}>{stat.value}</strong>
            <p className={styles.statLabel}>{stat.label}</p>
            <a className={styles.sourceLink} href={stat.sourceUrl}>
              Source ↗
            </a>
          </article>
        ))}
        <article className={styles.statCard} data-testid="stat-card">
          <strong className={styles.statValue}>$75</strong>
          <p className={styles.statLabel}>
            free credits on signup — no card required. Enough to audit a typical ERC-20
            end-to-end.
          </p>
          <a className={styles.sourceLink} href={signupSourceUrl}>
            Source ↗
          </a>
        </article>
      </div>
    </section>
  );
}
