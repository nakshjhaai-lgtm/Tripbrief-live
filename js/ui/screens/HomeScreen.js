import { state } from '../../state.js';
import { dateRange } from '../../utils/dates.js';
import { escapeHtml } from '../../utils/text.js';
export function HomeScreen() {
  const trip = state.activeTrip; const score = trip?.readinessScore || 0; const missing = state.pack?.readinessSnapshot?.missing || [];
  return `<section class="hero screen-enter">
    <article class="hero-panel card reveal-stagger">
      <div><span class="status-pill ${state.online?'':'offline'}">${state.online ? 'Autopilot Active' : 'You’re offline'}</span> <span class="badge good">${state.pack ? 'Offline Pack Ready' : 'Lifeboat Pack pending'}</span></div>
      <h1>Dump travel stuff.<br>We’ll build the trip.</h1>
      <p class="lede">A private travel folio that saves first, reads later, and turns online context into offline readiness.</p>
      <div class="action-row"><button class="button brass" data-route="dump">Dump Travel Stuff</button><button class="button secondary" data-route="timeline">Today Brief</button><button class="button danger" data-route="panic">Panic Mode</button></div>
      <aside class="folio-ticket" aria-label="Trip summary"><p class="eyebrow">Active trip</p><strong>${escapeHtml(trip?.title || 'Travel Dump')}</strong><p>${escapeHtml(trip ? dateRange(trip) : 'No dates yet')}</p></aside>
    </article>
    <aside class="readiness-card card reveal-stagger">
      <div><p class="eyebrow">Readiness</p><div class="progress-ring" style="--score:${score}"><span id="scoreNumber">${score}</span></div><h2>${score}% ready</h2><p>${missing.length ? `${missing.length} quick wins left` : 'Lifeboat essentials look prepared'}</p></div>
      <ul class="checklist">${(missing.length?missing:[{label:'Timeline saved'},{label:'Documents stored'},{label:'Share pack generated'}]).map(m=>`<li>${escapeHtml(m.label)}</li>`).join('')}</ul>
    </aside>
  </section>
  <section class="grid three" style="margin-top:1rem"><article class="card pad pack-ready"><strong>Offline Pack</strong><p>${state.pack?.summary?.status || 'Partial'} · generated locally.</p></article><article class="card pad"><strong>Privacy-first</strong><p>No account or backend is required for saved trip data.</p></article><article class="card pad"><strong>Proof kept</strong><p>Original screenshots and files remain available.</p></article></section>`;
}
