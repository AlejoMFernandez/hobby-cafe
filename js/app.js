import { LETRAS } from './letras.js?v=2';
import { GRANOS } from './granos.js?v=2';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const html = document.documentElement;
html.classList.add('js');
const TAZA = {
  cuerpo: 'M15 2 L3 46 L0 74 L21 148 L56 190 L80 200 L173 200 L174 197 L187 192 L206 180 L214 172 L239 120 L247 53 L247 21 L244 16 L170 11 L110 4 L18 0Z',
  asa: 'M273 21 L259 22 L255 27 L245 124 L249 128 L277 124 L282 121 L299 103 L312 80 L313 63 L304 41 L291 27Z'
};
const pesos = n => n == null ? '' : '$' + Math.round(n).toLocaleString('es-AR');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const leer = k => { try { return localStorage.getItem(k); } catch { return null; } };
const WA = '5491124833251';

// alto de pantalla fijo en px: el layout no salta con la barra del navegador ni con capturas de página entera
const fijarAlto = () => html.style.setProperty('--alto', innerHeight + 'px');
fijarAlto();

/* ---------- defs compartidos ---------- */
$('#defs').innerHTML =
  `<path id="taza-cuerpo" d="${TAZA.cuerpo}"/><path id="taza-asa" d="${TAZA.asa}"/>` +
  `<pattern id="grano" patternUnits="userSpaceOnUse" width="180" height="180"><image href="img/grano.webp" width="180" height="180"/></pattern>` +
  LETRAS.map((l, i) => `<clipPath id="letra-${i}" clipPathUnits="objectBoundingBox"><path d="${l.n}"/></clipPath>`).join('') +
  GRANOS.map((n, i) => `<clipPath id="grano-${i}" clipPathUnits="objectBoundingBox"><path d="${n}"/></clipPath>`).join('');
$$('.grano').forEach((g, i) => { g.style.clipPath = `url(#grano-${i})`; });

/* ---------- locales ---------- */
const LOCALES = {
  malabia: { nombre: 'Malabia', abre: [7, 30], cierra: [21, 30], lat: -34.592683, lng: -58.4296888 },
  guevara: { nombre: 'Guevara', abre: [8, 0], cierra: [20, 30], lat: -34.5881719, lng: -58.4469896 }
};
let local = leer('kit:hobby-cafe:sede') === 'guevara' ? 'guevara' : 'malabia';
const hh = ([h, mm]) => `${h}:${String(mm).padStart(2, '0')}`;
function abierto(L) {
  const ahora = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
  const m = ahora.getHours() * 60 + ahora.getMinutes();
  return m >= L.abre[0] * 60 + L.abre[1] && m < L.cierra[0] * 60 + L.cierra[1];
}
function estados() {
  const L = LOCALES[local];
  $$('[data-estado]').forEach(e => {
    e.innerHTML = abierto(L) ? `<b>Abierto</b> en ${L.nombre} · cierra a las ${hh(L.cierra)}` : `<b>Cerrado</b> en ${L.nombre} · abre a las ${hh(L.abre)}`;
  });
  Object.entries(LOCALES).forEach(([id, L]) => {
    const e = $(`[data-estado-sede="${id}"]`); if (!e) return;
    e.innerHTML = abierto(L) ? `<b>Abierto ahora</b> · cierra a las ${hh(L.cierra)}` : `<b>Cerrado</b> · abre a las ${hh(L.abre)}`;
  });
}

