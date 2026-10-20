import type {ReactNode} from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import FinalCta from '@site/src/components/FinalCta';
import {
  EVMBENCH_PROOF_URL,
  EVMBENCH_UPDATED,
  EVMBENCH_UPDATED_LABEL,
  FRONTIER_EVALS_URL,
  GROUND_TRUTH_PATCH_URL,
  OPENAI_ANNOUNCEMENT_URL,
  OPENAI_PAPER_URL,
  evmbenchEntries,
} from '@site/src/config/evmbench';
import styles from './evmbench.module.css';

type SiteConfigWithSignup = {
  customFields?: {
    signupUrl?: string;
  };
};

const PAGE_URL = 'https://savant.chat/evmbench/';
const PAGE_TITLE = 'EVMBench Leaderboard: Savant Chat #1 (95.7%)';
const PAGE_DESCRIPTION =
  'EVMBench leaderboard for AI smart contract auditors: Savant Chat ranks #1 with 95.7% detection recall (112/117 high-severity bugs), ahead of every agent and frontier model. Reports public.';

// Competitor and third-party links are never endorsed with link equity.
const NOFOLLOW = 'nofollow noopener noreferrer';

const ours = evmbenchEntries[0];
const runnerUp = evmbenchEntries[1];
const lead = (ours.recall - runnerUp.recall).toFixed(2);

const faqs: {question: string; answer: ReactNode; text: string}[] = [
  {
    question: 'What is EVMBench?',
    text:
      'EVMBench is a benchmark created by OpenAI and Paradigm that measures how well AI agents detect, patch and exploit high-severity smart contract vulnerabilities. Its Detect mode scores recall against 117 ground-truth high-severity, loss-of-funds bugs from 40 real Code4rena audit contests.',
    answer: (
      <>
        EVMBench is a benchmark created by OpenAI and Paradigm that measures how
        well AI agents detect, patch and exploit high-severity smart contract
        vulnerabilities. Its Detect mode scores recall against 117 ground-truth
        high-severity, loss-of-funds bugs from 40 real Code4rena audit contests.
      </>
    ),
  },
  {
    question: 'Which AI auditor ranks #1 on EVMBench?',
    text: `Savant Chat ranks #1 on EVMBench Detect with ${ours.recall}% recall — it detected 112 of the 117 high-severity vulnerabilities, ${lead} points ahead of the next-best published result and more than twice the best frontier model in the EVMBench paper (Claude Opus 4.6, 45.6%).`,
    answer: (
      <>
        Savant Chat ranks #1 on EVMBench Detect with <strong>{ours.recall}% recall</strong>{' '}
        — it detected 112 of the 117 high-severity vulnerabilities, {lead} points
        ahead of the next-best published result and more than twice the best
        frontier model in the EVMBench paper (Claude Opus 4.6, 45.6%).
      </>
    ),
  },
  {
    question: 'How is EVMBench Detect scored?',
    text:
      'Each audit report is compared with a ground-truth finding by an LLM judge using the official EVMBench grading prompt. A vulnerability counts as detected only when the report describes the same mechanism, the same code path and the same fix. The headline metric is recall: the share of ground-truth vulnerabilities detected.',
    answer: (
      <>
        Each audit report is compared with a ground-truth finding by an LLM judge
        using the official EVMBench grading prompt. A vulnerability counts as
        detected only when the report describes the same mechanism, the same
        code path and the same fix. The headline metric is recall: the share of
        ground-truth vulnerabilities detected.
      </>
    ),
  },
  {
    question: 'Why do some EVMBench scores use 117 and others 120?',
    text:
      'EVMBench launched with 120 vulnerabilities; shortly after release OpenAI removed three low-quality findings, leaving 117 as the canonical set. Results published before the patch are scored out of 120, later ones out of 117. Recall percentages remain directly comparable.',
    answer: (
      <>
        EVMBench launched with 120 vulnerabilities; shortly after release OpenAI{' '}
        <a href={GROUND_TRUTH_PATCH_URL} rel={NOFOLLOW} target="_blank">
          removed three low-quality findings
        </a>
        , leaving 117 as the canonical set. Results published before the patch
        are scored out of 120, later ones out of 117. Recall percentages remain
        directly comparable.
      </>
    ),
  },
  {
    question: "Can I verify Savant Chat's EVMBench result?",
    text:
      "Yes. All 117 audit reports, EVMBench's own GPT-5 critic verdict for each, the critic's full reasoning and the ground truth are public on GitHub (savantchat/savant-chat-evmbench-report). Every verdict is a single call to EVMBench's unmodified DetectGrader, so anyone can re-run it without Savant Chat.",
    answer: (
      <>
        Yes. All 117 audit reports, EVMBench's own GPT-5 critic verdict for each,
        the critic's full reasoning and the ground truth are public in{' '}
        <a href={EVMBENCH_PROOF_URL}>savantchat/savant-chat-evmbench-report</a>.
        Every verdict is a single call to EVMBench's unmodified{' '}
        <code>DetectGrader</code>, so anyone can re-run it without Savant Chat.
      </>
    ),
  },
  {
    question: 'Can I run the EVMBench-leading auditor on my own code?',
    text:
      'Yes. The same Savant Chat engine audits Solidity, Vyper and Rust smart contracts — and any other code — from $0.07 per line, with $75 in free credits on signup and no credit card required. A typical codebase is audited in 10–30 minutes.',
    answer: (
      <>
        Yes. The same Savant Chat engine audits Solidity, Vyper and Rust smart
        contracts — and any other code — from <Link to="/pricing/">$0.07 per line</Link>,
        with $75 in free credits on signup and no credit card required. A typical
        codebase is audited in 10–30 minutes.
      </>
    ),
  },
];

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': PAGE_URL,
    url: PAGE_URL,
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    dateModified: EVMBENCH_UPDATED,
    inLanguage: 'en',
    isPartOf: {'@type': 'WebSite', name: 'Savant Chat', url: 'https://savant.chat/'},
    about: {
      '@type': 'Thing',
      name: 'EVMBench',
      description:
        'OpenAI and Paradigm benchmark for AI smart contract vulnerability detection, patching and exploitation.',
      sameAs: [OPENAI_ANNOUNCEMENT_URL, FRONTIER_EVALS_URL],
    },
    mainEntity: {'@id': `${PAGE_URL}#leaderboard`},
  },
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${PAGE_URL}#leaderboard`,
    name: 'EVMBench Detect leaderboard — AI smart contract auditors by recall',
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    numberOfItems: evmbenchEntries.length,
    itemListElement: evmbenchEntries.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `${entry.name} — ${entry.recall}% recall`,
      ...(entry.ours ? {url: 'https://savant.chat/'} : {}),
    })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Savant Chat',
    url: 'https://savant.chat/',
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Web',
    description: `AI smart contract auditor — #1 on EVMBench with ${ours.recall}% detection recall (112/117).`,
    award: `#1 on EVMBench Detect — ${ours.recall}% recall (${EVMBENCH_UPDATED_LABEL})`,
    offers: {'@type': 'Offer', price: '0', priceCurrency: 'USD', description: '$75 in free credits on signup.'},
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {'@type': 'Answer', text: faq.text},
    })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {'@type': 'ListItem', position: 1, name: 'Savant Chat', item: 'https://savant.chat/'},
      {'@type': 'ListItem', position: 2, name: 'EVMBench Leaderboard', item: PAGE_URL},
    ],
  },
];

