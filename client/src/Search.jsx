import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const SearchContext = createContext(null);
const sections = ['Agents', 'Gunplay', 'Movement', 'Community'];
const sectionOrder = Object.fromEntries(sections.map((section, index) => [section, index]));
const recentSearchKey = 'vguide-recent-searches';
const popularSearches = ['Counter-strafing', 'Crosshair placement', 'Loss bonus', 'Jett', 'Sage', 'Round calculator'];
const fieldWeights = { title: 100, aliases: 80, summary: 50, body: 20 };

function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function compact(value) {
  return normalize(value).replace(/\s/g, '');
}

function editDistanceAtMostOne(left, right) {
  if (Math.abs(left.length - right.length) > 1) return false;
  let leftIndex = 0;
  let rightIndex = 0;
  let edits = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] === right[rightIndex]) {
      leftIndex += 1;
      rightIndex += 1;
      continue;
    }
    edits += 1;
    if (edits > 1) return false;
    if (left.length > right.length) leftIndex += 1;
    else if (right.length > left.length) rightIndex += 1;
    else {
      leftIndex += 1;
      rightIndex += 1;
    }
  }

  if (leftIndex < left.length || rightIndex < right.length) edits += 1;
  return edits <= 1;
}

function matchesWord(word, text) {
  const normalized = normalize(text);
  if (!normalized) return false;
  if (normalized.includes(word) || compact(normalized).includes(word.replace(/\s/g, ''))) return true;

  const tokens = normalized.split(' ');
  if (tokens.some((token) => token.startsWith(word))) return true;
  if (word.length < 5) return false;
  return tokens.some((token) => editDistanceAtMostOne(word, token));
}

function drillBody(item) {
  return [
    ...(item.steps || []),
    ...(item.mistakes || []).flat(),
    ...(item.drills || []).flatMap((drill) => [drill.name, drill.duration, drill.how]),
  ].filter(Boolean);
}

function createRecord({ id, section, title, subtitle, summary, aliases = [], body = [], url }) {
  const searchableText = [title, subtitle, summary, ...aliases, ...body].filter(Boolean).join(' ');
  return {
    id,
    section,
    title,
    subtitle,
    summary: summary || '',
    aliases,
    body,
    searchableText,
    url,
    weights: fieldWeights,
    sectionOrder: sectionOrder[section],
  };
}

export function buildSearchIndex({ agents = [], gunplayTechniques = [], movementTechniques = [], economyLessons = [], calculatorEntry }) {
  const records = [];

  agents.forEach((agent) => {
    const abilities = (agent.abilities || []).flatMap((ability) => ability.slice(1));
    records.push(createRecord({
      id: `agent:${agent.name.toLowerCase()}`,
      section: 'Agents',
      title: agent.name,
      subtitle: agent.role,
      summary: agent.summary || agent.description,
      aliases: agent.aliases || [],
      body: abilities,
      url: `/#/${agent.name.toLowerCase()}`,
    }));
  });

  gunplayTechniques.forEach((technique) => {
    records.push(createRecord({
      id: `gunplay:${technique.id}`,
      section: 'Gunplay',
      title: technique.title,
      subtitle: technique.level,
      summary: technique.summary,
      aliases: technique.aliases || [],
      body: drillBody(technique),
      url: `/gunplay/${technique.id}`,
    }));
  });

  movementTechniques.forEach((technique) => {
    records.push(createRecord({
      id: `movement:${technique.id}`,
      section: 'Movement',
      title: technique.title,
      subtitle: technique.level,
      summary: technique.summary,
      aliases: technique.aliases || [],
      body: drillBody(technique),
      url: `/movement/${technique.id}`,
    }));
  });

  economyLessons.forEach((lesson) => {
    records.push(createRecord({
      id: `economy:${lesson.id}`,
      section: 'Economy',
      title: lesson.title,
      subtitle: lesson.level || 'Lesson',
      summary: lesson.summary,
      aliases: lesson.aliases || [],
      body: drillBody(lesson),
      url: `/economy/${lesson.id}`,
    }));
  });

  if (calculatorEntry) {
    records.push(createRecord({
      id: 'economy:round-calculator',
      section: 'Economy',
      title: calculatorEntry.title,
      subtitle: calculatorEntry.subtitle || 'Calculator',
      summary: calculatorEntry.summary,
      aliases: calculatorEntry.aliases || [],
      body: calculatorEntry.body || [],
      url: calculatorEntry.url || '/economy/calculator',
    }));
  }

  return records;
}