/* ---------- HERO: las letras del logo como ventanas ---------- */
// p: id del producto en cliente.json (nombre y precio salen de la carta del local elegido)
const VENTANAS = [
  [{ f: 'salon', n: 'el salón de Malabia' }, { f: 'vidriera', n: 'café & amigos' }, { f: 'gente', n: 'la apertura' }],
  [{ f: 'matcha', n: 'matcha latte', p: 'matcha-latte' }, { f: 'latte', n: 'latte', p: 'latte' }, { f: 'bluematcha', n: 'blue matcha' }],
  [{ f: 'avocado', n: 'avocado toast', p: 'avocado' }, { f: 'burrata', n: 'hot honey burrata', p: 'hot-honey-burrata' }, { f: 'hongos', n: 'conserva de hongos', p: 'hongos' }],
  [{ f: 'cookie', n: 'cookies de la casa' }, { f: 'tarta', n: 'pastelería del finde' }, { f: 'ribeye', n: 'ribeye gouda melt', p: 'ribeye' }],
  [{ f: 'iced', n: 'aerocano para llevar', p: 'aerocano' }, { f: 'espresso', n: 'espresso doble', p: 'espresso' }, { f: 'icedrosa', n: 'los fríos' }]
];
const UNIDAD_Y = 708;
let productos = [];
const prod = id => productos.find(p => p.id === id);

function armarLetras() {
  const cont = $('#letras'); if (!cont) return;
  const celu = !matchMedia('(min-width: 768px)').matches;
  const filas = celu ? [[0, 1, 2], [3, 4]] : [[0, 1, 2, 3, 4]];
  cont.innerHTML = '';
  const ancho = cont.clientWidth;
  const anchoU = celu ? (LETRAS[2].x + LETRAS[2].w - LETRAS[0].x) : (LETRAS[4].x + LETRAS[4].w - LETRAS[0].x);
  const k = ancho / anchoU;
  const abierta = html.classList.contains('listo') || !html.classList.contains('con-intro');
  filas.forEach(fila => {
    const div = document.createElement('div'); div.className = 'letras__fila';
    const x0 = LETRAS[fila[0]].x;
    fila.forEach(i => {
      const L = LETRAS[i];
      const el = document.createElement('div'); el.className = 'letra' + (abierta ? ' abierta' : '');
      Object.assign(el.style, {
        width: L.w * k + 'px', height: L.h * k + 'px', alignSelf: 'flex-start',
        marginLeft: ((L.x - (i === fila[0] ? x0 : LETRAS[i - 1].x + LETRAS[i - 1].w)) * k) + 'px',
        marginTop: ((L.y - UNIDAD_Y) * k) + 'px'
      });
      el.innerHTML = `<div class="letra__win" style="clip-path:url(#letra-${i})">` +
        VENTANAS[i].map((o, j) => `<img src="img/foto/${o.f}-480.webp" srcset="img/foto/${o.f}-480.webp 480w, img/foto/${o.f}.webp 900w" sizes="(min-width: 768px) 30vw, 34vw" alt="" width="900" height="1125" decoding="async" ${j ? 'loading="lazy"' : 'fetchpriority="high"'} class="${j ? '' : 've'}">`).join('') +
        `<div class="letra__tapa"></div></div>` +
        `<svg class="letra__borde" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true"><path d="${L.n}" vector-effect="non-scaling-stroke"/></svg>` +
        `<span class="letra__tag"></span><button type="button" aria-label="Ver qué hay en esta letra"></button>`;
      el.dataset.i = i; el.dataset.j = 0;
      div.appendChild(el);
    });
    cont.appendChild(div);
  });
  html.style.setProperty('--w-letras', ancho + 'px');
  $$('.letra').forEach(tagLetra);
  $$('.letra button').forEach(b => b.addEventListener('click', () => {
    const el = b.parentElement; const ya = el.classList.contains('tocada');
    $$('.letra.tocada').forEach(x => x.classList.remove('tocada'));
    if (!ya) { el.classList.add('tocada'); siguiente(el); }
  }));
}
function tagLetra(el) {
  const o = VENTANAS[el.dataset.i][el.dataset.j];
  const p = o.p && prod(o.p);
  el.querySelector('.letra__tag').textContent = p && p.precio != null ? `${o.n} · ${pesos(p.precio)}` : o.n;
}
function siguiente(el) {
  const imgs = $$('img', el); const j = +el.dataset.j; const n = (j + 1) % imgs.length;
  imgs.forEach(im => im.classList.remove('sale'));
  imgs[j].classList.remove('ve'); imgs[j].classList.add('sale');
  imgs[n].classList.add('ve');
  el.dataset.j = n; tagLetra(el);
}
let rotando = 0;
function rotarLetras() {
  clearInterval(rotando);
  let k = 0;
  rotando = setInterval(() => {
    if (document.hidden || window.scrollY > innerHeight) return;
    const ls = $$('.letra:not(.tocada)'); if (!ls.length) return;
    siguiente(ls[k % ls.length]); k += 2;
  }, 1800);
}

