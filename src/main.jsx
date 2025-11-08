// UMD-режим: React/ReactDOM — глобальные. JSX компилирует Babel.
const { useEffect, useMemo, useState } = React;

const MOODS   = ["Энергия","Фокус","Спокойствие","Сон","Уют","Тепло","Легкость","Детокс","Пищеварение","Творчество"];
const FLAVORS = ["Флоральный","Дымный","Цитрус","Землистый"];

const RECOMMENDATIONS = {
  biochem: {
    mood: {
      Энергия: ["dianhong", "shu-puer"],
      Фокус: ["anji-baicha", "dianhong"],
      Спокойствие: ["gaba-oolong", "shu-puer"],
      Сон: ["gaba-oolong"],
      Уют: ["dianhong", "shu-puer"],
      Тепло: ["shu-puer", "dianhong"],
      Легкость: ["anji-baicha"],
      Детокс: ["anji-baicha"],
      Пищеварение: ["shu-puer"],
      Творчество: ["gaba-oolong", "anji-baicha"],
    },
    flavor: {
      Флоральный: ["anji-baicha", "gaba-oolong"],
      Дымный: ["shu-puer"],
      Цитрус: ["dianhong"],
      Землистый: ["shu-puer", "dianhong"],
    },
  },
  qi: {
    mood: {
      Энергия: ["dianhong", "anji-baicha"],
      Фокус: ["gaba-oolong"],
      Спокойствие: ["gaba-oolong", "shu-puer"],
      Сон: ["gaba-oolong"],
      Уют: ["shu-puer"],
      Тепло: ["shu-puer", "dianhong"],
      Легкость: ["anji-baicha"],
      Детокс: ["anji-baicha"],
      Пищеварение: ["shu-puer"],
      Творчество: ["gaba-oolong", "dianhong"],
    },
    flavor: {
      Флоральный: ["gaba-oolong"],
      Дымный: ["shu-puer"],
      Цитрус: ["anji-baicha", "dianhong"],
      Землистый: ["shu-puer"],
    },
  },
};

function ModeToggle({ mode, setMode }) {
  const indicatorStyle = { transform: `translateX(${mode === 'qi' ? '100%' : '0'})` };
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">Как читаем чай</h2>
        <p className="card-sub">Выбери подход к рекомендации.</p>
      </div>
      <div className="pill-switch" role="tablist" aria-label="Переключатель режима">
        <span className="pill-indicator" style={indicatorStyle} aria-hidden="true" />
        <button
          type="button"
          className="pill-option"
          role="tab"
          aria-selected={mode === 'biochem'}
          onClick={() => setMode('biochem')}
        >
          Биохимия
        </button>
        <button
          type="button"
          className="pill-option"
          role="tab"
          aria-selected={mode === 'qi'}
          onClick={() => setMode('qi')}
        >
          Ча Ци
        </button>
      </div>
      <p className="card-note">
        <span className="brand-dot" aria-hidden="true" />
        <span>
          Биохимия — про состав, молекулы и телесный отклик. Ча Ци — про тонкую энергетику, созерцание и поток.
        </span>
      </p>
    </section>
  );
}

function PathwayPicker({ pathway, setPathway, selected, setSelected }) {
  const ChipList = (list, p) => (
    <div className="chip-group">
      {list.map((x) => {
        const isActive = selected === x && pathway === p;
        return (
          <button
            key={x}
            type="button"
            onClick={() => {
              setPathway(p);
              setSelected(x);
            }}
            className={`chip ${isActive ? 'is-active' : ''}`}
            aria-pressed={isActive}
          >
            {x}
          </button>
        );
      })}
    </div>
  );
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">Что важнее сейчас?</h2>
        <p className="card-sub">Выбери один вариант — по настроению <em>или</em> по вкусу.</p>
      </div>
      <div className="chip-section">
        <h3 className="section-label">Настроение</h3>
        {ChipList(MOODS, 'mood')}
      </div>
      <div className="chip-section">
        <h3 className="section-label">Вкус</h3>
        {ChipList(FLAVORS, 'flavor')}
      </div>
    </section>
  );
}

function ContextRow({soonSleep,setSoonSleep}) {
  const [time,setTime]=useState(new Date());
  useEffect(()=>{ const t=setInterval(()=>setTime(new Date()),60000); return ()=>clearInterval(t); },[]);
  const tstr = time.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
  return (
    <section className="card context-card">
      <div className="context-top">
        <div>
          <div className="card-sub">Сейчас</div>
          <span className="time-pill">{tstr}</span>
        </div>
        <div className="card-sub">Режим дня</div>
      </div>
      <label className="sleep-toggle" title="Планирую сон через 2–5 часов">
        <input type="checkbox" checked={soonSleep} onChange={e=>setSoonSleep(e.target.checked)} />
        <span>Планирую сон в течение 2–5 часов</span>
      </label>
    </section>
  );
}

function Poster({ posterKey, postersMap }) {
  const posterList = useMemo(() => postersMap?.[posterKey] || [], [postersMap, posterKey]);
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!posterList.length) {
      setUrl(null);
      return;
    }
    const storageKey = `posterIdx:${posterKey}`;
    const storedIndex = Number(localStorage.getItem(storageKey) || "0");
    const safeIndex = storedIndex % posterList.length;
    const nextIndex = (safeIndex + 1) % posterList.length;
    localStorage.setItem(storageKey, String(nextIndex));
    const candidate = posterList[safeIndex];
    setUrl(candidate?.startsWith("http") ? candidate : `./public/${candidate}`);
  }, [posterKey, posterList]);

  if (!url) return null;
  return <img src={url} alt={posterKey} className="poster" />;
}

