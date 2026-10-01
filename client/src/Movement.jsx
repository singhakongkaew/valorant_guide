import { useEffect, useRef, useState } from 'react';
import { difficultyIndicator, Footer, Header, readPracticeCount, techniques as gunplayTechniques } from './Gunplay.jsx';

export const movementTechniques = [
  {
    id: 'silent-walking-footsteps',
    title: 'Silent walking and footsteps',
    level: 'beginner',
    summary: 'Control when your movement gives away your position.',
    video: { youtubeId: '', title: '', channel: '', ageNote: '', verifiedPatch: '' },
    steps: [
      'Use your bound walk key (Shift by default) before entering a risky lane.',
      'Walking can reduce movement noise while an enemy may be close.',
      'Running can reveal your route; save it for safe ground or urgent rotations.',
      'Surface, distance, and patch changes can affect what enemies hear.',
    ],
    mistakes: [
      ['Running through a held lane', 'Walk before crossing likely enemy hearing range.'],
      ['Walking through an entire safe rotation', 'Run in safety, then slow down before contact.'],
      ['Assuming crouch-walk is silent', 'Verify each movement state in a custom game.'],
    ],
    drills: [
      { name: 'Quiet approach', duration: '5 minutes', how: 'In a custom game, approach a teammate by walking. Ask them to call when they first hear you.' },
      { name: 'Sound check route', duration: '5 minutes', how: 'Repeat one route while walking, running, and crouch-walking. Record what your teammate hears.' },
    ],
    relatedIds: ['repositioning-angle-discipline', 'jump-peeking'],
  },
  {
    id: 'strafing-basics-short-strafes',
    title: 'Strafing basics and short strafes',
    level: 'beginner',
    summary: 'Use short, deliberate side steps to stay difficult to track.',
    video: { youtubeId: 'fu-ODOB1VHA', title: '', channel: '', ageNote: '', verifiedPatch: '' },
    steps: [
      'Move sideways in short steps instead of holding one direction.',
      'Keep your crosshair steady while your movement changes.',
      'Vary the length and timing of each strafe to avoid a fixed rhythm.',
      'Use cover to limit how many angles can see each movement.',
    ],
    mistakes: [
      ['Holding a long strafe in the open', 'Use cover and shorten each exposed movement.'],
      ['Repeating a predictable rhythm', 'Vary your timing and direction.'],
      ['Letting movement pull aim off target', 'Practice short steps while holding a fixed angle.'],
    ],
    drills: [
      { name: 'Short-step rhythm', duration: '5 minutes', how: 'In the Range, alternate brief left and right steps while keeping your crosshair on one target.' },
      { name: 'Cover-to-cover strafes', duration: '5 minutes', how: 'Move between nearby cover and expose only a short section of each route.' },
    ],
    relatedIds: ['dead-zone-strafing', 'crouch-peeking-crouch-usage'],
    relatedGunplayIds: ['counter-strafing'],
  },
  {
    id: 'dead-zone-strafing',
    title: 'Dead zone strafing',
    level: 'intermediate',
    summary: 'Recognize the brief low-speed window as direction changes.',
    video: { youtubeId: 'ch7WXea61ko', title: '', channel: '', ageNote: 'Recorded several years ago. Movement accuracy rules may have changed since.', verifiedPatch: '' },
    steps: [
      'Watch for the brief low-velocity moment when changing direction.',
      'Practice recognizing that transition before adding a shot.',
      'Timing and exact behavior can change; verify them on the current patch.',
      'For stop-and-shoot input, use the separate Counter-strafing guide.',
    ],
    mistakes: [
      ['Treating the window as a long pause', 'Keep direction changes compact and controlled.'],
      ['Assuming every weapon settles identically', 'Verify timing and accuracy with the weapon you use.'],
      ['Practicing without feedback', 'Use a fixed target and review each shot.'],
    ],
    drills: [
      { name: 'Direction-change timing', duration: '5 minutes', how: 'In the Range, make short reversals and note the moment your movement settles.' },
      { name: 'Controlled single shots', duration: '5 minutes', how: 'Fire only when your crosshair and movement feel settled; record results by weapon.' },
    ],
    relatedIds: ['strafing-basics-short-strafes', 'jump-peeking'],
    relatedGunplayIds: ['counter-strafing'],
  },
  {
    id: 'jump-peeking',
    title: 'Jump peeking',
    level: 'intermediate',
    summary: 'Change your exposure and timing to gather information safely.',
    video: { youtubeId: 'kxoQab-vGfM', title: '', channel: '', ageNote: '', verifiedPatch: '' },
    steps: [
      'Start close to cover and expose only enough to check an angle.',
      'Use the jump to alter timing, then return to cover quickly.',
      'Coordinate with a teammate who can use the information.',
    ],
    mistakes: [
      ['Jumping into several held angles', 'Check one threat at a time from cover.'],
      ['Repeating the same timing', 'Change the peek or ask a teammate to take the next look.'],
      ['Jump peeking when a quiet approach matters', 'Choose sound discipline when information is not urgent.'],
    ],
    drills: [
      { name: 'Cover timing', duration: '5 minutes', how: 'Practice one jump check from cover, then return to the same safe position.' },
    ],
    relatedIds: ['silent-walking-footsteps', 'crouch-peeking-crouch-usage'],
  },
  {
    id: 'crouch-peeking-crouch-usage',
    title: 'Crouch peeking and crouch usage',
    level: 'intermediate',
    summary: 'Use crouch deliberately instead of making every duel predictable.',
    video: { youtubeId: 'L0o6Xp0PYeQ', title: '', channel: '', ageNote: 'Crouching behavior can change between patches. Verify in game.', verifiedPatch: '' },
    steps: [
      'Use crouch when it changes your exposure or stabilizes a planned spray.',
      'Stand and move when you need speed or a less predictable target height.',
      'Choose a peek based on the angle and the opponent’s likely aim.',
    ],
    mistakes: [
      ['Crouching in every duel', 'Vary your stance so opponents cannot pre-aim one height.'],
      ['Crouching in a lane with no cover', 'Break line of sight before committing to a crouch.'],
      ['Holding crouch while repositioning', 'Release it when movement speed matters.'],
    ],
    drills: [
      { name: 'Stance choice', duration: '5 minutes', how: 'Practice the same angle standing and crouched, then choose based on the cover available.' },
    ],
    relatedIds: ['jump-peeking', 'repositioning-angle-discipline'],
  },
  {
    id: 'repositioning-angle-discipline',
    title: 'Repositioning and angle discipline',
    level: 'advanced',
    summary: 'Change your position after contact so opponents cannot read a pattern.',
    video: { youtubeId: 'dLU0Gin7UZc', title: '', channel: '', ageNote: 'This video covers holding angles and positioning, which is closely related but not identical to repositioning after contact.', verifiedPatch: '' },
    steps: [
      'After contact, leave the angle if the opponent has learned your position.',
      'Choose a nearby position with cover and a different line of sight.',
      'After a kill, expect a trade attempt and change your timing or angle.',
    ],
    mistakes: [
      ['Re-peeking the same angle immediately', 'Reposition before showing yourself again.'],
      ['Rotating without checking exposed lanes', 'Move between cover and clear one threat at a time.'],
      ['Repeating the same escape route', 'Vary the next position when the map allows it.'],
    ],
    drills: [
      { name: 'Contact and relocate', duration: '5 minutes', how: 'After each simulated contact, move to a second covered angle before re-engaging.' },
    ],
    relatedIds: ['silent-walking-footsteps', 'dead-zone-strafing'],
  },
];