/* ---------- LA RONDA ---------- */
// id = producto de cliente.json (variante, si tiene tamaños). Nombre y precio salen de la carta del local.
const BEBIDAS = [
  { id: 'espresso', c: 'espresso', col: '#3A2722', f: 'espresso' },
  { id: 'cortado', c: 'café + leche', col: '#8A5A3C' },
  { id: 'flat', c: 'café + leche', col: '#B98657' },
  { id: 'latte', c: 'café + leche', col: '#D6B48F', f: 'latte' },
  { id: 'v60', v: '1', n: 'V60 para 1', c: 'filtrados', col: '#9C4A1E', f: 'filtro', d: 'Filtrado a mano, para 1.' },
  { id: 'matcha-latte', c: 'matcha', col: '#8DB33A', f: 'matcha' },
  { id: 'rasp-matcha', c: 'matcha · frío', col: '#E271AF' },
  { id: 'cold-foam', c: 'iced', col: '#C49A72' },
  { id: 'aerocano', n: 'Aerocano', c: 'iced', col: '#6B4A35', f: 'aerocano', d: 'Americano bien frío, para llevar o para quedarse.' },
  { id: 'limonada', v: 'vaso', n: 'Limonada frambuesa', c: 'tés y jugos', col: '#C9284A', d: 'Limonada de frambuesa, en vaso.' }
];
const MAX = 6;
let ronda = [];
let sel = -1;
const datosBebida = (b) => {
  const p = prod(b.id) || {};
  const precio = b.v ? (p.variantes || []).find(v => String(v.id) === b.v)?.precio : p.precio;
  return { n: b.n || p.nombre || b.id, d: b.d || p.descripcion || '', precio: precio ?? null };
};
const tazaSVG = (col) =>
  `<svg viewBox="0 0 314 201" aria-hidden="true"><path d="${TAZA.cuerpo}" fill="${col}"/><path d="${TAZA.asa}" fill="${col}"/>` +
  `<path d="${TAZA.cuerpo}" fill="url(#grano)" opacity=".5"/></svg>`;

