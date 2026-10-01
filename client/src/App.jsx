import { useCallback, useEffect, useRef, useState } from 'react';
import { SearchButton } from './Search.jsx';
import GekkoArt from '../../image/download (1).jpg';
import NeonArt from '../../image/VALORENT AGENT _ NEON.jpg';
import RazeArt from '../../image/VALORENT AGENT _ RAZE.jpg';
import ReynaArt from '../../image/VALORENT AGENT _ RENA.jpg';
import BreachArt from '../../image/VALORENT AGENT _ BREACH.jpg';
import KilljoyArt from '../../image/VALORENT AGENT _ KILLJOY.jpg';
import FadeArt from '../../image/VALORENT AGENT _ FADE.jpg';
import JettArt from '../../image/VALORENT AGENT _ JETT.jpg';
import PhoenixArt from '../../image/VALORENT AGENT _ PHOENIX.jpg';
import SageArt from '../../image/VALORENT AGENT _ SAGE.jpg';
import SovaArt from '../../image/VALORENT AGENT _ SOVA.jpg';
import ViperArt from '../../image/VALORENT AGENT _ VIPER.jpg';

const TOKEN_KEY = 'valorant-guide-token';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Swap each gradient in `image` for an image URL when agent artwork is ready.
export const agents = [
  { name: 'Jett', role: 'Duelist', description: 'Fast entries and aggressive plays.', color: '#536b80', image: JettArt, abilities: [['C', 'Cloudburst', 'Cloudburst cuts sightlines and creates space.'], ['Q', 'Updraft', 'Updraft lifts Jett to unexpected angles.'], ['E', 'Tailwind', 'Tailwind gives Jett a quick dash.'], ['X', 'Blade Storm', 'Blade Storm rewards precise, mobile aim.']] },
  { name: 'Sage', role: 'Sentinel', description: 'Hold ground and keep your team in the fight.', color: '#477d7b', image: SageArt, abilities: [['C', 'Barrier Orb', 'Barrier Orb creates a wall that blocks routes and protects a position.'], ['Q', 'Slow Orb', 'Slow Orb makes pushes easier to punish.'], ['E', 'Healing Orb', 'Healing Orb restores an ally or Sage.'], ['X', 'Resurrection', 'Resurrection brings a fallen teammate back.']] },
  { name: 'Phoenix', role: 'Duelist', description: 'Take space with flashes, fire, and confidence.', color: '#9a5f42', image: PhoenixArt, abilities: [['C', 'Blaze', 'Blaze creates a wall that blocks and damages.'], ['Q', 'Curveball', 'Curveball flashes around corners.'], ['E', 'Hot Hands', 'Hot Hands damages enemies and heals Phoenix.'], ['X', 'Run It Back', 'Run It Back lets Phoenix take a second fight.']] },
  { name: 'Sova', role: 'Initiator', description: 'Find opponents and set up clean engagements.', color: '#517391', image: SovaArt, abilities: [['C', 'Owl Drone', 'Owl Drone scouts ahead and marks a target.'], ['Q', 'Shock Bolt', 'Shock Bolt pressures common positions.'], ['E', 'Recon Bolt', 'Recon Bolt reveals enemies in its line of sight.'], ["X", "Hunter's Fury", "Hunter's Fury strikes through cover."]] },
  { name: 'Killjoy', role: 'Sentinel', description: 'Secure sites with smart setups and utility.', color: '#8d8058', image: KilljoyArt, abilities: [['C', 'Nanoswarm', 'Nanoswarm punishes enemies who enter its radius.'], ['Q', 'Alarmbot', 'Alarmbot hunts and weakens nearby enemies.'], ['E', 'Turret', 'Turret watches a lane and chips at opponents.'], ['X', 'Lockdown', 'Lockdown detains enemies caught in its field.']] },
  { name: 'Gekko', role: 'Initiator', description: 'Use a crew of creatures to clear and take space.', color: '#76934e', image: GekkoArt, abilities: [['C', 'Mosh Pit', 'Mosh Pit damages enemies caught in its blast.'], ['Q', 'Wingman', 'Wingman concusses enemies or plants and defuses.'], ['E', 'Dizzy', 'Dizzy blinds enemies in its line of sight.'], ['X', 'Thrash', 'Thrash hunts and detains an enemy.']] },
  { name: 'Neon', role: 'Duelist', description: 'Sprint into fights and disrupt angles at speed.', color: '#4482a8', image: NeonArt, abilities: [['C', 'Fast Lane', 'Fast Lane creates cover as Neon pushes forward.'], ['Q', 'Relay Bolt', 'Relay Bolt concusses enemies around its bounces.'], ['E', 'High Gear', 'High Gear lets Neon sprint and slide.'], ['X', 'Overdrive', 'Overdrive fires a precise stream of energy.']] },
  { name: 'Raze', role: 'Duelist', description: 'Break setups and clear space with explosive force.', color: '#a7633d', image: RazeArt, abilities: [['C', 'Boom Bot', 'Boom Bot tracks and explodes near enemies.'], ['Q', 'Blast Pack', 'Blast Pack launches Raze or damages nearby enemies.'], ['E', 'Paint Shells', 'Paint Shells split into smaller explosive charges.'], ['X', 'Showstopper', 'Showstopper fires a powerful rocket.']] },
  { name: 'Reyna', role: 'Duelist', description: 'Win duels and turn picks into momentum.', color: '#8c496b', image: ReynaArt, abilities: [['C', 'Leer', 'Leer blinds enemies who look toward it.'], ['Q', 'Devour', 'Devour consumes a soul orb to heal Reyna.'], ['E', 'Dismiss', 'Dismiss consumes a soul orb to evade danger.'], ['X', 'Empress', 'Empress boosts combat and refreshes soul abilities.']] },
  { name: 'Breach', role: 'Initiator', description: 'Disrupt defenders through walls and tight angles.', color: '#a45d41', image: BreachArt, abilities: [['C', 'Aftershock', 'Aftershock blasts through a wall.'], ['Q', 'Flashpoint', 'Flashpoint blinds enemies through cover.'], ['E', 'Fault Line', 'Fault Line sends a concussive seismic blast.'], ['X', 'Rolling Thunder', 'Rolling Thunder knocks down enemies in its path.']] },
  { name: 'Fade', role: 'Initiator', description: 'Track targets and pressure them out of hiding.', color: '#615276', image: FadeArt, abilities: [['C', 'Prowler', 'Prowler hunts and nearsights enemies.'], ['Q', 'Seize', 'Seize tethers enemies in its radius.'], ['E', 'Haunt', 'Haunt reveals enemies caught in its sight.'], ['X', 'Nightfall', 'Nightfall marks and deafens enemies it reaches.']] },
  { name: 'Viper', role: 'Controller', description: 'Cut sightlines and control space with toxic cover.', color: '#487759', image: ViperArt, abilities: [['C', 'Snake Bite', 'Snake Bite damages and weakens enemies.'], ['Q', 'Poison Cloud', 'Poison Cloud creates a toxin smoke.'], ['E', 'Toxic Screen', 'Toxic Screen divides the site with a toxin wall.'], ["X", "Viper's Pit", "Viper's Pit clouds a large area in toxin."]] },
];