function wordsMatch(words, text) {
  return words.every((word) => matchesWord(word, text));
}

function scoreRecord(record, query, words) {
  if (!wordsMatch(words, record.searchableText)) return null;

  const normalizedQuery = normalize(query);
  const compactQuery = compact(query);
  const normalizedTitle = normalize(record.title);
  const compactTitle = compact(record.title);

  if (normalizedTitle === normalizedQuery || compactTitle === compactQuery) return 1000;
  if (normalizedTitle.startsWith(normalizedQuery) || compactTitle.startsWith(compactQuery)) return 900;
  if (normalizedTitle.includes(normalizedQuery) || compactTitle.includes(compactQuery) || wordsMatch(words, record.title)) return 800;
  if (record.aliases.some((alias) => wordsMatch(words, alias))) return 700;
  if (wordsMatch(words, record.summary)) return 600;
  if (wordsMatch(words, record.body.join(' '))) return 500;
  return 400;
}

export function searchIndex(index, query) {
  const words = normalize(query).split(' ').filter(Boolean);
  if (!words.length) return [];

  const ranked = index
    .map((record) => ({ record, score: scoreRecord(record, query, words) }))
    .filter((result) => result.score !== null)
    .sort((left, right) => right.score - left.score
      || left.record.sectionOrder - right.record.sectionOrder
      || left.record.title.localeCompare(right.record.title));

  const counts = Object.fromEntries(sections.map((section) => [section, 0]));
  return ranked.filter(({ record }) => {
    if (counts[record.section] >= 8) return false;
    counts[record.section] += 1;
    return true;
  }).slice(0, 20);
}

function readRecentSearches() {
  try {
    const saved = JSON.parse(localStorage.getItem(recentSearchKey) || '[]');
    return Array.isArray(saved) ? saved.filter((item) => typeof item === 'string').slice(0, 5) : [];
  } catch {
    return null;
  }
}

