import { state } from '../../state.js';
import { dateRange } from '../../utils/dates.js';
import { escapeHtml } from '../../utils/text.js';
export function HomeScreen() {
  const trip = state.activeTrip; const score = trip?.readinessScore || 0; const missing = state.pack?.readinessSnapshot?.missing || [];
  return `<section class="hero screen-enter">
    <article class="hero-panel card reveal-stagger">
      <div class="calm-stack"><span class="status-pill ${state.online?'':'offline'}">${state.online ? 'Autopilot Active' : 'You’re offline'}</span> <span class="badge good">${state.pack ? 'Offline Pack Ready' : 'Nothing to fix yet'}</span></div>
      <h1>Dump travel stuff.<br>We’ll build the trip.</h1>
      <p class="lede">No setup maze. No perfect itinerary required. Drop a screenshot, paste a message, or add a PDF — TripBrief saves it first and quietly turns it into a calm offline pack.</p>
      <div class="action-row"><button class="button brass" data-route="dump">Add travel stuff</button><button class="button secondary" data-route="timeline">Review timeline</button><button class="button calm-danger" data-route="panic">Open Lifeboat</button></div>
      <div class="reassurance-row"><span>Saved locally</span><span>Review later</span><span>Works offline</span></div>
      <aside class="folio-ticket" aria-label="Trip summary"><p class="eyebrow">Current folio</p><strong>${escapeHtml(trip?.title || 'Travel Dump')}</strong><p>${escapeHtml(trip ? dateRange(trip) : 'Add anything to begin')}</p></aside>
    </article>
    <aside class="readiness-card card reveal-stagger">
      <div><p class="eyebrow">Readiness</p><div class="progress-ring" style="--score:${score}"><span id="scoreNumber">${score}</span></div><h2>${score}% ready</h2><p>${missing.length ? `${missing.length} quick wins left` : 'Lifeboat essentials look prepared'}</p></div>
      <ul class="checklist">${(missing.length?missing:[{label:'Timeline saved'},{label:'Documents stored'},{label:'Share pack generated'}]).map(m=>`<li>${escapeHtml(m.label)}</li>`).join('')}</ul>
    </aside>
  </section>
  <section class="grid three calm-cards" style="margin-top:1rem"><article class="card pad pack-ready"><span class="soft-icon">01</span><strong>Save first</strong><p>Every dump is stored locally before TripBrief tries to read it.</p></article><article class="card pad"><span class="soft-icon">02</span><strong>Check gently</strong><p>Uncertain details are shown as candidates, never silently treated as facts.</p></article><article class="card pad"><span class="soft-icon">03</span><strong>Leave ready</strong><p>Your Pack keeps addresses, codes, proof, and exports available offline.</p></article></section>`;
}