function armarFichas() {
  const izq = $('.fichas--izq'), der = $('.fichas--der');
  izq.innerHTML = der.innerHTML = '';
  const desk = matchMedia('(min-width: 900px)').matches;
  BEBIDAS.forEach((b, i) => {
    const D = datosBebida(b);
    const el = document.createElement('button');
    el.type = 'button'; el.className = 'ficha'; el.dataset.id = b.id; el.setAttribute('role', 'listitem');
    el.innerHTML = tazaSVG(b.col) + `<span><b>${esc(D.n)}</b><span data-precio>${pesos(D.precio)}</span></span>`;
    el.setAttribute('aria-label', `Sumar ${D.n} a la ronda`);
    (desk && i >= 5 ? der : izq).appendChild(el);
    arrastrable(el, b.id);
  });
}
function arrastrable(el, id) {
  let x0 = null, y0, fantasma = null, mov = false;
  const escena = $('#escena');
  const sobre = (x, y) => { const r = escena.getBoundingClientRect(); return x > r.left && x < r.right && y > r.top && y < r.bottom; };
  const crear = () => { const b = BEBIDAS.find(z => z.id === id); fantasma = document.createElement('div'); fantasma.className = 'arrastre'; fantasma.innerHTML = tazaSVG(b.col); document.body.appendChild(fantasma); };
  el.addEventListener('pointerdown', e => { if (e.button) return; x0 = e.clientX; y0 = e.clientY; mov = false; try { el.setPointerCapture(e.pointerId); } catch {} });
  el.addEventListener('pointermove', e => {
    if (x0 == null) return;
    const dx = e.clientX - x0, dy = e.clientY - y0;
    if (!mov) {
      if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { mov = true; crear(); }
      else if (e.pointerType === 'mouse' && Math.hypot(dx, dy) > 8) { mov = true; crear(); }
      else if (Math.abs(dx) > 12) { x0 = null; try { el.releasePointerCapture(e.pointerId); } catch {} return; }
    }
    if (fantasma) { fantasma.style.left = e.clientX + 'px'; fantasma.style.top = e.clientY + 'px'; escena.classList.toggle('apunta', sobre(e.clientX, e.clientY)); }
  });
  el.addEventListener('pointerup', e => {
    if (x0 == null) return;
    if (fantasma) { if (sobre(e.clientX, e.clientY)) sumar(id); fantasma.remove(); fantasma = null; escena.classList.remove('apunta'); }
    else if (!mov) sumar(id);
    x0 = null;
  });
  el.addEventListener('pointercancel', () => { fantasma?.remove(); fantasma = null; x0 = null; escena.classList.remove('apunta'); });
  el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sumar(id); } });
}
function sumar(id) {
  if (ronda.length >= MAX) { aviso('La ronda ya tiene seis tazas :) Tocá una para sacarla.'); return; }
  ronda.push(id); cerrarInfo(); pintar(true);
}
function pintar(nueva) {
  const pila = $('#pila');
  const prev = pila.children.length;
  while (pila.children.length > ronda.length) pila.lastElementChild.remove();
  ronda.forEach((id, i) => {
    if (i < prev && pila.children[i]?.dataset.id === id) return;
    const b = BEBIDAS.find(z => z.id === id); const D = datosBebida(b);
    const t = document.createElement('button');
    t.type = 'button'; t.className = 'taza' + (i % 2 ? ' espejo' : ''); t.dataset.id = id;
    t.style.setProperty('--i', i); t.style.setProperty('--r', ((i * 37) % 7 - 3) * .8 + 'deg');
    t.setAttribute('aria-label', `${D.n}, taza ${i + 1} de la ronda. Ver detalle`);
    t.innerHTML = tazaSVG(b.col) + `<span class="taza__et">${esc(D.n.split(' ')[0].toLowerCase())}</span>`;
    if (!nueva || i < ronda.length - 1) t.style.animation = 'none';
    t.addEventListener('click', () => abrirInfo(i));
    if (pila.children[i]) pila.replaceChild(t, pila.children[i]); else pila.appendChild(t);
  });
  $('#fantasma').classList.toggle('oculto', ronda.length > 0);
  const total = ronda.reduce((s, id) => s + (datosBebida(BEBIDAS.find(z => z.id === id)).precio || 0), 0);
  $('#r-cant').textContent = `${ronda.length} de ${MAX}`;
  $('#r-total').textContent = `Total ${pesos(total)}`;
  $('#r-local').textContent = `retirás en ${LOCALES[local].nombre}`;
  $('#r-pedir').disabled = !ronda.length;
  $$('.ficha').forEach(f => f.setAttribute('aria-disabled', ronda.length >= MAX ? 'true' : 'false'));
}
function abrirInfo(i) {
  const b = BEBIDAS.find(z => z.id === ronda[i]); const D = datosBebida(b); sel = i;
  const box = $('#info');
  $$('.taza').forEach((t, k) => t.classList.toggle('sel', k === i));
  const foto = $('.ficha-info__foto', box);
  if (b.f) { foto.style.backgroundImage = `url(img/carta/${b.f}-s.webp)`; foto.innerHTML = ''; }
  else { foto.style.backgroundImage = 'none'; foto.innerHTML = tazaSVG(b.col); }
  $('.ficha-info__cat', box).textContent = b.c;
  $('.ficha-info__n', box).textContent = D.n;
  $('.ficha-info__d', box).textContent = D.d;
  $('.ficha-info__p', box).textContent = pesos(D.precio);
  const escena = $('#escena'), taza = $('#pila').children[i];
  const top = Math.max(6, Math.min(escena.clientHeight - 202, taza.offsetTop - 196));
  box.style.top = top + 'px';
  box.hidden = false;
  box.style.animation = 'none'; void box.offsetWidth; box.style.animation = '';
}
function cerrarInfo() { $('#info').hidden = true; sel = -1; $$('.taza.sel').forEach(t => t.classList.remove('sel')); }
$('.ficha-info__x').addEventListener('click', cerrarInfo);
$('.ficha-info__sacar').addEventListener('click', () => {
  if (sel < 0) return; const i = sel; cerrarInfo();
  $('#pila').children[i].classList.add('cae');
  setTimeout(() => { ronda.splice(i, 1); $('#pila').innerHTML = ''; pintar(false); }, 420);
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarInfo(); });
document.addEventListener('pointerdown', e => { if (!$('#info').hidden && !e.target.closest('#info, .taza')) cerrarInfo(); });

