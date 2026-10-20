import type {ReactNode} from 'react';

import {EVMBENCH_PROOF_URL} from '@site/src/config/evmbench';
import BalancedHeading from '../BalancedHeading';
import styles from './styles.module.css';

type ComparisonRow = {
  criterion: string;
  slither: string;
  manual: string;
  auditAgent: string;
  octane: string;
  savant: ReactNode;
};

const rows: ComparisonRow[] = [
  {
    criterion: 'Coverage',
    slither: 'Syntactic patterns only (no logic/economic reasoning)',
    manual: 'Depends on auditor',
    auditAgent: 'Broad LLM + static + dynamic',
    octane: 'LLM agents + fuzz detectors',
    savant: '200+ classes, multi-agent, RAG reference book',
  },
  {
    criterion: 'Time to result',
    slither: 'Minutes',
    manual: '3–38 days',
    auditAgent: 'Hours–days',
    octane: 'Minutes–hours',
    savant: 'Minutes (10–30 for typical code)',
  },
  {
    criterion: 'Cost (typical DeFi protocol)',
    slither: 'Free',
    manual: '$40K–$100K (Sherlock)',
    auditAgent: 'From $199/mo subscription',
    octane: 'Invitation-only, sales-led',
    savant: '$0.07–$0.50/line, $75 free credits',
  },
  {
    criterion: 'Public benchmark',
    slither: '~46–54% recall (Augment Code summary)',
    manual: 'n/a',
    auditAgent: '67% recall on EVMBench (post-validation)',
    octane: 'Monad contest #1 of 1,600',
    savant: (
      <>
        #1 on EVMBench — 95.7% recall (112/117): benchmark solved, industry-leading
        recall
        <sup className={styles.footnote}>
          <a
            href={EVMBENCH_PROOF_URL}
            aria-label="Proof: all 117 EVMBench reports and verdicts on GitHub"
            title="All 117 EVMBench reports and verdicts on GitHub">
            [?]
          </a>
        </sup>
      </>
    ),
  },
  {
    criterion: 'False positives',
    slither: 'Very high (developers ignore warnings)',
    manual: 'Low (human-reviewed)',
    auditAgent: '75% FP reduction via validation phase',
    octane: 'Lower — validates every finding (vendor claim)',
    savant:
      'Critic subagent PoCs every finding (Advanced & Pro); "didn’t produce a single clear false positive" — Pessimistic Security',
  },
  {
    criterion: 'Language support',
    slither: 'Solidity',
    manual: 'Varies',
    auditAgent: 'Solidity, some Solana, Starknet',
    octane: 'Language-agnostic',
    savant:
      'Language-agnostic — any code: smart contracts (Solidity · Vyper · Rust), ZK circuits, nodes, backends',
  },
  {
    criterion: 'CI/CD',
    slither: 'Mostly no',
    manual: 'No',
    auditAgent: 'Yes',
    octane: 'Yes (GitHub/GitLab)',
    savant: 'Yes (GitHub & GitLab CI)',
  },
];

export default function Comparison(): ReactNode {
  return (
    <section className={styles.comparison} data-testid="comparison">
      <div className={styles.header}>
        <p className={styles.kicker}>COMPARISON</p>
        <BalancedHeading as="h2" className={styles.title}>
          Savant Chat vs the alternatives — at a glance.
        </BalancedHeading>
        <p className={styles.subtitle} data-testid="comparison-subtitle">
          Head-to-head on smart contract audits.
        </p>
      </div>
      <div className={styles.comparisonScroll} data-testid="comparison-scroll">
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.criterionHeader} scope="col">
                <span>Criterion</span>
              </th>
              <th
                className={styles.regularColumn}
                data-testid="comparison-regular-column"
                scope="col">
                Slither/Mythril
              </th>
              <th className={styles.regularColumn} scope="col">
                Manual audit firm
              </th>
              <th className={styles.regularColumn} scope="col">
                AuditAgent
              </th>
              <th className={styles.regularColumn} scope="col">
                Octane
              </th>
              <th
                className={`${styles.regularColumn} ${styles.savantColumn}`}
                data-testid="comparison-savant-column"
                scope="col">
                Savant Chat
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr data-testid="comparison-row" key={row.criterion}>
                <th className={styles.criterionCell} scope="row">
                  {row.criterion}
                </th>
                <td className={styles.regularColumn}>{row.slither}</td>
                <td className={styles.regularColumn}>{row.manual}</td>
                <td className={styles.regularColumn}>{row.auditAgent}</td>
                <td
                  className={styles.regularColumn}
                  data-testid={
                    row.criterion === 'Public benchmark'
                      ? 'comparison-octane-benchmark'
                      : undefined
                  }>
                  {row.octane}
                </td>
                <td
                  className={`${styles.regularColumn} ${styles.savantColumn}`}
                  data-testid={
                    row.criterion === 'Public benchmark'
                      ? 'comparison-savant-benchmark'
                      : undefined
                  }>
                  {row.savant}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.bottomLine}>
        Roughly 1–3% of the cost of a manual DeFi audit — with a public contest record.
      </p>
    </section>
  );
}