function SearchSectionIcon({ section }) {
  const paths = {
    Agents: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4 21a8 8 0 0 1 16 0'],
    Gunplay: ['M12 3v3', 'M12 18v3', 'M3 12h3', 'M18 12h3', 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z'],
    Movement: ['M4 8h15', 'm15 4 4 4-4 4', 'M20 16H5', 'm9 12-4 4 4 4'],
    Community: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4 21a8 8 0 0 1 16 0'],
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[section].map((path) => <path key={path} d={path} />)}</svg>;
}

function isWordHighlight(word, queryWords) {
  return queryWords.some((queryWord) => matchesWord(queryWord, word));
}

function HighlightedTitle({ title, words }) {
  const parts = [];
  let cursor = 0;
  for (const match of title.matchAll(/[a-z0-9]+/gi)) {
    const start = match.index;
    const end = start + match[0].length;
    if (start > cursor) parts.push(title.slice(cursor, start));
    const word = match[0];
    parts.push(isWordHighlight(word, words)
      ? <mark className="search-highlight" key={`${start}-${word}`}>{word}</mark>
      : word);
    cursor = end;
  }
  if (cursor < title.length) parts.push(title.slice(cursor));
  return parts;
}

function makeSnippet(record, words) {
  const fragment = record.body.find((item) => words.some((word) => matchesWord(word, item)))
    || record.summary
    || record.body[0]
    || record.subtitle;
  const clean = String(fragment || '').replace(/\s+/g, ' ').trim();
  return clean.length > 130 ? `${clean.slice(0, 127).trimEnd()}...` : clean;
}

export function SearchProvider({ sources, children }) {
  const [index] = useState(() => buildSearchIndex(sources));
  return <SearchContext.Provider value={index}>{children}</SearchContext.Provider>;
}

export function SearchButton() {
  const index = useContext(SearchContext) || [];
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [recent, setRecent] = useState(readRecentSearches);
  const triggerRef = useRef(null);
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  const results = useMemo(() => searchIndex(index, query), [index, query]);
  const [communityResults, setCommunityResults] = useState([]);
  useEffect(() => {
    if (!open || !normalize(query)) { setCommunityResults([]); return; }
    const timer = window.setTimeout(() => {
      const api = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      fetch(`${api}/guides?q=${encodeURIComponent(query)}&limit=8`).then((response) => response.ok ? response.json() : { posts: [] }).then((data) => setCommunityResults((data.posts || []).map((post) => ({ record: { id: `community:${post._id}`, section: 'Community', title: post.title, subtitle: post.category, summary: post.description, body: [], url: `/guides/${post._id}` } })))).catch(() => setCommunityResults([]));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [open, query]);
  const allResults = useMemo(() => [...results, ...communityResults], [results, communityResults]);
  const resultCount = `${allResults.length} result${allResults.length === 1 ? '' : 's'}`;
  const queryWords = normalize(query).split(' ').filter(Boolean);
  const grouped = sections.map((section) => ({
    section,
    results: allResults.filter(({ record }) => record.section === section),
  })).filter((group) => group.results.length > 0);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const onGlobalKeyDown = (event) => {
      const target = event.target;
      const typing = target instanceof HTMLElement
        && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
      if (open) {
        if (event.key === 'Escape') {
          event.preventDefault();
          setOpen(false);
          requestAnimationFrame(() => triggerRef.current?.focus());
        }
        return;
      }
      if (typing || event.altKey) return;
      if (event.key === '/' || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')) {
        event.preventDefault();
        setQuery('');
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onGlobalKeyDown);
    return () => window.removeEventListener('keydown', onGlobalKeyDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const saveRecent = (value) => {
    const normalizedValue = value.trim();
    if (!normalizedValue) return;
    try {
      const next = [normalizedValue, ...(readRecentSearches() || []).filter((item) => normalize(item) !== normalize(normalizedValue))].slice(0, 5);
      localStorage.setItem(recentSearchKey, JSON.stringify(next));
      setRecent(next);
    } catch {
      setRecent(null);
    }
  };

  const selectResult = (record) => {
    saveRecent(query);
    setOpen(false);
    window.location.assign(record.url);
  };

  const moveSelection = (direction) => {
    if (!allResults.length) return;
    setActiveIndex((current) => (current + direction + allResults.length) % allResults.length);
    requestAnimationFrame(() => document.getElementById(`search-result-${(activeIndex + direction + allResults.length) % allResults.length}`)?.scrollIntoView({ block: 'nearest' }));
  };

  const handleDialogKeyDown = (event) => {
    if (event.key === 'Tab' && dialogRef.current) {
      const focusable = [...dialogRef.current.querySelectorAll('button:not(:disabled), input:not(:disabled), a[href]')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  };

  const openSearch = () => {
    setQuery('');
    setOpen(true);
  };

  const clearRecent = () => {
    try {
      localStorage.removeItem(recentSearchKey);
      setRecent([]);
    } catch {
      setRecent(null);
    }
  };

  return (
    <>
      <button ref={triggerRef} className="search search-trigger" type="button" aria-label="Search guides" aria-haspopup="dialog" aria-expanded={open} onClick={openSearch}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.3" /><path d="m15.5 15.5 4.2 4.2" /></svg>
      </button>
      {open && createPortal(
        <div className="site-search-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
          <section className="site-search-dialog" role="dialog" aria-modal="true" aria-label="Site search" ref={dialogRef} onKeyDown={handleDialogKeyDown}>
            <div className="site-search-input-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.3" /><path d="m15.5 15.5 4.2 4.2" /></svg>
              <input
                ref={inputRef}
                type="search"
                role="combobox"
                aria-label="Search agents, techniques, lessons"
                aria-autocomplete="list"
                aria-expanded="true"
                aria-controls="site-search-results"
                aria-activedescendant={allResults.length ? `search-result-${activeIndex}` : undefined}
                placeholder="Search agents, techniques, lessons..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') { event.preventDefault(); moveSelection(1); }
                  if (event.key === 'ArrowUp') { event.preventDefault(); moveSelection(-1); }
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    if (allResults[activeIndex]) selectResult(allResults[activeIndex].record);
                    else close();
                  }
                  if (event.key === 'Escape') { event.preventDefault(); close(); }
                }}
              />
              <button className="site-search-close" type="button" onClick={close} aria-label="Close search">×</button>
            </div>
            <div className="site-search-content">
              <span className="visually-hidden" aria-live="polite" aria-atomic="true">{normalize(query) ? resultCount : ''}</span>
              {!normalize(query) ? (
                <>
                  <section className="site-search-suggestions" aria-labelledby="search-popular-title">
                    <h2 id="search-popular-title">Popular</h2>
                    <div className="search-chips">{popularSearches.map((item) => <button type="button" key={item} onClick={() => setQuery(item)}>{item}</button>)}</div>
                  </section>
                  {recent && recent.length > 0 && (
                    <section className="site-search-suggestions" aria-labelledby="search-recent-title">
                      <div className="search-section-heading"><h2 id="search-recent-title">Recent searches</h2><button type="button" onClick={clearRecent}>Clear</button></div>
                      <div className="search-chips">{recent.map((item) => <button type="button" key={item} onClick={() => setQuery(item)}>{item}</button>)}</div>
                    </section>
                  )}
                </>
              ) : allResults.length > 0 ? (
                <div className="site-search-results" id="site-search-results" role="listbox" aria-label="Search results">
                  {grouped.map((group) => (
                    <section className="site-search-group" role="group" aria-label={group.section} key={group.section}>
                      <h2>{group.section}</h2>
                      {group.results.map(({ record }) => {
                        const resultIndex = allResults.findIndex((result) => result.record.id === record.id);
                        const subtitle = ['beginner', 'intermediate', 'advanced'].includes(record.subtitle)
                          ? <span className="card-level"><span className="card-level-bars" aria-hidden="true">{[1, 2, 3].map((bar) => <i key={bar} className={bar <= ({ beginner: 1, intermediate: 2, advanced: 3 }[record.subtitle] || 0) ? 'filled' : ''} />)}</span><span>{record.subtitle}</span></span>
                          : record.subtitle;
                        return (
                          <button
                            className={`site-search-result${activeIndex === resultIndex ? ' is-selected' : ''}`}
                            id={`search-result-${resultIndex}`}
                            type="button"
                            role="option"
                            aria-selected={activeIndex === resultIndex}
                            key={record.id}
                            onMouseEnter={() => setActiveIndex(resultIndex)}
                            onClick={() => selectResult(record)}
                          >
                            <span className="search-result-icon"><SearchSectionIcon section={record.section} /></span>
                            <span className="search-result-copy">
                              <strong><HighlightedTitle title={record.title} words={queryWords} /></strong>
                              <span className="search-result-subtitle">{subtitle}</span>
                              <span className="search-result-snippet">{makeSnippet(record, queryWords)}</span>
                            </span>
                          </button>
                        );
                      })}
                    </section>
                  ))}
                </div>
              ) : (
                <div className="site-search-empty">
                  <p>No results for '{query.trim()}'</p>
                  <span>Try a shorter word, like 'peek' or 'eco'.</span>
                  <section className="site-search-suggestions" aria-labelledby="search-popular-empty-title">
                    <h2 id="search-popular-empty-title">Popular</h2>
                    <div className="search-chips">{popularSearches.map((item) => <button type="button" key={item} onClick={() => setQuery(item)}>{item}</button>)}</div>
                  </section>
                </div>
              )}
            </div>
            <footer className="site-search-footer"><span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span><span><kbd>Enter</kbd> Open</span><span><kbd>Esc</kbd> Close</span></footer>
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}