const aliasesByMovementId = {
  'silent-walking-footsteps': ['shift walk', 'footsteps', 'walk', 'sound'],
  'dead-zone-strafing': ['deadzone', 'dead zone', 'adad'],
  'jump-peeking': ['jump peek', 'jumpscout'],
};
movementTechniques.forEach((technique) => { technique.aliases = aliasesByMovementId[technique.id] || []; });
const movementById = Object.fromEntries(movementTechniques.map((technique) => [technique.id, technique]));
const movementStoragePrefix = 'vguide-movement-';
const footstepRows = [
  ['Walk (Shift)', 'To verify in game', 'To verify in game', 'Quiet approach near contact'],
  ['Run', 'To verify in game', 'To verify in game', 'Safe rotations or urgent movement'],
  ['Crouch-walk', 'To verify in game', 'To verify in game', 'Slow repositioning; verify the trade-off'],
];

function MovementIcon({ techniqueId }) {
  const paths = {
    'silent-walking-footsteps': ['M7 3c-2 0-3 3-3 5s1 3 3 3 3-2 3-4-1-4-3-4Z', 'M16 13c-2 0-3 3-3 5s1 3 3 3 3-2 3-4-1-4-3-4Z'],
    'strafing-basics-short-strafes': ['M4 12h16', 'm8 8-4 4 4 4', 'm16 8 4 4-4 4'],
    'dead-zone-strafing': ['M12 5v14', 'M5 12h14', 'M8 8l8 8', 'M16 8l-8 8'],
    'jump-peeking': ['M3 18Q12 2 21 18', 'm16 15 5 3-3 4'],
    'crouch-peeking-crouch-usage': ['M4 19h16', 'M12 5v9', 'm8 10 4 4 4-4', 'M9 4h6'],
    'repositioning-angle-discipline': ['M20 11a8 8 0 0 0-14-5L4 8', 'M4 4v4h4', 'M4 13a8 8 0 0 0 14 5l2-2', 'M20 20v-4h-4'],
  };

  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[techniqueId].map((path) => <path key={path} d={path} />)}</svg>;
}

