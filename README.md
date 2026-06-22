# TripBrief Live

**Online Autopilot. Offline Lifeboat.**

This workspace contains a static, local-first PWA implementation scaffold based on the supplied blueprint. It includes:

- Installable PWA shell (`manifest.webmanifest`, `sw.js`).
- Offline app-shell caching for all local CSS/JS/assets.
- IndexedDB database and object stores aligned with the blueprint.
- Universal Dump: clipboard, text paste, file upload, camera input, share-target intake.
- Local raw-item storage before processing.
- OCR adapter that lazy-loads Tesseract.js when online; if OCR is unavailable, the original image remains saved and the item is marked for checking.
- Conservative parser for hotel hints, flight codes, dates, times, confirmation codes, and possible addresses.
- Auto trip creation and Offline Pack generation.
- Panic Mode, family-safe text export, Markdown/HTML/ICS downloads.
- Optional online enrichment functions for weather, Wikimedia summaries, and currency cache.

## Run locally

```bash
cd tripbrief-live
python3 -m http.server 4173
```

Open `http://localhost:4173/`.

## Important limitations

- The app does not claim live gate/delay alerts.
- OCR depends on loading Tesseract.js from a CDN at runtime. If the CDN is blocked or offline before OCR assets are cached, OCR will fail gracefully and keep the original proof image.
- PDF text extraction is not implemented in this scaffold; PDFs are saved as proof files.
- Vault encryption modules are scaffolded, but the document wallet workflow is Phase 6 work.
