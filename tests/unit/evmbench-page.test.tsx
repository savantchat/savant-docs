import {render, screen, within} from '@testing-library/react';
import EvmbenchPage from '../../src/pages/evmbench';
import {EVMBENCH_PROOF_URL, evmbenchEntries} from '../../src/config/evmbench';

describe('evmbench page', () => {
  beforeEach(() => {
    render(<EvmbenchPage />);
  });

  it('renders the keyword H1 with Savant Chat as #1', () => {
    const heading = screen.getByRole('heading', {level: 1});

    expect(heading).toHaveTextContent('EVMBench Leaderboard');
    expect(heading).toHaveTextContent('95.7%');
  });

  it('ranks Savant Chat first, then by recall descending', () => {
    const rows = screen.getAllByTestId('evmbench-row');

    expect(rows).toHaveLength(evmbenchEntries.length);
    expect(rows[0]).toHaveTextContent('Savant Chat');
    const recalls = evmbenchEntries.map(entry => entry.recall);
    expect(recalls).toEqual([...recalls].sort((a, b) => b - a));
  });

  it('marks every external link nofollow except the Savant Chat proof', () => {
    const links = Array.from(document.querySelectorAll('a[href^="http"]'));

    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      const href = link.getAttribute('href');
      const rel = link.getAttribute('rel') ?? '';

      if (href === EVMBENCH_PROOF_URL) {
        expect(rel).not.toContain('nofollow');
      } else {
        expect(rel).toContain('nofollow');
      }
    }
  });

  it('links the Savant Chat row to the public proof repository', () => {
    const [ours] = screen.getAllByTestId('evmbench-row');

    expect(within(ours).getByRole('link')).toHaveAttribute('href', EVMBENCH_PROOF_URL);
  });
});
