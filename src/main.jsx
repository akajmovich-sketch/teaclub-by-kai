// UMD-режим: React/ReactDOM — глобальные. JSX компилирует Babel.
const { useEffect, useState } = React;

const MOODS   = ["Энергия","Фокус","Спокойствие","Сон","Уют","Тепло","Легкость","Детокс","Пищеварение","Творчество"];
const FLAVORS = ["Флоральный","Дымный","Цитрус","Землистый"];

function ModeToggle({mode,setMode}) {
  return (
    <div className="flex items-center gap-2">
      <button
        className={`button-brand ${mode==='biochem'?'opacity-100':'opacity-60'}`}
        onClick={()=>setMode('biochem')}
        aria-pressed={mode==='biochem'}
      >Биохимия</button>
      <button
        className={`button-brand ${mode==='qi'?'opacity-100':'opacity-60'}`}
        onClick={()=>setMode('qi')}
        aria-pressed={mode==='qi'}
      >Ча Ци</button>
      <span className="badge cursor-help" title="«Ча Ци» — тонкая энергия чая, спокойствие и сосредоточенность. Это не просто стимуляция кофеином.">?</span>
    </div>
  );
}

function PathwayPicker({pathway,setPathway,selected,setSelected}) {
  const ChipList = (list,p)=>(
    <div className="chips mt-3">
      {list.map(x=>(
        <button key={x}
          onClick={()=>{setPathway(p); setSelected(x);}}
          className={`chip ${selected===x && pathway===p ? "active" : ""}`}>
          {x}
        </button>
      ))}
    </div>
  );
  return (
    <div className="card">
      <div className="subtle text-sm mb-2">Выбери один вариант — по настроению <em>или</em> по вкусу</div>
      <div>
        <div className="font-medium">Настроение</div>
        {ChipList(MOODS,"mood")}
      </div>
      <div className="mt-4">
        <div className="font-medium">Вкус</div>
        {ChipList(FLAVORS,"flavor")}
      </div>
    </div>
  );
}

function ContextRow({soonSleep,setSoonSleep}) {
  const [time,setTime]=useState(new Date());
  useEffect(()=>{ const t=setInterval(()=>setTime(new Date()),60000); return ()=>clearInterval(t); },[]);
  const tstr = time.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
  return (
    <div className="card flex items-center justify-between">
      <div className="text-sm">Сейчас: <span className="badge">{tstr}</span></div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={soonSleep} onChange={e=>setSoonSleep(e.target.checked)} />
        Скоро сон? <span className="badge" title="через 2–5 часов?">?</span>
      </label>
    </div>
  );
}

function Poster({keyName}) {
  const [url,setUrl]=useState(null);
  useEffect(()=>{
    fetch("./public/posters.json").then(r=>r.json()).then(map=>{
      const list = map[keyName] || [];
      if (!list.length) return setUrl(null);
      // ротация постеров по keyName
      const k=`posterIdx:${keyName}`;
      const idx = Number(localStorage.getItem(k) || "0");
      const next = (idx+1) % list.length;
      localStorage.setItem(k,String(next));
      setUrl(list[idx].startsWith("http")? list[idx] : `./public/${list[idx]}`);
    }).catch(()=>{});
  },[keyName]);
  if(!url) return null;
  return <img src={url} alt={keyName} className="poster mt-3" />;
}

function TeaCard({tea, posterKey}) {
  const [open,setOpen]=useState(false);
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <button className="underline" onClick={()=>setOpen(v=>!v)}>{tea.name}</button>
        <span className="badge">{tea.style}</span>
      </div>

      {open && (
        <div className="mt-2 text-sm">
          <div className="subtle">{tea.origin?.country}{tea.origin?.region?`, ${tea.origin.region}`:""}</div>
          <ul className="list-disc ml-5 mt-1">
            {tea.brew?.infusion && <li>Проливами: {tea.brew.infusion.temp_c}°C; совет: 1-й пролив слить, ниже температура — меньше кофеина.</li>}
            {tea.brew?.thermos &&  <li>Термос: {tea.brew.thermos.temp_c}°C · {tea.brew.thermos.steep_min} мин. (слива нет)</li>}
          </ul>

          {/* Постер показываем ЗДЕСЬ, при открытой карточке */}
          {posterKey && <Poster keyName={posterKey} />}
        </div>
      )}
    </div>
  );
}

function isEvening(){ const h=new Date().getHours(); return h>=18 || h<5; }

function App(){
  const [mode,setMode] = useState("biochem");      // biochem | qi
  const [pathway,setPathway] = useState(null);     // mood | flavor
  const [selected,setSelected] = useState(null);   // выбранный пункт
  const [soonSleep,setSoonSleep] = useState(false);
  const [results,setResults] = useState([]);

  // 1) Надёжное переключение темы — на корневом <html>
  useEffect(()=>{
    const root = document.documentElement;
    root.classList.remove('light','dark');
    root.classList.add(mode === 'biochem' ? 'light' : 'dark');
  },[mode]);

  // Загрузка каталога
  useEffect(()=>{
    fetch("./public/catalog.json").then(r=>r.json()).then(j=>{ window.__CATALOG__ = j; });
  },[]);

  function runRecommend(){
    const cat = (window.__CATALOG__||{}).teas || [];
    setResults(cat.slice(0,4)); // заглушка — заменим на скоринг позже
  }

  const showWarn = (isEvening() || soonSleep) && pathway==="mood" && ["Энергия","Фокус","Творчество"].includes(selected||"");

  return (
    <main className="container">
      <div className="h1 mb-2">teaclub by kai</div>

      <ModeToggle mode={mode} setMode={setMode} />

      <div className="h-gap" />
      <PathwayPicker pathway={pathway} setPathway={setPathway} selected={selected} setSelected={setSelected} />

      <div className="h-gap" />
      <ContextRow soonSleep={soonSleep} setSoonSleep={setSoonSleep} />

      {/* Убрали текст про "5 г ≈ 1 л" */}

      <button className="button mt-4" disabled={!selected} onClick={runRecommend}>
        Показать рекомендации
      </button>

      {showWarn && (
        <div className="card mt-3 border border-yellow-400/40">
          <p className="text-xs">
            ⚠ Позднее время, чай с кофеином может нарушить сон. Компромиссы: короткие проливы на негорячей воде, GABA-улун короткими проливами, травяные альтернативы
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2 mt-3">
        {results.slice(0,4).map(t=>(
          <TeaCard key={t.id} tea={t} posterKey={selected} />
        ))}
      </div>

      {/* Постер с главной убрали */}
      <div className="mt-6 text-right link"
           onClick={()=>alert("🐌 Я Кай — умею в чай до любой глубины. Провожу чайные мастермайнды tea & deep talk.\n\nUSDT TRC-20: TVgSTH5hKb6QMdpZtJE8TjBLSsHoVYzFj1\nUSDT Arbitrum: 0xE981146705437f03C8A241bD3d72454f8656bCb9")}>
        by kai
      </div>
    </main>
  );
}

// Рендер
const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App />);