const wrap = (index, length) => (index % length + length) % length;
const getCardAtPoint = (container, x, y) => [...container.querySelectorAll('.agent-card')]
  .filter((item) => {
    const rect = item.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
      && Number(getComputedStyle(item).opacity) > 0
      && Number(getComputedStyle(item.parentElement).opacity) > 0;
  })
  .sort((left, right) => Number(getComputedStyle(right).zIndex) - Number(getComputedStyle(left).zIndex))[0] ?? null;

const expandedData = {
  Jett: {
    summary: 'Jett creates first contact with speed, then escapes before opponents can trade her. Coordinate each entry and keep an exit route for every aggressive peek.', difficulty: 3,
    abilities: [
      ['Cloudburst', 'Break sightlines with a fast, short-lived smoke.', 'Steer the projectile around a corner to cover a crossing or isolate one angle.', ['Curve it around the corner you plan to cross.', 'Use it to break one sightline, not cover a whole site.', 'Pair it with Tailwind for a quick exit.'], ['You need to cross a watched lane.', 'You want to isolate one angle during entry.'], 'Avoid smoking a space your team needs to see or leaving yourself without an exit.'],
      ['Updraft', 'Reach elevated angles and change your entry path.', 'Jett launches upward to reach vertical positions. Sound and limited air control make the landing spot important.', ['Pair height with a smoke.', 'Use it to clear a known close angle.', 'Coordinate with a teammate’s flash or scan.'], ['A vertical angle breaks a common hold.', 'You need to cross low cover on a coordinated hit.'], 'Avoid jumping into several held angles without team support.'],
      ['Tailwind', 'Dash out of danger or through a prepared entry.', 'Activate to prepare the dash, then trigger it within the short window. A kill refreshes the dash during its active period.', ['Activate before exposing yourself.', 'Use smoke or teammate utility to cover the path.', 'Plan a safe destination before taking the duel.'], ['You have utility support for first contact.', 'You need to escape after a risky peek.'], 'Avoid dry dashing before teammates can trade or follow.'],
      ['Blade Storm', 'Take precise fights with a mobile set of knives.', 'Throw accurate knives that refresh on a kill. Primary fire throws one; alternate fire throws the remaining knives in a close-range burst.', ['Use primary fire at range.', 'Save alternate fire for close duels.', 'Pair knives with an eco round.'], ['You can take a supported opening duel.', 'Your team needs a strong low-cost round.'], 'Avoid a close-range burst into a long sightline.'],
    ],
    mistakes: [['Dashing before the team is ready', 'Call the entry and wait for utility.'], ['Taking a duel without an exit', 'Plan cover or a dash destination first.'], ['Using Updraft in full view', 'Pair height with cover or a distraction.'], ['Holding Cloudburst too long', 'Use it to cross or isolate a real threat.']],
    combos: [['Sage', 'Sage slows a route so Jett can take a safer, predictable entry duel.'], ['Sova', 'A reveal gives Jett a clear dash target and limits surprise angles.'], ['Breach’s stun and flash create a window for Jett to enter first.']], maps: [['Ascent', 'Dash through mid smokes to pressure the site divide.'], ['Haven', 'Fast rotations punish gaps between three sites.'], ['Icebox', 'Vertical routes create useful off-angle entries.']],
  },
  Sage: {
    summary: 'Sage slows the pace of a round, seals routes, and keeps a teammate in the fight. Her strongest value comes from timing utility around a coordinated hold or retake.', difficulty: 2,
    abilities: [
      ['Barrier Orb', 'Seal a route or protect a vulnerable plant.', 'Place a durable wall that blocks movement and sightlines. Its segments can be broken, so use it to buy time rather than assume a route is permanently closed.', ['Place it before contact when possible.', 'Angle segments to limit multiple sightlines.', 'Listen for damage to know when it is pressured.'], ['You need to delay a choke.', 'Your team needs safe plant or defuse space.'], 'Avoid walling off teammates or giving opponents a predictable wall to pre-fire.'],
      ['Slow Orb', 'Make a push loud, slow, and easier to punish.', 'Throw an orb to create a slowing field. Enemies moving through it become easier to hear and less able to cross quickly.', ['Bounce it around cover to deny a close swing.', 'Pair it with a teammate watching the route.', 'Save one for a likely retake or flank.'], ['You hear a coordinated rush.', 'You need to delay a defuse or retake.'], 'Avoid throwing it after enemies have crossed the choke.'],
      ['Healing Orb', 'Restore health to yourself or a teammate.', 'Target an injured ally or yourself when safe. Healing takes time, so move behind cover first.', ['Heal after a fight when the angle is safe.', 'Prioritize an ally who can rejoin quickly.', 'Call the heal so your ally avoids another duel.'], ['A teammate survives a trade at low health.', 'You can safely recover between engagements.'], 'Avoid healing in the open or during an urgent site hold.'],
      ['Resurrection', 'Bring a fallen teammate back into the round.', 'Resurrect a nearby dead ally after creating a safe window. The revived player is vulnerable during the animation.', ['Clear nearby angles first.', 'Ask a teammate to cover the revive.', 'Revive a player with useful weapons or ultimate value.'], ['A safe post-plant gives you time.', 'A protected retake can restore numbers.'], 'Avoid reviving in a watched lane just because the ultimate is available.'],
    ],
    mistakes: [['Walling every round the same way', 'Vary placement and keep a segment for the real threat.'], ['Healing during contact', 'Wait for cover and a safe pause.'], ['Slowing after the rush passes', 'Use sound cues before the crossing.'], ['Reviving without cover', 'Clear the angle or ask a teammate to protect you.']],
    combos: [['Jett', 'A slow field holds enemies in place while Jett takes a clean entry angle.'], ['Sova', 'Recon reveals targets that Sage can slow for an easier follow-up.'], ['Phoenix', 'A protected wall gives Phoenix room to recover and re-enter.']], maps: [['Ascent', 'Wall cuts narrow mid and site approaches.'], ['Haven', 'Slow orbs delay fast hits across three sites.'], ['Icebox', 'Wall creates safe plant and post-plant space.']],
  },
};
const getDetails = (agent) => expandedData[agent.name] || {
  summary: agent.description, difficulty: 2,
  abilities: agent.abilities.map(([, name, description]) => [name, description, `${description} Use it to create a brief advantage for your team, then follow up while opponents are displaced.`, ['Coordinate timing with a teammate.', 'Use cover while casting.'], ['Your team is ready to take space.'], 'Avoid using it without a clear target or follow-up.']),
  mistakes: [['Using utility without a plan', 'Coordinate timing and follow up with your team.'], ['Repeating the same setup', 'Vary your position and timing.'], ['Using utility too late', 'Act on sound or teammate information early.']],
  combos: [['Sage', 'Pair utility to slow a route and create a safer team fight.'], ['Jett', 'Use utility to give Jett a clearer opening angle.']], maps: [['Ascent', 'Control key sightlines with utility.'], ['Haven', 'Cover fast rotations.'], ['Bind', 'Punish tight choke points.']],
};