function formatRecall(recall: number): string {
  return Number.isInteger(recall) ? `${recall}.0%` : `${recall}%`;
}

export default function EvmbenchPage(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  const {customFields} = siteConfig as SiteConfigWithSignup;
  const signupUrl = customFields?.signupUrl ?? 'pathname:///dashboard/auth?mode=register';

  return (
    <Layout title={PAGE_TITLE} description={PAGE_DESCRIPTION}>
      <Head>
        <meta property="og:type" content="article" />
        <meta property="article:modified_time" content={EVMBENCH_UPDATED} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Head>
      <main>
        <section className={styles.hero} data-testid="evmbench-hero">
          <div className={styles.heroInner}>
            <div className={styles.heroText}>
              <p className={styles.kicker}>
                EVMBENCH LEADERBOARD · UPDATED{' '}
                <time dateTime={EVMBENCH_UPDATED}>{EVMBENCH_UPDATED_LABEL.toUpperCase()}</time>
              </p>
              <h1 className={styles.title}>
                EVMBench Leaderboard: Savant Chat is #1 with 95.7% recall
              </h1>
              <p className={styles.lead}>
                On EVMBench — the smart contract security benchmark from OpenAI and
                Paradigm — Savant Chat detected <strong>112 of 117</strong>{' '}
                high-severity vulnerabilities from 40 real Code4rena audits. That is
                the highest published score of any AI auditor or frontier model, and
                leaves only five bugs on the table: the benchmark is effectively
                solved.
              </p>
              <div className={styles.ctas}>
                <a className={`button ${styles.primaryCta}`} href={EVMBENCH_PROOF_URL}>
                  Verify all 117 reports on GitHub
                </a>
                <Link
                  className={`button ${styles.secondaryCta}`}
                  to={signupUrl}
                  target="_self">
                  Audit your code — $75 free
                </Link>
              </div>
            </div>
            <dl className={styles.heroStats} data-testid="evmbench-hero-stats">
              <div className={`${styles.heroStat} ${styles.heroStatMain}`}>
                <dt>Detection recall</dt>
                <dd>95.7%</dd>
              </div>
              <div className={styles.heroStat}>
                <dt>Rank</dt>
                <dd>#1</dd>
              </div>
              <div className={styles.heroStat}>
                <dt>High-severity bugs found</dt>
                <dd>112/117</dd>
              </div>
              <div className={styles.heroStat}>
                <dt>vs. best frontier model</dt>
                <dd>2.1×</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className={styles.section} id="leaderboard" data-testid="evmbench-leaderboard">
          <div className={styles.header}>
            <p className={styles.sectionKicker}>DETECT MODE · RECALL</p>
            <h2 className={styles.sectionTitle}>EVMBench Detect leaderboard</h2>
            <p className={styles.subtitle}>
              Every published EVMBench Detect result for AI audit agents and
              frontier models, ranked by recall — the share of ground-truth
              high-severity vulnerabilities each system detected. Each row links to
              the source that published it.
            </p>
          </div>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <caption className={styles.srOnly}>
                EVMBench Detect leaderboard, {EVMBENCH_UPDATED_LABEL}
              </caption>
              <thead>
                <tr>
                  <th scope="col" className={styles.rankCol}>#</th>
                  <th scope="col">Agent / model</th>
                  <th scope="col" className={styles.typeCol}>Type</th>
                  <th scope="col" className={styles.recallCol}>Recall</th>
                  <th scope="col" className={styles.foundCol}>Found</th>
                  <th scope="col" className={styles.sourceCol}>Source</th>
                </tr>
              </thead>
              <tbody>
                {evmbenchEntries.map((entry, index) => (
                  <tr
                    className={entry.ours ? styles.oursRow : undefined}
                    data-testid="evmbench-row"
                    key={entry.name}>
                    <td className={styles.rank}>{index + 1}</td>
                    <th scope="row" className={styles.nameCell}>
                      <span className={styles.name}>{entry.name}</span>
                      <span className={styles.vendor}>{entry.vendor}</span>
                      {entry.note ? <span className={styles.rowNote}>{entry.note}</span> : null}
                    </th>
                    <td>
                      <span
                        className={
                          entry.kind === 'Agent' ? styles.chipAgent : styles.chipModel
                        }>
                        {entry.kind}
                      </span>
                    </td>
                    <td className={styles.recallCell}>
                      <span className={styles.recallValue}>{formatRecall(entry.recall)}</span>
                      <span className={styles.bar} aria-hidden="true">
                        <span className={styles.barFill} style={{width: `${entry.recall}%`}} />
                      </span>
                    </td>
                    <td className={styles.found}>{entry.found ?? '—'}</td>
                    <td className={styles.source}>
                      {entry.ours ? (
                        <a href={entry.sourceUrl}>Full reports ↗</a>
                      ) : (
                        <a href={entry.sourceUrl} rel={NOFOLLOW} target="_blank">
                          {entry.sourceLabel} ↗
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.tableNote}>
            <strong>Agent</strong> — a multi-step system with tools and pipeline
            logic. <strong>Base model</strong> — a frontier LLM in a standard
            coding-agent scaffold, as evaluated in the EVMBench paper. Vendor results
            are self-reported; base-model results come from the{' '}
            <a href={OPENAI_PAPER_URL} rel={NOFOLLOW} target="_blank">
              EVMBench paper
            </a>{' '}
            (Table 9) unless noted. Scores out of 120 predate OpenAI's removal of
            three findings; percentages are comparable.
          </p>
        </section>

        <section className={styles.section} id="what-is-evmbench">
          <div className={styles.twoCol}>
            <div>
              <p className={styles.sectionKicker}>THE BENCHMARK</p>
              <h2 className={styles.sectionTitle}>What is EVMBench?</h2>
              <p className={styles.body}>
                EVMBench is the smart contract security benchmark released by OpenAI
                together with Paradigm in February 2026. It is built from{' '}
                <strong>40 historical Code4rena audit contests</strong> — real
                protocols, real money, and{' '}
                <strong>117 high-severity, loss-of-funds vulnerabilities</strong>{' '}
                confirmed by human auditors and judges. Unlike synthetic CTF
                challenges, every bug was found in production-grade code.
              </p>
              <p className={styles.body}>
                The benchmark has three modes — <strong>Detect</strong>,{' '}
                <strong>Patch</strong> and <strong>Exploit</strong>. Detect is the
                one that matters for auditing: the agent reviews the repository and
                writes an audit report, and an LLM judge decides, vulnerability by
                vulnerability, whether the report found the real bug. In the paper,
                the best frontier model (Claude Opus 4.6 in Claude Code) detected
                45.6%.
              </p>
            </div>
            <ul className={styles.factList}>
              <li>
                <strong>40</strong>
                <span>Code4rena audit repositories</span>
              </li>
              <li>
                <strong>117</strong>
                <span>ground-truth high-severity vulnerabilities</span>
              </li>
              <li>
                <strong>$218K</strong>
                <span>in historical audit awards behind those bugs</span>
              </li>
              <li>
                <strong>45.6%</strong>
                <span>best frontier-model recall in the paper</span>
              </li>
            </ul>
          </div>
        </section>

        <section className={styles.section} id="methodology" data-testid="evmbench-methodology">
          <div className={styles.header}>
            <p className={styles.sectionKicker}>METHODOLOGY</p>
            <h2 className={styles.sectionTitle}>How Savant Chat scored 95.7% — and how to check it</h2>
            <p className={styles.subtitle}>
              Scored exactly the way EVMBench scores: one audit report per issue,
              judged against that issue's ground truth by EVMBench's own grader.
            </p>
          </div>
          <ol className={styles.steps}>
            <li>
              <strong>One report per issue.</strong> Savant Chat produced an audit
              report for each of the 117 issues in the canonical high-severity set —
              no cherry-picked subset.
            </li>
            <li>
              <strong>EVMBench's own judge.</strong> Each report was graded by
              EVMBench's unmodified <code>DetectGrader</code> with its GPT-5 critic
              at high reasoning effort and structured verdicts. Same mechanism, same
              code path, same fix — "same area, similar impact" does not count.
            </li>
            <li>
              <strong>One verdict, no retries.</strong> One verdict per report — no
              voting, no re-rolls, no partial credit. Result: 112 hits, 5 misses.
            </li>
            <li>
              <strong>Everything is public.</strong> All 117 reports, every critic
              verdict with its full reasoning, and the ground truth are published so
              anyone can re-run the grader without Savant Chat.
            </li>
          </ol>
          <a className={styles.proofLink} href={EVMBENCH_PROOF_URL}>
            github.com/savantchat/savant-chat-evmbench-report →
          </a>
        </section>

        <section className={styles.section} id="faq" data-testid="evmbench-faq">
          <div className={styles.header}>
            <p className={styles.sectionKicker}>FAQ</p>
            <h2 className={styles.sectionTitle}>EVMBench questions, answered</h2>
          </div>
          <div className={styles.faqList}>
            {faqs.map(faq => (
              <details className={styles.faqItem} key={faq.question} open>
                <summary>
                  <h3>{faq.question}</h3>
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className={styles.section} id="sources">
          <div className={styles.header}>
            <p className={styles.sectionKicker}>SOURCES</p>
            <h2 className={styles.sectionTitle}>Where these numbers come from</h2>
          </div>
          <ul className={styles.sources}>
            <li>
              <a href={EVMBENCH_PROOF_URL}>Savant Chat EVMBench report</a> — 117
              reports, verdicts and reasoning (112/117, 95.7%).
            </li>
            <li>
              <a href={OPENAI_PAPER_URL} rel={NOFOLLOW} target="_blank">
                EVMBench paper (OpenAI, Paradigm)
              </a>{' '}
              — base-model Detect results, Table 9.
            </li>
            <li>
              <a href={OPENAI_ANNOUNCEMENT_URL} rel={NOFOLLOW} target="_blank">
                Introducing EVMBench (OpenAI)
              </a>{' '}
              and the{' '}
              <a href={FRONTIER_EVALS_URL} rel={NOFOLLOW} target="_blank">
                openai/frontier-evals
              </a>{' '}
              harness.
            </li>
            {evmbenchEntries
              .filter(
                entry =>
                  !entry.ours &&
                  entry.sourceUrl !== OPENAI_PAPER_URL &&
                  !entry.vendor.includes('run by'),
              )
              .map(entry => (
                <li key={entry.name}>
                  <a href={entry.sourceUrl} rel={NOFOLLOW} target="_blank">
                    {entry.vendor} — {entry.name}
                  </a>{' '}
                  — self-reported {entry.recall}%
                  {entry.found ? ` (${entry.found})` : ''}.
                </li>
              ))}
          </ul>
        </section>
      </main>
      <FinalCta signupUrl={signupUrl} />
    </Layout>
  );
}
