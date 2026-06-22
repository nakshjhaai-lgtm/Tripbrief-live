import { state } from '../../state.js';
import { rawCard } from '../components.js';
export function DumpScreen() { return `<section class="dump-zone screen-enter reveal-stagger">
  <div><p class="eyebrow">Universal Dump</p><h1 class="display" style="font-size:clamp(3rem,10vw,7rem);margin:.2rem 0">Save first.<br>Ask later.</h1></div>
  <article class="drop-card card"><div><p class="eyebrow">Drop zone</p><h2>Dump travel stuff here.</h2><p>Screenshots, PDFs, copied confirmations, hotel notes, boarding passes, or plain text.</p><div class="action-row"><button class="button brass" id="clipboardBtn">Import Clipboard</button><label class="button secondary" for="fileInput">Add Screenshots/PDFs</label><label class="button secondary" for="cameraInput">Take Photo</label></div><input id="fileInput" type="file" accept="image/*,.pdf,text/plain" multiple hidden><input id="cameraInput" type="file" accept="image/*" capture="environment" hidden></div></article>
  <article class="card pad"><div class="field"><label for="manualText">Paste text</label><textarea id="manualText" rows="7" placeholder="Paste booking email text, SMS, WhatsApp itinerary, hotel notes…"></textarea></div><button class="button" id="saveTextBtn" style="margin-top:.75rem">Save pasted text</button></article>
  <section><h2>Saved proof inbox</h2><div class="item-list">${state.rawItems.length ? state.rawItems.map(rawCard).join('') : '<div class="empty">Nothing saved yet. Import anything; the app stores it locally immediately.</div>'}</div></section>
</section>`; }