function ArrowIcon({ direction }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d={direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} /></svg>;
}

function AgentCard({ agent, index, total, offset, onSelect, onOpen, expanded, hovered }) {
  const distance = Math.abs(offset);
  const spacing = Math.max(150, Math.min(window.innerWidth * 0.18, 215));
  return (
    <button
      type="button"
      className={`agent-card${offset === 0 && expanded ? ' is-expanded' : ''}${hovered ? ' is-hovered' : ''}`}
      data-agent-index={index}
      aria-label={`${agent.name}, ${agent.role}${offset === 0 ? ', selected' : ''}`}
      aria-pressed={offset === 0}
      onClick={() => { if (offset !== 0) onSelect(index); }}
      style={{
        '--art': typeof agent.image === 'string' && agent.image.startsWith('linear-gradient') ? agent.image : `url("${agent.image}")`,
        zIndex: 10 - distance,
        opacity: distance > 2 ? 0 : 1 - distance * 0.12,
        filter: `brightness(${1 - distance * 0.12})`,
        transform: expanded && offset === 0 ? undefined : `translateX(${offset * spacing}px) translateZ(${-distance * 72}px) rotateY(${offset * -26}deg) scale(${1 - distance * 0.11})`,
        viewTransitionName: expanded && offset === 0 ? 'agent-portrait' : undefined,
      }}
    >
      <span className="art" aria-hidden="true" />
      <span className="card-index">0{index + 1} / 0{total}</span>
      <span className="role">{agent.role}</span>
      <span className="card-info">
        <span className="agent-name">{agent.name}</span>
        <span className="name-line" />
        <span className="agent-copy">{agent.role}. {agent.description}</span>
      </span>
      {offset === 0 && !expanded && <span className="card-open-hint" onClick={(event) => { event.stopPropagation(); onOpen(); }}>View mechanics →</span>}
    </button>
  );
}

