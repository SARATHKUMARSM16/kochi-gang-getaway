import { forwardRef, useEffect, useRef, useState, ReactNode } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { PAGES, LAST_CHECKED, Item } from './data';
import MapView from './MapView';
import { LAYOUT, HERO, DARK, PIC_BOTTOM } from './images';

const Flip: any = HTMLFlipBook;
let ctx: AudioContext | null = null;
function tick() {
  try {
    ctx = ctx || new (window.AudioContext || (window as any).webkitAudioContext)();
    const n = Math.floor(ctx.sampleRate * 0.2), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3) * 0.25;
    const s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start();
  } catch { /* audio blocked */ }
}

let CR: Record<string, string> | null = null;
function useCredits() {
  const [c, setC] = useState(CR || {});
  useEffect(() => { if (CR) return; fetch('/images/credits.json').then(r => r.json()).then(j => { CR = j; setC(j); }).catch(() => { }); }, []);
  return c;
}
function Pics({ slug }: { slug: string }) {
  const L = LAYOUT[slug], cr = useCredits();
  if (!L) return null;
  return (
    <div className={`pics ${L.k}`}>{L.imgs.map(i => (
      <figure key={i.f}>
        <img src={`/images/${i.f}.jpg`} alt={i.alt} loading="lazy" onError={e => ((e.currentTarget.parentElement as HTMLElement).style.display = 'none')} />
        <figcaption>{i.alt}{cr[i.f] && <em> · {cr[i.f]}</em>}</figcaption>
      </figure>))}</div>);
}

function HeroImg({ slug }: { slug: string }) {
  const i = LAYOUT[slug]?.imgs[0], cr = useCredits();
  if (!i) return null;
  return (<><img className="himg" src={`/images/${i.f}.jpg`} alt={i.alt} onError={e => (e.currentTarget.style.display = 'none')} />
    {cr[i.f] && <span className="credit">Photo: {cr[i.f]}</span>}</>);
}
const Items = ({ items }: { items: Item[] }) => (
  <ul className="items">{items.map(it => (
    <li key={it.t}><b>{it.t}</b> {it.d} {it.l && <a href={it.l} target="_blank" rel="noreferrer">{it.lt || 'Maps ↗'}</a>}</li>))}</ul>);

const Pg = forwardRef<HTMLDivElement, { n: number; hard?: boolean; cls?: string; children: ReactNode }>(
  ({ n, hard, cls = '', children }, ref) => (
    <div ref={ref} className={`pg ${cls}`} data-density={hard ? 'hard' : 'soft'}>
      <div className="in">{children}</div><span className="fn">{String(n).padStart(2, '0')}</span>
    </div>));

export default function App() {
  const book = useRef<any>(null);
  const muted = useRef(false);
  const [page, setPage] = useState(0);
  const [mute, setMute] = useState(false);
  const [toc, setToc] = useState(false);
  const [map, setMap] = useState(false);
  const [wide, setWide] = useState(
    () => typeof window !== 'undefined' &&
      window.matchMedia('(min-width: 700px)').matches
  );

  useEffect(() => {
    const media = window.matchMedia('(min-width: 700px)');

    const update = () => setWide(media.matches);

    update();
    media.addEventListener('change', update);

    return () => media.removeEventListener('change', update);
  }, []);
  const shift = !wide ? 'none' : page === 0 ? 'translateX(-25%)' : page >= PAGES.length - 1 ? 'translateX(25%)' : 'none';
  const total = PAGES.length;

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (map) return;
      if (e.key === 'ArrowRight') book.current?.pageFlip().flipNext();
      if (e.key === 'ArrowLeft') book.current?.pageFlip().flipPrev();
    };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [map]);

  const go = (i: number) => { setToc(false); book.current?.pageFlip().flip(i); };
  const label = (i: number) => String(i + 1).padStart(2, '0');

  return (
    <div className="app">
      <header><span>KOCHI · THE GANG GETAWAY</span><small>{LAST_CHECKED}</small></header>
      <main>
        <button className="arrow" aria-label="Previous page" onClick={() => book.current?.pageFlip().flipPrev()}>‹</button>
        <div className="stage"><div className="shift" style={{ transform: shift }}>
          <Flip ref={book} width={440} height={620} size="stretch"
            minWidth={280} maxWidth={680}
            minHeight={390} maxHeight={960}
            showCover drawShadow maxShadowOpacity={0.5} flippingTime={900} usePortrait startPage={0} startZIndex={0}
            autoSize mobileScrollSupport swipeDistance={30} clickEventForward useMouseEvents showPageCorners
            disableFlipByClick={false} className="book" style={{}}
            onFlip={(e: any) => { setPage(e.data); if (!muted.current) tick(); }}>
            {PAGES.map((p, i) => {
              const last = i === total - 1;
              if (p.kind === 'cover') return (
                <Pg key={i} n={1} hard cls="cover">
                  <img className="coverimg" src="/images/cover.jpg" alt="Chinese fishing nets at Fort Kochi" onError={e => (e.currentTarget.style.display = 'none')} /><div className="shade" />
                  <div className="ctop"><small>FRIENDS TRAVEL EDITION</small><small>MAY / JUNE 2027</small></div>
                  <h1>KOCHI</h1>
                  <div className="cbot"><h3>The Gang Getaway</h3><p className="tagline">“Nine Friends. Two Days. Countless Memories.”</p></div>
                </Pg>);
              const H = HERO[p.slug];
              if (H) return (
                <Pg key={i} n={i + 1} hard={last} cls="hero odd">
                  <HeroImg slug={p.slug} /><div className="shade2" />
                  <span className="label">{H.label}</span>
                  <h2 className="head">{H.head.map((l, j) => <span key={j} className={l[0] === '^' ? 'lg' : 'sm'}>{l.replace('^', '')}</span>)}</h2>
                  <div className="card"><p className="lead">{p.lead}</p><Items items={p.items} />
                    {p.note && <p className={last ? 'quote' : 'note'}>{p.note}</p>}<span className="status">{p.status}</span></div>
                </Pg>);
              return (
                <Pg key={i} n={i + 1} hard={last} cls={`${i % 2 ? 'odd' : 'even'} ${DARK.includes(p.slug) ? 'dark' : ''} ${PIC_BOTTOM.includes(p.slug) ? 'pb' : ''}`}>
                  <span className="kick">{p.kicker}</span><h2>{p.title}</h2>
                  {p.kind === 'map' ? <MapView full={false} onFull={setMap} /> : <Pics slug={p.slug} />}
                  <p className="lead">{p.lead}</p>
                  <Items items={p.items} />
                  {p.note && <p className={last ? 'quote' : 'note'}>{p.note}</p>}
                  <span className="status">{p.status}</span>
                </Pg>);
            })}
          </Flip>
        </div></div>
        <button className="arrow" aria-label="Next page" onClick={() => book.current?.pageFlip().flipNext()}>›</button>
      </main>
      <footer>
        <button onClick={() => setToc(!toc)}>☰ Contents</button>
        <span className="count">{label(page)} / {String(total).padStart(2, '0')}</span>
        <div className="bar"><i style={{ width: `${((page + 1) / total) * 100}%` }} /></div>
        <button onClick={() => { muted.current = !mute; setMute(!mute); }}>{mute ? '🔇 Sound off' : '🔊 Sound on'}</button>
      </footer>
      {toc && <div className="toc">{PAGES.map((p, i) => <button key={i} onClick={() => go(i)}><b>{label(i)}</b> {p.kind === 'cover' ? 'Cover' : p.title}</button>)}</div>}
      {map && <MapView full onFull={setMap} />}
    </div>
  );
}