let youtubeIframeApiPromise;

function loadYouTubeIframeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!youtubeIframeApiPromise) {
    youtubeIframeApiPromise = new Promise((resolve, reject) => {
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        if (window.YT?.Player) resolve(window.YT);
        else reject(new Error('YouTube IFrame API was unavailable.'));
      };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => {
        youtubeIframeApiPromise = undefined;
        reject(new Error('YouTube IFrame API could not load.'));
      };
      document.head.appendChild(script);
    });
  }
  return youtubeIframeApiPromise;
}

function MovementVideo({ technique }) {
  const [autoPlayRequested] = useState(() => new URLSearchParams(window.location.search).get('play') === '1');
  const [loaded, setLoaded] = useState(autoPlayRequested);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const playerHostRef = useRef(null);
  const playerRef = useRef(null);
  const playbackRateRef = useRef(1);
  const video = technique.video;

  useEffect(() => {
    if (!loaded || !video.youtubeId || !playerHostRef.current) return undefined;
    let disposed = false;
    let player;

    loadYouTubeIframeApi().then((youtube) => {
      if (disposed || !playerHostRef.current) return;
      player = new youtube.Player(playerHostRef.current, {
        width: '100%',
        height: '100%',
        host: 'https://www.youtube-nocookie.com',
        videoId: video.youtubeId,
        playerVars: { autoplay: autoPlayRequested ? 1 : 0, controls: 1, enablejsapi: 1, origin: window.location.origin, playsinline: 1, rel: 0 },
        events: {
          onReady: (event) => {
            if (disposed) {
              event.target.destroy();
              return;
            }
            playerRef.current = event.target;
            setPlayerReady(true);
            if (autoPlayRequested) event.target.playVideo();
            if (playbackRateRef.current !== 1) event.target.setPlaybackRate(playbackRateRef.current);
          },
          onError: () => {
            if (!disposed) setPlayerError(true);
          },
        },
      });
    }).catch(() => {
      if (!disposed) setPlayerError(true);
    });

    return () => {
      disposed = true;
      player?.destroy();
      if (playerRef.current === player) playerRef.current = null;
    };
  }, [autoPlayRequested, loaded, video.youtubeId]);

  const changePlaybackRate = (rate) => {
    playbackRateRef.current = rate;
    setPlaybackRate(rate);
    playerRef.current?.setPlaybackRate(rate);
  };

  if (!video.youtubeId) {
    return (
      <>
        <div className="demo-frame demo-empty">
          <div className="demo-placeholder movement-video-placeholder" role="img" aria-label="Demo video coming soon">
            <MovementIcon techniqueId={technique.id} />
            <span>Demo video coming soon</span>
          </div>
        </div>
        {video.ageNote && <p className="movement-age-note">{video.ageNote}</p>}
      </>
    );
  }

  const fallbackThumbnail = `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`;
  return (
    <>
      <div className={`demo-frame movement-video-frame${loaded ? ' is-loaded' : ''}`}>
        {loaded ? (
          <>
            {!playerError && <div className="movement-youtube-host" ref={playerHostRef} />}
            {playerError && <p className="movement-video-error">Player unavailable. Watch on YouTube.</p>}
            {!playerReady && !playerError && <p className="movement-video-loading">Loading video...</p>}
          </>
        ) : (
          <>
            <img
              className="movement-video-thumbnail"
              src={`https://i.ytimg.com/vi/${video.youtubeId}/mqdefault.jpg`}
              onError={(event) => {
                if (event.currentTarget.src !== fallbackThumbnail) event.currentTarget.src = fallbackThumbnail;
              }}
              alt=""
            />
            <span className="movement-video-shade" aria-hidden="true" />
            <button className="movement-video-load" type="button" aria-label={`Load video: ${technique.title}`} onClick={() => setLoaded(true)}>
              <span className="play-symbol movement-play-symbol" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 6.5v11l9-5.5z" fill="currentColor" /></svg></span>
            </button>
          </>
        )}
      </div>
      {video.ageNote && <p className="movement-age-note">{video.ageNote}</p>}
      {loaded && playerReady && (
        <div className="speed-toggle" role="group" aria-label="Playback speed">
          <button type="button" aria-pressed={playbackRate === 1} onClick={() => changePlaybackRate(1)}>1x</button>
          <button type="button" aria-pressed={playbackRate === 0.5} onClick={() => changePlaybackRate(0.5)}>0.5x</button>
        </div>
      )}
      <a className="watch-video-link" href={`https://www.youtube.com/watch?v=${video.youtubeId}`} rel="noreferrer">Watch on YouTube</a>
    </>
  );
}