export default function App() {
  const [account, setAccount] = useState(null);
  const [selected, setSelected] = useState(() => { const id=location.hash.match(/^#\/(.+)$/)?.[1];return Math.max(0,agents.findIndex(a=>a.name.toLowerCase()===id)); });
  const [expanded, setExpanded] = useState(() => /^#\/[a-z]+$/i.test(location.hash));
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredAgent, setHoveredAgent] = useState(null);
  const [activeAbility, setActiveAbility] = useState(0);
  const agent = agents[selected];
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => { if (!response.ok) throw new Error('Session expired'); return response.json(); })
      .then((data) => setAccount(data.user))
      .catch(() => { localStorage.removeItem(TOKEN_KEY); setAccount(null); });
  }, []);
  const logout = () => { localStorage.removeItem(TOKEN_KEY); setAccount(null); };
  const detail = expandedData[agent.name] || getDetails(agent);
  const abilityOrder = [1, 2, 0, 3];
  const headingRef=useRef(null),openButtonRef=useRef(null),cardRef=useRef(null);
  const [contentVisible,setContentVisible]=useState(false),[activeTab,setActiveTab]=useState(0),[tabFading,setTabFading]=useState(false);
  const selectedAbility = detail.abilities[abilityOrder[activeTab]];
  const changeTab=(next)=>{setTabFading(true);window.setTimeout(()=>{setActiveTab(next);setTabFading(false);},150);};
  const moveTo=(index)=>{const next=wrap(index,agents.length);setSelected(next);if(expanded)history.pushState({},'',`#/${agents[next].name.toLowerCase()}`);setActiveTab(0);};
  const openAgent=()=>{setExpanded(true);history.pushState({},'',`#/${agent.name.toLowerCase()}`);setContentVisible(false);setActiveTab(0);window.setTimeout(()=>{setContentVisible(true);headingRef.current?.focus();},600);};
  const closeAgent=(fromHistory=false)=>{if(!expanded)return;setExpanded(false);if(!fromHistory&&/^#\//.test(location.hash))history.pushState({},'','#agents');setContentVisible(false);window.setTimeout(()=>openButtonRef.current?.focus(),600);};
  const select = useCallback((index) => {
    setSelected((current) => wrap(typeof index === 'function' ? index(current) : index, agents.length));
    setActiveAbility(0);
  }, []);

  useEffect(() => {
    if (!autoRotate || expanded || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      setSelected((current) => wrap(current + 1, agents.length));
      setHoveredAgent(null);
    }, 2500);
    return () => window.clearInterval(timer);
  }, [autoRotate, expanded]);

  useEffect(() => {
    const onKeyDown = (event) => {
      setAutoRotate(false);
      if (event.altKey || event.ctrlKey || event.metaKey || ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if(event.key==='Escape'&&expanded){event.preventDefault();closeAgent();return;} if(expanded)return;
      if (event.key === 'ArrowLeft') { event.preventDefault(); select((current) => current - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); select((current) => current + 1); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [select,expanded]);
  useEffect(()=>{const pop=()=>{const id=location.hash.match(/^#\/(.+)$/)?.[1],i=agents.findIndex(a=>a.name.toLowerCase()===id);if(i<0){if(expanded)closeAgent(true);}else{setSelected(i);setExpanded(true);setContentVisible(true);}};window.addEventListener('popstate',pop);return()=>window.removeEventListener('popstate',pop);},[expanded]);

  useEffect(() => { setActiveAbility(0); }, [selected]);

  let touchStartX = 0;
  return (
    <div
      id="agents"
      className={`stage${expanded?' detail-open':''}`}
      style={{ '--agent-color': agent.color }}
      onPointerDown={() => setAutoRotate(false)}
      onKeyDown={() => setAutoRotate(false)}
    >
      <div className="backdrop" aria-hidden="true">
        {agent.image && !agent.image.startsWith('linear-gradient') && <div key={agent.name} className="backdrop-image" style={{ backgroundImage: `url("${agent.image}")` }} />}
      </div>
      <div className="shade" aria-hidden="true" />
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Valorant Mechanics home">V<span>/</span>GUIDE</a>
        <nav className="nav" aria-label="Main navigation">
          <a href="#agents" aria-current="page">Agents</a><a href="/gunplay">Gunplay</a><a href="/movement">Movement</a><a href="/guides">Guides</a>
        </nav>
        <div className="actions">
          <SearchButton />
          {account ? <>{account.role === 'admin' && <a className="account-link" href="/auth">Admin Console</a>}<span className="account-name">{account.name}</span><button className="account-link account-logout" type="button" onClick={logout}>Sign out</button></> : <a className="account-link" href="/auth">Sign in</a>}
        </div>
      </header>
      <main className="main" id="home">
        <div className="carousel-view">
        <p className="eyebrow">The mechanics field guide</p>
        <h1 className="headline">Choose your <span>agent</span></h1>
        <section
          className="carousel-wrap"
          aria-label="Browse agents"
          onTouchStart={(event) => { touchStartX = event.changedTouches[0].clientX; }}
          onTouchEnd={(event) => { const delta = event.changedTouches[0].clientX - touchStartX; if (Math.abs(delta) > 45) select((current) => current + (delta < 0 ? 1 : -1)); }}
        >
          <button className="arrow prev" type="button" aria-label="Previous agent" onClick={() => select((current) => current - 1)}><ArrowIcon direction="left" /></button>
          <div
            className="cards"
            aria-live="polite"
            onPointerMove={(event) => {
              if (event.pointerType !== 'mouse') return;
              const card = getCardAtPoint(event.currentTarget, event.clientX, event.clientY);
              const next = card ? Number(card.dataset.agentIndex) : null;
              setHoveredAgent((current) => current === next ? current : next);
            }}
            onPointerLeave={() => setHoveredAgent(null)}
            onClick={(event) => {
              if (event.target.closest('.agent-card')) return;
              const card = getCardAtPoint(event.currentTarget, event.clientX, event.clientY);
              if (card) select(Number(card.dataset.agentIndex));
            }}
          >
            {agents.map((item, index) => {
              let offset = index - selected;
              if (offset > agents.length / 2) offset -= agents.length;
              if (offset < -agents.length / 2) offset += agents.length;
              return <div key={item.name} ref={offset===0?cardRef:null} className={`card-shell${expanded&&offset===0?' expanded-shell':''}`}><AgentCard agent={item} index={index} total={agents.length} offset={offset} onSelect={select} onOpen={openAgent} expanded={expanded} hovered={hoveredAgent===index} /></div>;
            })}
          </div>
          <button className="arrow next" type="button" aria-label="Next agent" onClick={() => select((current) => current + 1)}><ArrowIcon direction="right" /></button>
        </section>
        <section className="below" aria-label="Selected agent abilities">
          <div className="abilities" aria-label="Abilities">
            {agent.abilities.map(([key, name], index) => <button key={key} className="ability" type="button" aria-label={`${name} (${key})`} title={`${name} (${key})`} aria-pressed={index === activeAbility} onClick={() => setActiveAbility(index)}><span className="ability-key-label">{key}</span><span>{name}</span></button>)}
          </div>
          <p className="ability-description" aria-live="polite">{agent.abilities[activeAbility][2]}</p>
          <button ref={openButtonRef} className="mechanics-link" type="button" onClick={openAgent}>View this agent's mechanics <ArrowIcon direction="right" /></button>
        </section>
        <p className="footer-note">Last checked on patch <span>10.08</span></p>
        </div>
        <section className="agent-detail" aria-hidden={!expanded} inert={!expanded}><div className="detail-scroll content-visible"><button className="back-agents" onClick={()=>closeAgent()}><ArrowIcon direction="left" /> Back to agents</button>
          <header className="detail-heading-row"><div><p className="detail-kicker">Agent mechanics</p><h2 ref={headingRef} tabIndex="-1" className="detail-title">{agent.name}</h2><span className="name-line"/></div><span className="role-badge">{agent.role}</span><div className="difficulty"><span>Difficulty</span><div className="difficulty-bars">{[1,2,3].map(n=><i key={n} className={n<=detail.difficulty?'filled':''}/>)}</div></div></header><p className="summary">{detail.summary}</p>
          <section className="detail-section"><h3>Abilities</h3><div className="ability-tabs" role="tablist" aria-label="Agent abilities" onKeyDown={e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?3:wrap(activeTab+(e.key==='ArrowRight'?1:-1),4);changeTab(n);document.getElementById(`agent-tab-${n}`)?.focus();}}>{abilityOrder.map((abilityIndex,tabIndex)=>{const ability=detail.abilities[abilityIndex];return <button id={`agent-tab-${tabIndex}`} key={abilityIndex} type="button" role="tab" aria-selected={activeTab===tabIndex} aria-controls="ability-panel" tabIndex={activeTab===tabIndex?0:-1} className={activeTab===tabIndex?'active':''} onClick={()=>changeTab(tabIndex)}><span className="ability-key">{['Q','E','C','X'][tabIndex]}</span><span className="ability-card-copy"><strong>{ability[0]}</strong><small>{ability[1]}</small></span></button>})}</div><div id="ability-panel" role="tabpanel" aria-labelledby={`agent-tab-${activeTab}`} className={`ability-panel${tabFading?' fading':''}`}><h4>{selectedAbility[0]}</h4><p className="ability-lede">{selectedAbility[1]}</p><h5>How it works</h5><p>{selectedAbility[2]}</p><h5>Mechanics tips</h5><ul>{selectedAbility[3].map(t=><li key={t}>{t}</li>)}</ul><h5>Use it when</h5><ul>{selectedAbility[4].map(t=><li key={t}>{t}</li>)}</ul><h5>Avoid</h5><p>{selectedAbility[5]}</p></div></section>
          <section className="detail-section"><h3>Common mistakes</h3><ul className="mistake-list">{detail.mistakes.map(([a,b])=><li key={a}><strong>{a}</strong><span>{b}</span></li>)}</ul></section><section className="detail-section"><h3>Combos</h3><div className="combo-grid">{detail.combos.map(([name,note])=><button key={name} className="combo-card" onClick={()=>moveTo(agents.findIndex(a=>a.name===name))}><span className="combo-portrait" style={{backgroundImage:`url('${agents.find(a=>a.name===name)?.image}')`}}/><strong>{name}</strong><span>{note}</span></button>)}</div></section><section className="detail-section"><h3>Best maps</h3><div className="map-list">{detail.maps.map(([name,note])=><div className="map-chip" key={name}><strong>{name}</strong><span>{note}</span></div>)}</div></section><p className="lineups">Lineups for this agent: coming soon</p><footer className="detail-pagination"><button onClick={()=>moveTo(selected-1)}><ArrowIcon direction="left" /> Previous agent</button><button onClick={()=>moveTo(selected+1)}>Next agent <ArrowIcon direction="right" /></button></footer>
        </div></section>
      </main>
    </div>
  );
}