function aviso(t) {
  const a = $('#aviso'); a.textContent = t; a.hidden = false;
  clearTimeout(aviso.t); aviso.t = setTimeout(() => a.hidden = true, 3400);
}

/* ---------- carta: lo que más sale ---------- */
const FAV = [
  { id: 'avocado', f: 'avocado', n: 'Avocado toast', d: 'Hummus de arvejas, palta, semillas, especias y flores.' },
  { id: 'hot-honey-burrata', f: 'hot-honey-burrata', n: 'Hot honey burrata', d: 'Burrata, tomates confitados, kale crocante y miel picante.' },
  { id: 'hongos', f: 'hongos', n: 'Conserva de hongos', d: 'Ricota cremosa, hongos, sardo, zest de limón y aceite de trufa.' },
  { id: 'ribeye', f: 'ribeye', n: 'Ribeye gouda melt', d: 'Ojo de bife braseado, gouda, pickles y alioli en brioche.' },
  { id: 'focaccia', f: 'focaccia', n: 'Focaccia de pollo y pesto', d: 'Pollo, pesto, tomates confitados, fior di latte y verdes.' },
  { id: 'prosciutto', f: 'prosciutto', n: 'Prosciutto di Parma', d: 'Jamón crudo, brie, chutney de peras y hojas de estación.' },
  { id: 'salmon', f: 'salmon', n: 'Ensalada de salmón', d: 'Salmón, palta, arvejas, cherrys, crackers de semillas y más.' },
  { id: 'burrata', f: 'burrata', n: 'Burrata', d: 'Burrata, tomates cherry y pesto de albahaca.' }
];
function pintarVidriera() {
  const v = $('#vidriera'); if (!v) return;
  v.innerHTML = FAV.map((o, i) => {
    const p = prod(o.id);
    const precio = p ? (p.precio != null ? pesos(p.precio) : 'consultar') : '';
    return `<article class="plato" style="--i:${i}">
      <figure class="plato__foto"><img src="img/carta/${o.f}.webp" alt="${esc(o.n)}" width="600" height="750" loading="lazy" decoding="async"></figure>
      <div class="plato__txt"><h3>${esc(p?.nombre || o.n)}</h3><p>${esc(o.d)}</p></div>
      <div class="plato__pie"><b class="plato__p">${precio}</b><div data-kit-qty="${esc(o.id)}">${kit ? '' : '<span class="kit-add kit-add--ph" aria-hidden="true"></span>'}</div></div>
    </article>`;
  }).join('');
  if (kit?.carrito) kit.carrito.sync(v);
}
// carta completa (/carta) y market: mismo diseño de ítem
function plantilla(p, ctx) {
  const vs = (p.variantes || []).filter(v => v && v.precio != null);
  const pedible = ctx.carrito && ctx.pedible(p);
  return `<p class="prod__n">${esc(p.nombre)}</p><div class="prod__pie"><span class="prod__p">${vs.length ? 'desde ' + pesos(Math.min(...vs.map(v => v.precio))) : p.precio != null ? pesos(p.precio) : 'consultar'}</span>${pedible ? `<div data-kit-qty="${esc(p.id)}"></div>` : ''}</div>`;
}
document.addEventListener('kit:carta', (e) => { $$('.kit-item', e.detail.el).forEach(i => i.classList.add('prod')); });

