import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PLACES, METRO_LINES, DAY1_ORDER, gm, Place } from './data';
import { PHOTO } from './images';

const COL: Record<string, string> = { sight: '#c8553d', beach: '#d9a441', metro: '#1f5f8b', stay: '#2f7d5b', park: '#8a3fa0' };
const LABEL: Record<string, string> = { sight: 'Attraction', beach: 'Beach', metro: 'Water Metro', stay: 'Stay', park: 'Wonderla' };
const icon = (t: string) => L.divIcon({ className: '', html: `<span class="pin" style="background:${COL[t]}"></span>`, iconSize: [22, 22], iconAnchor: [11, 11] });
const coord = (id: string): [number, number] => { const p = PLACES.find(x => x.id === id)!; return [p.lat, p.lng]; };

export default function MapView({ full, onFull }: { full: boolean; onFull: (v: boolean) => void }) {
  const root = useRef<HTMLDivElement>(null), el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map>(), grp = useRef<L.LayerGroup>();
  const [sel, setSel] = useState<Place | null>(null);
  const [f, setF] = useState({ d1: true, d2: true, metro: true, route: true });
  const shown = PLACES.filter(p => p.type === 'metro' ? f.metro : p.day === 1 ? f.d1 : p.day === 2 ? f.d2 : true);

  useEffect(() => { // keep the page-flip from stealing drags/taps made on the map
    const r = root.current!, stop = (e: Event) => e.stopPropagation();
    const evs = ['mousedown', 'touchstart', 'pointerdown', 'wheel'];
    evs.forEach(e => r.addEventListener(e, stop)); return () => evs.forEach(e => r.removeEventListener(e, stop));
  }, [full]);

  useEffect(() => {
    const m = L.map(el.current!, { scrollWheelZoom: full }).setView([9.99, 76.28], full ? 12 : 11);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap contributors' }).addTo(m);
    grp.current = L.layerGroup().addTo(m); map.current = m;
    const t = [100, 600, 1500].map(ms => setTimeout(() => m.invalidateSize(), ms));
    // the page-flip hides pages that are not on screen (size 0) -> re-measure whenever the map becomes visible
    const ro = new ResizeObserver(() => m.invalidateSize()); ro.observe(el.current!);
    return () => { ro.disconnect(); t.forEach(clearTimeout); m.remove(); };
  }, [full]);

  useEffect(() => {
    const g = grp.current; if (!g) return; g.clearLayers();
    shown.forEach(p => L.marker([p.lat, p.lng], { icon: icon(p.type) }).on('click', () => pick(p)).addTo(g));
    if (f.route && f.d1) L.polyline(DAY1_ORDER.map(coord), { color: '#c8553d', weight: 3 }).addTo(g);
    if (f.metro) METRO_LINES.forEach(l => L.polyline(l.ids.map(coord), { color: '#1f5f8b', weight: 4, dashArray: '8 8' }).addTo(g));
  }, [f, full]);

  const pick = (p: Place) => { setSel(p); map.current?.flyTo([p.lat, p.lng], 15, { duration: 0.8 }); };
  const T = (k: keyof typeof f, label: string) => (
    <label><input type="checkbox" checked={f[k]} onChange={() => setF({ ...f, [k]: !f[k] })} /> {label}</label>);
  const photo = sel && PHOTO[sel.id];

  const body = (
    <div ref={root} className={`mapov ${full ? 'full' : 'emb'}`}>
      <div className="mapwrap">
        <div ref={el} className="map" />
        <div className="mapbar">{T('d1', 'Day 1')}{T('d2', 'Day 2')}{T('metro', 'Water Metro')}{T('route', 'Route')}
          <button onClick={() => onFull(!full)}>{full ? '✕ Close' : '⤢ Full screen'}</button></div>
        <div className="legend">{Object.keys(COL).map(k => <span key={k}><i style={{ background: COL[k] }} />{LABEL[k]}</span>)}
          <small>Dashed = Water Metro, solid = Day 1 route — both schematic, not exact paths</small></div>
        {sel && (
          <aside className="panel">
            <button className="x" onClick={() => setSel(null)}>✕</button>
            {photo && <img src={`/images/${photo}.jpg`} alt={sel.name} onError={e => (e.currentTarget.style.display = 'none')} />}
            <span className="chip" style={{ background: COL[sel.type] }}>{LABEL[sel.type]}</span>
            <h3>{sel.name}</h3><p>{sel.desc}</p>
            <p><b>Why go:</b> {sel.why}</p><p><b>Time:</b> {sel.time}</p>
            {sel.approx && <p className="warn">Pin approximate — confirm via Google Maps.</p>}
            <a href={gm(`${sel.name} Kochi`)} target="_blank" rel="noreferrer">Directions ↗</a>
          </aside>)}
      </div>
      <div className="cards">{shown.map(p => (
        <button key={p.id} className={`pc ${sel?.id === p.id ? 'on' : ''}`} onClick={() => pick(p)}>
          {PHOTO[p.id] && <img src={`/images/${PHOTO[p.id]}.jpg`} alt={p.name} loading="lazy" onError={e => (e.currentTarget.style.display = 'none')} />}
          <b>{p.name}</b><small>{p.desc}</small><i>{LABEL[p.type]} · {p.time}</i>
        </button>))}</div>
    </div>);
  return full ? createPortal(body, document.body) : body;
}
