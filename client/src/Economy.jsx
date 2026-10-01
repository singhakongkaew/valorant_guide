import { useState } from 'react';
import { Footer, Header } from './Gunplay.jsx';

const economyAliases = ['eco', 'econ', 'force', 'force buy', 'full buy', 'half buy', 'save', 'loss bonus', 'credits', 'money'];
export const economyLessons = [
  {
    id: 'buy-types',
    title: 'Buy types',
    level: 'beginner',
    summary: 'Choose an eco, half buy, force buy, or full buy by comparing team credits and the next round.',
    aliases: economyAliases,
    steps: [
      'Check the credits of every teammate before choosing a round plan.',
      'Save together when a low-cost round gives the team a stronger full buy next round.',
      'Choose a half buy when the team can spend some credits and still keep a useful next-round budget.',
      'Force buy when the round has high value and the team agrees that saving is less useful.',
      'Full buy when the team can afford its planned weapons, shields, and utility together.',
    ],
    mistakes: [
      ['Buying alone while teammates save', 'Agree on a team plan so everyone reaches the next buy together.'],
      ['Spending every credit without checking next round', 'Compare the current purchase with the likely next-round budget.'],
    ],
    drills: [
      { name: 'Team buy call', duration: '5 minutes', how: 'Review three team credit totals and call save, half buy, force buy, or full buy with one reason.' },
    ],
  },
];
export const roundCalculatorEntry = {
  id: 'calculator',
  title: 'Round calculator',
  subtitle: 'Calculator',
  summary: 'Estimate the credits remaining after a planned buy.',
  aliases: ['buy calculator', 'how much money', ...economyAliases],
  body: ['Enter your current credits and planned spend to calculate your remaining round budget.'],
  url: '/economy/calculator',
};

function RoundCalculator() {
  const [credits, setCredits] = useState(800);
  const [plannedSpend, setPlannedSpend] = useState(0);
  const remaining = credits - plannedSpend;

  return (
    <div className="gunplay-site economy-site">
      <Header activeSection="economy" />
      <main className="gunplay-main">
        <div className="gunplay-intro">
          <p className="gunplay-eyebrow">The mechanics field guide</p>
          <h1>Round calculator</h1>
          <p>Estimate your credits after a planned buy.</p>
        </div>
        <section className="economy-calculator" aria-label="Round credit calculator">
          <label>Current credits
            <input type="number" min="0" max="9000" step="50" value={credits} onChange={(event) => setCredits(Math.max(0, Number(event.target.value) || 0))} />
          </label>
          <label>Planned spend
            <input type="number" min="0" max="9000" step="50" value={plannedSpend} onChange={(event) => setPlannedSpend(Math.max(0, Number(event.target.value) || 0))} />
          </label>
          <output className={remaining < 0 ? 'is-short' : ''} aria-live="polite">
            {remaining < 0 ? `${Math.abs(remaining)} credits over budget` : `${remaining} credits remaining`}
          </output>
        </section>
        <a className="back-link" href="/economy">Back to economy</a>
      </main>
      <Footer />
    </div>
  );
}

function EconomyOverview() {
  return (
    <div className="gunplay-site economy-site">
      <Header activeSection="economy" />
      <main className="gunplay-main">
        <div className="gunplay-intro">
          <p className="gunplay-eyebrow">The mechanics field guide</p>
          <h1>Economy</h1>
          <p>Plan your credits before the next round.</p>
        </div>
        <section className="technique-grid" aria-label="Economy lessons and tools">
          {economyLessons.map((lesson) => <a className="technique-card" href={`/economy/${lesson.id}`} key={lesson.id}><span className="technique-card-body"><span className="level-badge level-beginner">{lesson.level}</span><strong>{lesson.title}</strong><span className="technique-summary">{lesson.summary}</span></span></a>)}
          <a className="technique-card" href={roundCalculatorEntry.url}>
            <span className="technique-card-body">
              <strong>Round calculator</strong>
              <span className="technique-summary">Estimate the credits remaining after a planned buy.</span>
            </span>
          </a>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function EconomyLesson({ lesson }) {
  return (
    <div className="gunplay-site economy-site">
      <Header activeSection="economy" />
      <main className="gunplay-main technique-copy">
        <div className="gunplay-intro"><p className="gunplay-eyebrow">The mechanics field guide</p><h1>{lesson.title}</h1><p>{lesson.summary}</p></div>
        <section className="technique-section"><h2>How to choose</h2><ol>{lesson.steps.map((step) => <li key={step}>{step}</li>)}</ol></section>
        <section className="technique-section"><h2>Common mistakes</h2><ul className="mistake-cards">{lesson.mistakes.map(([title, detail]) => <li key={title}><strong>{title}</strong><span>{detail}</span></li>)}</ul></section>
        <section className="technique-section"><h2>Practice</h2><div className="drill-grid">{lesson.drills.map((drill) => <article className="drill-card economy-drill" key={drill.name}><span className="drill-copy"><strong>{drill.name}</strong><small>{drill.duration}</small><span>{drill.how}</span></span></article>)}</div></section>
        <a className="back-link" href="/economy">Back to economy</a>
      </main>
      <Footer />
    </div>
  );
}

export default function Economy() {
  const path = window.location.pathname.replace(/\/$/, '');
  if (path.endsWith('/calculator')) return <RoundCalculator />;
  const lessonId = path.split('/').pop();
  const lesson = economyLessons.find((item) => item.id === lessonId);
  return lesson ? <EconomyLesson lesson={lesson} /> : <EconomyOverview />;
}
