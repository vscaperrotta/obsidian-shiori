## Documentazione tecnica — Shiori (Library for Books, Manga & Comics)

Questa documentazione descrive l'architettura, i principali componenti e il modello dati del plugin Shiori (gestione libreria di libri, manga e fumetti) sviluppato per Obsidian.

**Stato progetto:** frontend TypeScript + bundle con esbuild, stili in SCSS.

### Panoramica dell'architettura

- **Entrypoint plugin:** [src/main.ts](src/main.ts) — gestione ciclo di vita del plugin, caricamento impostazioni, registrazione view e comandi.
- **View principale:** [src/views/libraryView.ts](src/views/libraryView.ts) — rendering della libreria, interazioni utente, apertura modali.
- **Servizi:**
  - [src/services/bookService.ts](src/services/bookService.ts) — wrapper per chiamate a servizi esterni (es. Google Books API) e normalizzazione dei risultati.
  - [src/services/storage.ts](src/services/storage.ts) — funzioni per creare/caricare/salvare la libreria in un file JSON dentro la vault.
- **UI & componenti:** [src/ui/](src/ui/) — modali, suggerimenti di file, widget di rating e flow di onboarding.
- **Settings:** [src/settings/settingsTab.ts](src/settings/settingsTab.ts) — pannello settings per configurare API key, cartella e modalità di visualizzazione.
- **Tipi TypeScript:** [src/types/](src/types/) — `BookType.ts`, `DataType.ts`, `googleBooks.ts`, `RatingType.ts`.

### Modello dati (formato JSON salvato)

La libreria è salvata come singolo oggetto JSON contenente metadata e un array di elementi (`books`). Esempio semplificato:

```ts
interface ShioriData {
  schemaVersion: number;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  libraryName?: string;
  owner?: string;
  source?: string;
  books: ShioriBook[];
}

interface ShioriBook {
  id: string;           // uuid
  isbn?: string;
  volumeId?: string;    // id dal provider (es. Google Books)
  title: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  pageCount?: number;
  categories?: string[];
  thumbnail?: string;    // remote url
  thumbnailLocal?: string; // percorso locale in vault (opzionale)
  description?: string;
  starRating?: number;   // 0-5
  read?: boolean;
  notes?: string;
}
```

Il file di default viene creato da `createJsonFile()` in `storage.ts` e i record vengono normalizzati prima del salvataggio/caricamento.

### `storage.ts` — persistente in vault

Funzioni principali:

- `getDefaultPath(folder?)` — path di default per il file (es. `Shiori/libraryStorage.json`).
- `createJsonFile(app, folder?)` — crea il file JSON nella vault; se esiste già, viene generato un nuovo file con suffisso timestamp.
- `loadLocalFile(app, file)` — legge e valida il JSON dalla vault; normalizza gli elementi e riporta errori chiari su formato non valido.
- `saveLocalData(app, file, data)` — serializza e salva il JSON formattato nella vault.
- `ensureFolder(app, folder?)` — crea la cartella se non esiste.

Queste funzioni usano l'API `app.vault` di Obsidian e gestiscono errori I/O e validazione schema.

### `bookService.ts` — integrazione provider esterni

Responsabilità principali:

- `searchBooks(query, apiKey?, options?)` — ricerca tramite Google Books (o altro provider configurato) e restituisce lista semplificata di risultati.
- `getBookDetails(volumeId, apiKey?)` — recupera dettagli completi del volume (descrizione estesa, liste, immagini).

Nota: le chiamate esterne sono resilienti a errori di rete (corte ritentativi) e restituiscono risultati vuoti o `null` quando manca la `apiKey` o si verifica un errore.

### Impostazioni plugin

Le impostazioni vengono salvate con `this.saveData()` in `src/main.ts`. Campi usati comunemente:

```ts
interface PluginSettings {
  localJsonPath?: string | null; // path file JSON nella vault
  googleApiKey?: string | null;  // opzionale per ricerche più estese
  viewMode?: 'grid' | 'list';
  libraryFolder?: string;        // cartella dove salvare il JSON
}
```

### Styling

Gli stili SCSS sono in `src/styles/` e compilati in `styles.css` durante la build. I nomi delle classi seguono la convenzione `plugin-` per evitare collisioni.

### Build e sviluppo

- `npm install` — installa dipendenze di sviluppo.
- `npm run dev` — esbuild in watch mode + compilazione SCSS in watch.
- `npm run build` — bundle finale per distribuzione (includes `prebuild` per SCSS).

File di configurazione rilevanti: `package.json`, `tsconfig.json`, `esbuild.config.mjs`.

Requisiti: Node.js 22+ (consigliato).

### Debug e test

- Eseguire `npm run dev` e aprire Obsidian con la cartella del plugin nella vault per hot-reload.
- Usare la console di Obsidian per log di rete e I/O.

### Linee guida contributo

- PR piccole e mirate; rispettare lo stile TypeScript esistente.
- Aggiornare `TECHNICAL.md` quando si modifica il modello dati o le API di persistenza.
- Documentare eventuali nuove dipendenze nel `package.json` e aggiornare le istruzioni di build.

---
Aggiornato: documentazione tecnica allineata al codice sorgente presente nella cartella `src/`.