function TeaCard({ tea, posterKey, posters }) {
  const [open, setOpen] = useState(false);
  const originLine = [tea.origin?.country, tea.origin?.region].filter(Boolean).join(', ');
  return (
    <article className={`card tea-card${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="tea-header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div>
          <span className="tea-name">{tea.name}</span>
          {originLine && <div className="tea-origin">{originLine}</div>}
        </div>
        <span className="tea-style">{tea.style}</span>
      </button>

      {open && (
        <div className="tea-body">
          <ul>
            {tea.brew?.infusion && (
              <li>Проливами: {tea.brew.infusion.temp_c}°C; совет — первый пролив слить, ниже температура снизит кофеин.</li>
            )}
            {tea.brew?.thermos && (
              <li>Термос: {tea.brew.thermos.temp_c}°C · {tea.brew.thermos.steep_min} мин. (слива нет).</li>
            )}
          </ul>

          {posterKey && <Poster posterKey={posterKey} postersMap={posters} />}
        </div>
      )}
    </article>
  );
}

function isEvening(){ const h=new Date().getHours(); return h>=18 || h<5; }

function App(){
  const [mode,setMode] = useState("biochem");      // biochem | qi
  const [pathway,setPathway] = useState(null);     // mood | flavor
  const [selected,setSelected] = useState(null);   // выбранный пункт
  const [soonSleep,setSoonSleep] = useState(false);
  const [catalog,setCatalog] = useState([]);
  const [posters,setPosters] = useState({});
  const [results,setResults] = useState([]);

  useEffect(()=>{
    if (!selected) {
      setResults([]);
    }
  },[mode, pathway, selected]);

  // 1) Надёжное переключение темы — на корневом <html>
  useEffect(()=>{
    const root = document.documentElement;
    root.classList.remove('light','dark');
    root.classList.add(mode === 'biochem' ? 'light' : 'dark');
  },[mode]);

  // Загрузка каталога
  useEffect(()=>{
    let ignore = false;
    Promise.all([
      fetch("./public/catalog.json").then((r)=>r.json()).catch(()=>null),
      fetch("./public/posters.json").then((r)=>r.json()).catch(()=>null),
    ]).then(([catalogJson, postersJson])=>{
      if (ignore) return;
      setCatalog(Array.isArray(catalogJson?.teas) ? catalogJson.teas : []);
      setPosters(postersJson && typeof postersJson === 'object' ? postersJson : {});
    });
    return () => { ignore = true; };
  },[]);

  const catalogById = useMemo(()=>{
    return catalog.reduce((acc, tea)=>{
      if (tea?.id) acc[tea.id] = tea;
      return acc;
    }, {});
  },[catalog]);

  function runRecommend(){
    const pool = RECOMMENDATIONS[mode]?.[pathway]?.[selected] || [];
    const deduped = Array.from(new Set(pool));
    const mapped = deduped
      .map((id)=>catalogById[id])
      .filter(Boolean);
    const fallback = mapped.length ? mapped : catalog.slice(0, 4);
    setResults(fallback);
  }

  const showWarn = (isEvening() || soonSleep) && pathway==="mood" && ["Энергия","Фокус","Творчество"].includes(selected||"");

  return (
    <main className="app-shell">
      <section className="container">
        <header>
          <span className="hero-badge">teaclub by kai</span>
          <h1 className="hero-title">Настрой чай под своё состояние</h1>
          <p className="hero-text">Выбирай подход, фильтруй по настроению или вкусу и получай живые рекомендации прямо сейчас.</p>
        </header>

        <ModeToggle mode={mode} setMode={setMode} />

        <PathwayPicker pathway={pathway} setPathway={setPathway} selected={selected} setSelected={setSelected} />

        <ContextRow soonSleep={soonSleep} setSoonSleep={setSoonSleep} />

        <button className="cta-button" disabled={!selected} onClick={runRecommend}>
          Показать рекомендации
        </button>

        {showWarn && (
          <div className="notice-card" role="status">
            <p className="notice-text">
              ⚠ Позднее время, чай с кофеином может нарушить сон. Компромиссы: короткие проливы на негорячей воде, GABA-улун короткими проливами, травяные альтернативы.
            </p>
          </div>
        )}

        <section className="stack" aria-live="polite">
          {results.slice(0,4).map((t) => (
            <TeaCard key={t.id} tea={t} posterKey={selected} posters={posters} />
          ))}
        </section>

        <footer className="footer-note">
          <button
            type="button"
            className="footer-link"
            onClick={()=>alert("🐌 Я Кай — умею в чай до любой глубины. Провожу чайные мастермайнды tea & deep talk.\n\nUSDT TRC-20: TVgSTH5hKb6QMdpZtJE8TjBLSsHoVYzFj1\nUSDT Arbitrum: 0xE981146705437f03C8A241bD3d72454f8656bCb9")}
          >
            by kai
          </button>
        </footer>
      </section>
    </main>
  );
}

// Рендер
const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App />);