/* ---------- eventos ---------- */
async function abrirEvento(tipo) {
  const f = document.createElement('form'); f.className = 'ev-form'; f.noValidate = true;
  f.innerHTML = `
    <fieldset class="ev-tipo"><legend>¿Qué tenés en mente?</legend>
      <label><input type="radio" name="tipo" value="en-hobby" ${tipo === 'en-hobby' ? 'checked' : ''}><span>Tu evento en Hobby</span></label>
      <label><input type="radio" name="tipo" value="en-tu-evento" ${tipo === 'en-tu-evento' ? 'checked' : ''}><span>Hobby en tu evento</span></label>
    </fieldset>
    <label>Tu nombre<input name="nombre" autocomplete="name" required></label>
    <div class="fila"><label>Fecha<input name="fecha" type="date"></label><label>Personas<input name="personas" type="number" inputmode="numeric" min="1" max="500" placeholder="30"></label></div>
    <label data-solo="en-hobby">Local<select name="local"><option>Malabia</option><option>Guevara</option></select></label>
    <label>Contanos un poco<textarea name="msg" maxlength="500" placeholder="Cumple, presentación, after office…"></textarea></label>
    <p class="ev-nota">Se abre WhatsApp con tu consulta armada. El equipo de Hobby te responde por ahí.</p>
    <button type="submit" class="recorte">Enviar por WhatsApp</button>`;
  const { popup } = await import('../kit/core/ui.js');
  const pop = popup({ titulo: 'eventos', contenido: f, clase: 'pop-ev' });
  const sync = () => { const t = f.tipo.value; $('[data-solo="en-hobby"]', f).hidden = t !== 'en-hobby'; };
  f.addEventListener('change', sync); sync();
  if (local === 'guevara') f.local.value = 'Guevara';
  f.addEventListener('submit', e => {
    e.preventDefault();
    if (!f.nombre.value.trim()) { f.nombre.focus(); f.nombre.setAttribute('aria-invalid', 'true'); return; }
    const t = f.tipo.value === 'en-hobby' ? `un evento en Hobby ${f.local.value}` : 'Hobby en mi evento (café / catering)';
    const L = [`¡Hola Hobby! Soy ${f.nombre.value.trim()} y quiero consultar por ${t}.`];
    if (f.fecha.value) L.push(`Fecha: ${f.fecha.value.split('-').reverse().join('/')}`);
    if (f.personas.value) L.push(`Personas: ${f.personas.value}`);
    if (f.msg.value.trim()) L.push(f.msg.value.trim());
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(L.join('\n'))}`, '_blank', 'noopener');
    pop.close(); aviso('Listo :) Seguimos por WhatsApp.');
  });
}
$$('[data-evento]').forEach(b => b.addEventListener('click', () => abrirEvento(b.dataset.evento)));

/* ---------- mapa ---------- */
let mapa = null, pines = {};
function cargarMapa() {
  if (mapa || cargarMapa.ok) return; cargarMapa.ok = true;
  const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'vendor/leaflet/leaflet.css'; document.head.appendChild(css);
  const s = document.createElement('script'); s.src = 'vendor/leaflet/leaflet.js'; s.async = true;
  s.onload = () => {
    const Lf = window.L;
    mapa = Lf.map('mapa', { scrollWheelZoom: false, zoomControl: true, attributionControl: true });
    Lf.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap &copy; CARTO' }).addTo(mapa);
    Object.entries(LOCALES).forEach(([id, L]) => {
      const icon = Lf.divIcon({ className: 'pin', html: `<svg viewBox="0 0 314 201"><path d="${TAZA.cuerpo}" fill="#E271AF" stroke="#443538" stroke-width="10"/><path d="${TAZA.asa}" fill="#E271AF" stroke="#443538" stroke-width="10"/></svg><span>${L.nombre}</span>`, iconSize: [54, 64], iconAnchor: [27, 34] });
      pines[id] = Lf.marker([L.lat, L.lng], { icon, title: `Hobby ${L.nombre}` }).addTo(mapa).on('click', () => ponerLocal(id));
    });
    mapa.fitBounds(Lf.latLngBounds(Object.values(LOCALES).map(L => [L.lat, L.lng])), { padding: [70, 70] });
    marcarPin();
  };
  document.head.appendChild(s);
}
function marcarPin() {
  Object.entries(pines).forEach(([id, m]) => m.getElement()?.classList.toggle('on', id === local));
  $$('.sede').forEach(s => s.classList.toggle('on', s.dataset.sede === local));
}

/* ---------- selector de local ---------- */
let kit = null;
async function ponerLocal(l, desdeKit = false) {
  local = l;
  $$('.local__op').forEach(b => b.setAttribute('aria-pressed', b.dataset.local === l ? 'true' : 'false'));
  $$('[data-local-nombre]').forEach(e => { e.textContent = LOCALES[l].nombre; });
  if (kit && !desdeKit) kit.carrito?.setSucursal(l);   // dispara kit:sucursal → kit:precios
  estados(); marcarPin(); pintar(false);
}
$$('.local__op').forEach(b => b.addEventListener('click', () => ponerLocal(b.dataset.local)));
async function refrescarPrecios() {
  if (!kit) return;
  productos = await kit.store.getProductos();
  armarFichas(); pintar(false); $$('.letra').forEach(tagLetra); pintarVidriera();
  if (sel >= 0) abrirInfo(sel);
}
document.addEventListener('kit:precios', refrescarPrecios);
document.addEventListener('kit:sucursal', e => { if (e.detail?.id && e.detail.id !== local) ponerLocal(e.detail.id, true); });

$('#r-pedir').addEventListener('click', () => {
  if (!kit?.carrito || !ronda.length) return;
  ronda.forEach(id => { const b = BEBIDAS.find(z => z.id === id); kit.carrito.agregar(id, 1, b.v ? { variante: b.v } : {}); });
  kit.carrito.abrir();
});

const servirIO = new IntersectionObserver(([e]) => {
  if (!e.isIntersecting) return; servirIO.disconnect();
  if (ronda.length) return;
  setTimeout(() => sumar('flat'), 350); setTimeout(() => sumar('matcha-latte'), 800);
}, { threshold: 0.45 });
servirIO.observe($('#escena'));

/* ---------- entradas, índice y detalles ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('visto'); io.unobserve(e.target);
}), { threshold: 0, rootMargin: '0px 0px -8% 0px' });
let rvRaf = 0;
addEventListener('scroll', () => { if (rvRaf) return; rvRaf = requestAnimationFrame(() => { rvRaf = 0; $$('.rv:not(.visto)').forEach(r => { if (r.getBoundingClientRect().top < innerHeight * .95) { r.classList.add('visto'); io.unobserve(r); } }); }); }, { passive: true });
function observar() {
  $$('.sec-cab, .eventos__papeles, .sede, .locales__info header, .estante__nivel, .eventos__txt header').forEach(c => $$('.rv', c.parentElement).forEach((r, i) => r.style.setProperty('--d', i % 4)));
  $$('.rv').forEach(r => io.observe(r));
}
const mapaIO = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { cargarMapa(); mapaIO.disconnect(); } }, { rootMargin: '600px' });
mapaIO.observe($('#mapa'));
const secs = ['inicio', 'ronda', 'carta', 'malabia', 'eventos', 'market', 'locales'];
const navIO = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const id = e.target.classList.contains('heroA') ? 'inicio' : e.target.id;
  $$('.indice a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + id));
}), { rootMargin: '-45% 0px -50% 0px' });
secs.forEach(id => { const el = id === 'inicio' ? $('.heroA') : document.getElementById(id); if (el) navIO.observe(el); });
// logo chico y píldora del panel: nunca sobre el hero ni sobre la ronda en el celu
const heroIO = new IntersectionObserver(([e]) => html.classList.toggle('pasado', !e.isIntersecting), { threshold: 0.08 });
heroIO.observe($('.heroA'));
const tapan = new Set();
const pillIO = new IntersectionObserver(es => {
  es.forEach(e => e.isIntersecting ? tapan.add(e.target) : tapan.delete(e.target));
  const pie = [...tapan].some(t => t.classList.contains('pie'));
  html.classList.toggle('oculta-pill', pie || tapan.size > 0);
}, { threshold: 0.12 });
[$('.heroA'), $('#escena'), $('.pie')].forEach(el => pillIO.observe(el));

/* ---------- arranque ---------- */
armarLetras(); armarFichas(); pintar(false); pintarVidriera(); estados(); observar();
setInterval(estados, 60000);
let ancho = innerWidth;
addEventListener('resize', () => { if (Math.abs(innerWidth - ancho) < 2) return; ancho = innerWidth; fijarAlto(); armarLetras(); armarFichas(); pintar(false); }, { passive: true });

function abrir() {
  html.classList.add('listo');
  [...$$('.heroA__sobre'), ...$$('.heroA__pie > *')].forEach((e, i) => e.style.setProperty('--d', i));
  $$('.letra').forEach((l, i) => setTimeout(() => l.classList.add('abierta'), 60 + i * 110));
  setTimeout(() => { html.classList.remove('con-intro'); rotarLetras(); }, 700);
}
if (html.classList.contains('con-intro')) {
  const celu = innerWidth < 768;
  const t0 = performance.now();
  Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 450))]).then(() => {
    armarLetras(); $$('.letra').forEach((l, i) => { l.style.setProperty('--k', i); l.classList.add('cae'); });
    const im = $('.letra img');
    return Promise.race([new Promise(r => { if (!im || im.complete) r(); else { im.onload = im.onerror = r; } }), new Promise(r => setTimeout(r, celu ? 700 : 1200))]);
  }).then(() => setTimeout(abrir, Math.max(0, (celu ? 850 : 1100) - (performance.now() - t0))));
} else { html.classList.add('listo'); $$('.letra').forEach(l => l.classList.add('abierta')); rotarLetras(); }

// el kit (carta, carrito, panel) arranca aparte: la página nunca espera por él
const arrancarKit = () => import('../kit/kit.js?v=22').then(({ initKit }) => initKit({
  config: 'cliente.json',
  carta: { template: plantilla, itemClass: 'prod' },
  imagenes: { lqip: 'img/lqip.json', selector: 'img:not(.letra img)' },
  carrito: { label: 'Tu bolsa', icono: `<svg viewBox="0 0 24 24"><path d="M5 8h14l-1.2 12H6.2L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>` },
  badge: true
}).then(async k => {
  kit = k;
  productos = await kit.store.getProductos();
  armarFichas(); pintar(false); $$('.letra').forEach(tagLetra); pintarVidriera();
  kit.store.onChange(async () => { productos = await kit.store.getProductos(); pintarVidriera(); $$('.letra').forEach(tagLetra); });
  if (kit.carrito?.sucursal?.id !== local) kit.carrito?.setSucursal(local);
  ponerLocal(local, true);
})).catch(err => console.error('[hobby] kit', err));
// el kit se carga después de la primera pantalla: el hero no lo espera
if (document.readyState === 'complete') setTimeout(arrancarKit, 300); else addEventListener('load', () => setTimeout(arrancarKit, 300), { once: true });