function MovementOverview() {
  const [filter, setFilter] = useState('all');
  const [practicedCount] = useState(() => readPracticeCount(movementTechniques, movementStoragePrefix));
  const levels = ['all', 'beginner', 'intermediate', 'advanced'];
  const visible = filter === 'all' ? movementTechniques : movementTechniques.filter((technique) => technique.level === filter);

  return (
    <div className="gunplay-site movement-site">
      <Header activeSection="movement" />
      <main className="gunplay-main">
        <div className="gunplay-intro">
          <p className="gunplay-eyebrow">The mechanics field guide</p>
          <div className="gunplay-intro-heading">
            <h1>Movement</h1>
            <p className="practice-summary"><strong>{practicedCount}</strong> of {movementTechniques.length} techniques practiced</p>
          </div>
          <p>Move quietly, stay hard to hit, and keep control of every fight.</p>
        </div>
        <div className="level-filters" role="group" aria-label="Filter movement techniques by level">
          {levels.map((level) => (
            <button key={level} type="button" aria-pressed={filter === level} onClick={() => setFilter(level)}>
              {level[0].toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
        <section className="technique-grid" aria-label="Movement techniques">
          {visible.map((technique) => {
            const order = movementTechniques.findIndex((item) => item.id === technique.id) + 1;
            const fallbackThumbnail = `https://i.ytimg.com/vi/${technique.video.youtubeId}/hqdefault.jpg`;
            return (
              <article className="technique-card" key={technique.id}>
                <span className={`technique-thumb${technique.video.youtubeId ? '' : ' movement-media-empty'}`}>
                  <span className="technique-order">{String(order).padStart(2, '0')}</span>
                  {order === 1 && <span className="technique-start">Start here</span>}
                  {technique.video.youtubeId ? (
                    <>
                      <img
                        loading="lazy"
                        src={`https://i.ytimg.com/vi/${technique.video.youtubeId}/mqdefault.jpg`}
                        onError={(event) => {
                          if (event.currentTarget.src !== fallbackThumbnail) event.currentTarget.src = fallbackThumbnail;
                        }}
                        alt=""
                      />
                      <button className="thumb-play movement-overview-play" type="button" aria-label={`Play ${technique.title} video`} onClick={() => { window.location.href = `/movement/${technique.id}?play=1`; }}><svg viewBox="0 0 24 24" focusable="false"><path d="M9 6.5v11l9-5.5z" fill="currentColor" /></svg></button>
                    </>
                  ) : <span className="movement-media-icon"><MovementIcon techniqueId={technique.id} /></span>}
                </span>
                <a className="movement-card-content-link" href={`/movement/${technique.id}`}>
                  <span className="technique-card-body">
                    <span className="technique-card-badges">{difficultyIndicator(technique.level)}</span>
                    <strong>{technique.title}</strong>
                    <span className="technique-summary">{technique.summary}</span>
                  </span>
                </a>
              </article>
            );
          })}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function FootstepReference() {
  return (
    <section className="movement-reference" aria-labelledby="footstep-reference-title">
      <h2 id="footstep-reference-title">Footstep sound reference</h2>
      <div className="footstep-table-wrap">
        <table className="footstep-table">
          <thead><tr><th scope="col">Movement</th><th scope="col">Makes noise?</th><th scope="col">Heard by enemies?</th><th scope="col">Use when</th></tr></thead>
          <tbody>{footstepRows.map(([movement, noise, heard, use]) => <tr key={movement}><th scope="row">{movement}</th><td>{noise}</td><td>{heard}</td><td>{use}</td></tr>)}</tbody>
        </table>
      </div>
      <p className="movement-verification-note">Sound values are marked “To verify in game” until checked on the current patch.</p>
    </section>
  );
}

function MovementDetail({ technique }) {
  const [done, setDone] = useState({});
  const index = movementTechniques.findIndex((item) => item.id === technique.id);
  const previous = movementTechniques[(index - 1 + movementTechniques.length) % movementTechniques.length];
  const next = movementTechniques[(index + 1) % movementTechniques.length];
  const related = technique.relatedIds.map((id) => movementById[id]).filter(Boolean);
  const relatedGunplay = (technique.relatedGunplayIds || []).map((id) => gunplayTechniques.find((item) => item.id === id)).filter(Boolean);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`${movementStoragePrefix}${technique.id}`);
      if (saved) setDone(JSON.parse(saved));
    } catch {
      setDone({});
    }
  }, [technique.id]);

  const markDone = (drillIndex, checked) => {
    const updated = { ...done, [drillIndex]: checked };
    setDone(updated);
    try {
      localStorage.setItem(`${movementStoragePrefix}${technique.id}`, JSON.stringify(updated));
    } catch {
      // Keep the checklist usable when storage is unavailable.
    }
  };

  return (
    <div className="gunplay-site movement-site">
      <Header activeSection="movement" />
      <main className="technique-detail">
        <aside className="demo-column">
          <MovementVideo technique={technique} />
          {difficultyIndicator(technique.level)}
          <a className="back-link" href="/movement">Back to movement</a>
        </aside>
        <article className="technique-copy">
          <header className="technique-heading">
            <h1>{technique.title}</h1>
            <span className="title-underline" />
            <p>{technique.summary}</p>
            <p className={`movement-verification${technique.video.verifiedPatch ? ' is-verified' : ''}`}>
              {technique.video.verifiedPatch ? `Verified on patch ${technique.video.verifiedPatch}` : 'Needs verification'}
            </p>
          </header>
          <section className="technique-section">
            <h2>How to do it</h2>
            <ol>{technique.steps.map((step) => <li key={step}>{step}</li>)}</ol>
          </section>
          <section className="technique-section">
            <h2>Common mistakes</h2>
            <ul className="mistake-cards">{technique.mistakes.map(([mistake, fix]) => <li key={mistake}><strong>{mistake}</strong><span>{fix}</span></li>)}</ul>
          </section>
          {technique.id === 'silent-walking-footsteps' && <FootstepReference />}
          <section className="technique-section">
            <h2>Practice</h2>
            <div className="drill-grid">
              {technique.drills.map((drill, drillIndex) => (
                <label className={`drill-card${done[drillIndex] ? ' is-done' : ''}`} key={drill.name}>
                  <input type="checkbox" checked={!!done[drillIndex]} onChange={(event) => markDone(drillIndex, event.target.checked)} />
                  <span className="drill-copy"><strong>{drill.name}</strong><small>{drill.duration}</small><span>{drill.how}</span></span>
                </label>
              ))}
            </div>
          </section>
          {related.length > 0 && <section className="technique-section"><h2>Related movement techniques</h2><div className="related-links">{related.map((item) => <a key={item.id} href={`/movement/${item.id}`}>{item.title}</a>)}</div></section>}
          {relatedGunplay.length > 0 && <section className="technique-section"><h2>Related gunplay techniques</h2><div className="related-links">{relatedGunplay.map((item) => <a key={item.id} href={`/gunplay/${item.id}`}>{item.title}</a>)}</div></section>}
          <nav className="technique-pager" aria-label="Previous and next movement techniques">
            <a href={`/movement/${previous.id}`}>Previous <strong>{previous.title}</strong></a>
            <a href={`/movement/${next.id}`}>Next: <strong>{next.title}</strong></a>
          </nav>
        </article>
      </main>
      <Footer />
    </div>
  );
}

export default function Movement() {
  const path = decodeURIComponent(window.location.pathname).replace(/\/$/, '');
  const id = path.split('/')[2];
  const technique = movementById[id];

  if (id && !technique) {
    return <div className="gunplay-site movement-site"><Header activeSection="movement"/><main className="gunplay-main"><h1>Technique not found</h1><a className="back-link" href="/movement">Back to movement</a></main><Footer/></div>;
  }

  return technique ? <MovementDetail technique={technique} /> : <MovementOverview />;
}