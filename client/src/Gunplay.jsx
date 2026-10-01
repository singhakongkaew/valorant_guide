import { useEffect, useRef, useState } from 'react';
import { SearchButton } from './Search.jsx';

// Add techniques here; overview cards, detail routes, and related links read from this list.
export const techniques = [
  { id:'crosshair-placement', title:'Crosshair placement', level:'beginner', video:{youtubeId:'PL4oclKpPAA',title:'Crosshair placement fundamentals',channel:'',ageNote:'',verifiedPatch:'10.08'}, summary:'Keep your crosshair at head height and aimed where an opponent is most likely to appear.', demo:'', steps:['Set your crosshair at head height before you reach an angle. Use doors, boxes, and the horizon as height references.','Aim at the edge where an opponent could appear, leaving only a small adjustment when they swing.','As you move, guide your crosshair along likely positions instead of looking at the floor or wall.','After each kill or rotation, reset your aim to the next likely threat.'], mistakes:[['Aiming at the floor while moving','Use a fixed map feature to reset to head height.'],['Keeping the crosshair on the wall edge','Hold a small distance from the edge based on how quickly you are moving.'],['Watching an angle your teammate already covers','Ask for coverage and aim at the next uncovered position.']], drills:[{name:'Head-height route',duration:'5 minutes',how:'In a custom game, walk a familiar route and keep your crosshair at head height. Pause at each doorway and pre-aim the next angle.'},{name:'Corner callouts',duration:'5 minutes',how:'Use the Range or a custom map. Before each corner, name the likely opponent position and place your crosshair there before moving.'}], relatedIds:['counter-strafing','peeking','first-bullet-accuracy'] },
  { id:'counter-strafing', title:'Counter-strafing', level:'beginner', video:{youtubeId:'qOjpZFBv9vk',title:'Counter-strafing tutorial',channel:'',ageNote:'',verifiedPatch:'10.08'}, summary:'Stop your movement before firing so the first bullet lands where you intend.', demo:'', steps:['Move toward the angle with A or D. Keep your crosshair at the expected head position.','Release the movement key and briefly tap the opposite direction to stop sooner.','Fire a single shot only after your movement has settled.','Repeat the move, stop, and shoot rhythm at a steady pace; accuracy matters more than speed.'], mistakes:[['Firing while still drifting','Wait for the stop before clicking; use a wall or target to check your accuracy.'],['Holding both movement keys too long','Tap the opposite key briefly, then release it.'],['Crouching to hide inaccurate movement','Practice the stop and shot rhythm standing up first.']], drills:[{name:'Wall taps',duration:'5 minutes',how:'In the Range, strafe left and right, counter-strafe, and fire one bullet at a time. Reset your aim after every shot.'},{name:'Bot stop shots',duration:'5 minutes',how:'Use the Range bots. Move between shots and fire only after each clean stop. Slow down whenever shots spread.'}], relatedIds:['crosshair-placement','burst-tap-fire','peeking'] },
  { id:'recoil-and-spray-control', title:'Recoil and spray control', level:'intermediate', video:{youtubeId:'17Ir7mCv9D8',title:'Recoil and spray control tutorial',channel:'',ageNote:'Recorded about 5 years ago. Weapon values may have changed since.',verifiedPatch:'10.08'}, summary:'Learn when to commit to a spray and how to manage sustained fire.', demo:'', steps:['Start at close range and fire a full magazine at a wall to observe the weapon pattern.','Pull your mouse gradually against the upward climb; make small corrections as the pattern shifts.','At longer ranges, stop the spray after a short burst and reset your aim.'], mistakes:[['Spraying at long range','Use taps or short bursts when the target is far away.'],['Pulling down too sharply','Use smaller, smoother corrections and review your wall pattern.']], drills:[{name:'Pattern check',duration:'5 minutes',how:'Fire 25 rounds at a wall from a fixed position, then compare your control with the sample pattern.'},{name:'Range burst reset',duration:'5 minutes',how:'Shoot short bursts at distant targets and pause between bursts until your aim settles.'}], relatedIds:['burst-tap-fire','counter-strafing','first-bullet-accuracy'] },
  { id:'burst-tap-fire', title:'Burst and tap fire', level:'beginner', video:{youtubeId:'OINm1ev_pf4',title:'Burst and tap fire tutorial',channel:'',ageNote:'Recorded about 5 years ago. Weapon values may have changed since.',verifiedPatch:'10.08'}, summary:'Choose single shots or short bursts to keep your weapon accurate.', demo:'', steps:['Use single taps for distant targets and short bursts at medium range.','Pause briefly between bursts to let accuracy recover.','Keep your crosshair at head level and avoid extending a burst when the target is far away.'], mistakes:[['Holding fire after missing the first bullets','Release, reset your aim, then fire again.'],['Tapping too quickly','Leave enough time for the weapon to recover.']], drills:[{name:'Range distance ladder',duration:'5 minutes',how:'Shoot targets at increasing distances, switching from bursts to single taps as distance grows.'}], relatedIds:['first-bullet-accuracy','recoil-and-spray-control','counter-strafing'] },
  { id:'peeking', title:'Peeking: wide, jiggle, shoulder', level:'intermediate', video:{youtubeId:'qGc3W2SAl60',title:'Peeking tutorial',channel:'',ageNote:'',verifiedPatch:'10.08'}, summary:'Use different peek widths to gather information, bait a shot, or take a fight.', demo:'', steps:['Choose a peek based on your goal: shoulder to bait, jiggle to check, or wide to clear an angle.','Avoid exposing yourself to several held angles at once.','Coordinate your peek with a teammate or utility when possible.'], mistakes:[['Repeating the same peek','Change timing, width, or approach after being seen.'],['Wide swinging multiple angles','Clear one threat at a time with cover and teammate support.']], drills:[{name:'Peek and reset',duration:'5 minutes',how:'In a custom game, practice shoulder, jiggle, and wide peeks around one corner. Return to cover after each one.'}], relatedIds:['crosshair-placement','counter-strafing','first-bullet-accuracy'] },
  { id:'first-bullet-accuracy', title:'First bullet accuracy', level:'advanced', video:{youtubeId:'qOjpZFBv9vk',title:'First bullet accuracy tutorial',channel:'',ageNote:'',verifiedPatch:'10.08',sharedWith:'counter-strafing'}, summary:'Create a clean first shot by settling your movement and aim before firing.', demo:'', steps:['Settle behind cover and pre-aim the target position.','Stop moving and make one deliberate adjustment.','Fire one shot, then return to cover or reset your aim.'], mistakes:[['Firing during a movement transition','Wait until the weapon is accurate again before taking the shot.'],['Over-correcting your aim','Use a small controlled adjustment and take the shot when aligned.']], drills:[{name:'Single-shot reset',duration:'5 minutes',how:'In the Range, fire one accurate shot per target. Pause and reset your aim between targets.'}], relatedIds:['crosshair-placement','burst-tap-fire','counter-strafing'] },
];
const aliasesByTechnique = {
  'crosshair-placement': ['pre-aim', 'preaim', 'head level', 'aim height'],
  'counter-strafing': ['counterstrafe', 'counter strafe', 'stop shooting', 'accuracy while moving'],
  peeking: ['jiggle', 'shoulder peek', 'wide swing', 'wide peek', 'ferrari'],
  'recoil-and-spray-control': ['spray', 'recoil', 'spray pattern', 'pull down'],
  'burst-tap-fire': ['tap', 'tapping', 'burst', 'bursting'],
};
techniques.forEach((technique) => { technique.aliases = aliasesByTechnique[technique.id] || []; });
const byId = Object.fromEntries(techniques.map(item => [item.id,item]));
const patch = '10.08';
const badge = level => <span className={`level-badge level-${level}`}><span aria-hidden="true">{level === 'beginner' ? '[B]' : level === 'intermediate' ? '[I]' : '[A]'}</span> {level}</span>;
const levelRank = { beginner: 1, intermediate: 2, advanced: 3 };
export const difficultyIndicator = level => <span className="card-level" aria-label={`${level} difficulty`}><span className="card-level-bars" aria-hidden="true">{[1, 2, 3].map(bar => <i key={bar} className={bar <= levelRank[level] ? 'filled' : ''} />)}</span><span className="card-level-name">{level}</span></span>;
export function readPracticeCount(guideTechniques, storagePrefix) {
  try {
    return guideTechniques.filter((technique) => {
      const saved = localStorage.getItem(`${storagePrefix}${technique.id}`);
      if (!saved) return false;
      const checkedDrills = JSON.parse(saved);
      return checkedDrills !== null && typeof checkedDrills === 'object' && Object.values(checkedDrills).some(Boolean);
    }).length;
  } catch {
    return 0;
  }
}
export function Header({ activeSection = 'gunplay' }) { return <header className="topbar"><a className="brand" href="/" aria-label="V/GUIDE home">V<span>/</span>GUIDE</a><nav className="nav" aria-label="Main navigation"><a href="/" aria-current={activeSection === 'agents' ? 'page' : undefined}>Agents</a><a href="/gunplay" aria-current={activeSection === 'gunplay' ? 'page' : undefined}>Gunplay</a><a href="/movement" aria-current={activeSection === 'movement' ? 'page' : undefined}>Movement</a></nav><div className="actions"><SearchButton /></div></header>; }
export function Footer() { return <footer className="gunplay-footer">Last checked on patch <span>{patch}</span></footer>; }
function SprayViewer() {
  const canvasRef = useRef(null); const [weapon,setWeapon] = useState('Vandal'); const [count,setCount] = useState(25); const [playing,setPlaying] = useState(false);
  // Sample coordinates only; replace with verified in-game weapon data.
  const patterns = { Vandal:[[0,0],[-2,4],[1,8],[-3,12],[2,16],[-5,20],[1,24],[-4,28],[4,32],[-2,36],[5,40],[-5,44],[3,48],[-6,52],[0,56],[7,60],[-3,64],[5,68],[-7,72],[1,76],[8,80],[-5,84],[4,88],[-8,92],[0,96]], Phantom:[[0,0],[1,4],[-1,8],[2,12],[-2,16],[3,20],[-1,24],[4,28],[-3,32],[3,36],[-4,40],[4,44],[-2,48],[5,52],[-5,56],[2,60],[-4,64],[6,68],[-3,72],[4,76],[-6,80],[5,84],[-2,88],[3,92],[-4,96]], Sheriff:[[0,0],[0,4],[1,8],[-1,12],[1,16],[-1,20],[2,24],[-2,28],[1,32],[-1,36],[2,40],[-2,44],[1,48],[-1,52],[2,56],[-2,60],[1,64],[-1,68],[2,72],[-2,76],[1,80],[-1,84],[2,88],[-2,92],[1,96]] };
  useEffect(() => { const canvas=canvasRef.current;if(!canvas)return;const ctx=canvas.getContext('2d');const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.strokeStyle='#363636';ctx.beginPath();ctx.moveTo(w/2,12);ctx.lineTo(w/2,h-12);ctx.stroke();patterns[weapon].slice(0,count).forEach(([x,y],i)=>{const px=w/2+x*5,py=18+y*2.1;ctx.fillStyle='#ff4655';ctx.beginPath();ctx.arc(px,py,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='9px Inter';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(i+1),px,py);}); },[weapon,count]);
  useEffect(()=>{if(!playing)return;const id=window.setInterval(()=>setCount(n=>n>=25?(setPlaying(false),25):n+1),100);return()=>clearInterval(id)},[playing]);
  return <section className="spray-viewer" aria-labelledby="spray-title"><h2 id="spray-title">Spray pattern viewer</h2><p className="sample-note">Sample data: placeholder coordinates to be replaced with verified values.</p><label className="weapon-select">Weapon <select value={weapon} onChange={e=>{setWeapon(e.target.value);setCount(25)}}><option>Vandal</option><option>Phantom</option><option>Sheriff</option></select></label><canvas ref={canvasRef} width="360" height="250" aria-label={`${weapon} sample spray pattern showing bullets 1 to ${count}`} /><button className="gunplay-primary" type="button" onClick={()=>{setCount(0);setPlaying(true)}}>Replay</button></section>;
}
function CrosshairDiagram(){return <figure className="crosshair-diagram"><div className="map-placeholder" role="img" aria-label="Illustrative map corner with a head-height guide"><span className="head-line"/><span className="crosshair correct">+</span><span className="crosshair incorrect">+</span></div><figcaption><span><b className="correct-key">+</b> Correct: head height, near the angle</span><span><b className="incorrect-key">+</b> Incorrect: too low and too far out</span></figcaption></figure>}
function GunplayOverview() {
  const [filter, setFilter] = useState('all');
  const [practicedCount] = useState(() => readPracticeCount(techniques, 'vguide-gunplay-'));
  const levels = ['all', 'beginner', 'intermediate', 'advanced'];
  const visible = filter === 'all' ? techniques : techniques.filter((technique) => technique.level === filter);

  return (
    <div className="gunplay-site">
      <Header />
      <main className="gunplay-main">
        <div className="gunplay-intro">
          <p className="gunplay-eyebrow">The mechanics field guide</p>
          <div className="gunplay-intro-heading">
            <h1>Gunplay</h1>
            <p className="practice-summary"><strong>{practicedCount}</strong> of {techniques.length} techniques practiced</p>
          </div>
          <p>Build reliable aim with clear shooting techniques and focused practice.</p>
        </div>
        <div className="level-filters" role="group" aria-label="Filter techniques by level">
          {levels.map((level) => (
            <button key={level} type="button" aria-pressed={filter === level} onClick={() => setFilter(level)}>
              {level[0].toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
        <section className="technique-grid" aria-label="Gunplay techniques">
          {visible.map((technique) => {
            const order = techniques.findIndex((item) => item.id === technique.id) + 1;
            const fallbackThumbnail = `https://i.ytimg.com/vi/${technique.video.youtubeId}/hqdefault.jpg`;
            return (
              <a className="technique-card" key={technique.id} href={`/gunplay/${technique.id}`}>
                <span className="technique-thumb">
                  <span className="technique-order">{String(order).padStart(2, '0')}</span>
                  {order === 1 && <span className="technique-start">Start here</span>}
                  <img
                    loading="lazy"
                    src={`https://i.ytimg.com/vi/${technique.video.youtubeId}/mqdefault.jpg`}
                    onError={(event) => {
                      if (event.currentTarget.src !== fallbackThumbnail) event.currentTarget.src = fallbackThumbnail;
                    }}
                    alt=""
                  />
                  <span className="thumb-play" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                      <path d="M9 6.5v11l9-5.5z" fill="currentColor" />
                    </svg>
                  </span>
                </span>
                <span className="technique-card-body">
                  <span className="technique-card-badges">
                    {difficultyIndicator(technique.level)}
                    {technique.video.sharedWith && <span className="video-shared-label">Shared video</span>}
                  </span>
                  <strong>{technique.title}</strong>
                  <span className="technique-summary">{technique.summary}</span>
                </span>
              </a>
            );
          })}
        </section>
      </main>
      <Footer />
    </div>
  );
}
function TechniqueDetail({technique}){const [slow,setSlow]=useState(false),[playReady,setPlayReady]=useState(false),[done,setDone]=useState({});const [videoFailed,setVideoFailed]=useState(false);const videoRef=useRef(null);
  useEffect(()=>{try{const saved=localStorage.getItem(`vguide-gunplay-${technique.id}`);if(saved)setDone(JSON.parse(saved))}catch{ /* storage is optional */ }},[technique.id]);
  const markDone=(index,checked)=>{const next={...done,[index]:checked};setDone(next);try{localStorage.setItem(`vguide-gunplay-${technique.id}`,JSON.stringify(next))}catch{ /* keep this page usable without storage */ }};
  useEffect(()=>{if(videoRef.current)videoRef.current.playbackRate=slow?0.5:1},[slow,technique.demo]);
  const reduced=typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const related=technique.relatedIds.map(id=>byId[id]).filter(Boolean).slice(0,3);const index=techniques.findIndex(t=>t.id===technique.id);const prev=techniques[(index-1+techniques.length)%techniques.length],next=techniques[(index+1)%techniques.length];
  return <div className="gunplay-site"><Header detail/><main className="technique-detail"><aside className="demo-column"><div className={`demo-frame${(!technique.demo&&!technique.video.youtubeId)||(videoFailed&&!technique.video.youtubeId)?' demo-empty':''}`}>{technique.demo&&!videoFailed?<><video ref={videoRef} key={technique.demo} src={technique.demo} poster="/gunplay-demo-poster.svg" controls loop muted playsInline preload="metadata" aria-label={`${technique.title} demonstration`} onError={()=>setVideoFailed(true)}/>{reduced&&!playReady&&<button className="demo-play" onClick={()=>{setPlayReady(true);videoRef.current?.play().catch(()=>{})}}>Play demo</button>}</>:technique.video.youtubeId?<iframe src={`https://www.youtube-nocookie.com/embed/${technique.video.youtubeId}`} title={technique.video.title||`${technique.title} demonstration`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/>:<div className="demo-placeholder" role="img" aria-label={`${technique.title} demonstration placeholder`}><span className="play-symbol" aria-hidden="true">PLAY</span><span>Demo clip coming soon</span></div>}</div>{technique.video.youtubeId&&<a className="watch-video-link" href={`https://www.youtube.com/watch?v=${technique.video.youtubeId}`} rel="noreferrer">Watch on YouTube</a>}{technique.demo&&<div className="speed-toggle" role="group" aria-label="Playback speed"><button aria-pressed={!slow} onClick={()=>setSlow(false)}>1x</button><button aria-pressed={slow} onClick={()=>setSlow(true)}>0.5x</button></div>}{badge(technique.level)}<a className="back-link" href="/gunplay">Back to gunplay</a></aside><article className="technique-copy"><header className="technique-heading"><h1>{technique.title}</h1><span className="title-underline"/><p>{technique.summary}</p></header><section className="technique-section"><h2>How to do it</h2><ol>{technique.steps.map((step,i)=><li key={i}>{step}</li>)}</ol></section><section className="technique-section"><h2>Common mistakes</h2><ul className="mistake-cards">{technique.mistakes.map(([mistake,fix],i)=><li key={i}><strong>{mistake}</strong><span>{fix}</span></li>)}</ul></section>{technique.id==='recoil-and-spray-control'&&<SprayViewer/>}{technique.id==='crosshair-placement'&&<CrosshairDiagram/>}<section className="technique-section"><h2>Practice</h2><div className="drill-grid">{technique.drills.map((drill,i)=><label className={`drill-card${done[i]?' is-done':''}`} key={drill.name}><input type="checkbox" checked={!!done[i]} onChange={e=>markDone(i,e.target.checked)}/><span className="drill-copy"><strong>{drill.name}</strong><small>{drill.duration}</small><span>{drill.how}</span></span></label>)}</div></section><section className="technique-section"><h2>Related techniques</h2><div className="related-links">{related.map(t=><a key={t.id} href={`/gunplay/${t.id}`}>{t.title} </a>)}</div></section><nav className="technique-pager" aria-label="Previous and next techniques"><a href={`/gunplay/${prev.id}`}>Previous <strong>{prev.title}</strong></a><a href={`/gunplay/${next.id}`}>Next: <strong>{next.title}</strong></a></nav></article></main><Footer/></div>}
export default function Gunplay(){const path=decodeURIComponent(window.location.pathname).replace(/\/$/,'');const id=path.split('/')[2];const technique=byId[id];if(id&&!technique)return <div className="gunplay-site"><Header/><main className="gunplay-main"><h1>Technique not found</h1><a className="back-link" href="/gunplay">Back to gunplay</a></main><Footer/></div>;return technique?<TechniqueDetail technique={technique}/>:<GunplayOverview/>}

