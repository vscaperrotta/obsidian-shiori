# Shiori — Reading Library (Books, Manga & Comics)

An Obsidian plugin to search, save, and manage your reading collection (books, manga, comics). It supports searches through external providers (e.g. Google Books), stores the library as a JSON file in the vault, and manages read status and ratings.

## Key Features

- Search for volumes using external APIs and quickly import metadata.
- Local library stored as a structured JSON file in the vault.
- Reading status (`read`), star ratings, and personal notes.
- Responsive UI with `grid` or `list` modes, detail modals, and a rating widget.

## Demo

##### Features
<p style="text-align: center;">
    <img src="./assets/Screenshot1.png" width="400" />
    <img src="./assets/Screenshot2.png" width="400" />
</p>

##### Settings
<p style="text-align: center;">
    <img src="./assets/Screenshot3.png" width="400" />
</p>

## Requirements
- Node.js >= 22.16.0 (for development and build)

## Development
Main commands (run from the project root):

```bash
npm install
npm run dev # development: esbuild + watch sass
npm run build # production build
```

## Configuration

### API Key (optional)

To expand searches or get more detailed results you can use an API key (e.g. Google Books). Add the key in the plugin settings.

### Library Folder and File

By default the library is saved in a configurable folder inside the vault (see plugin settings). The JSON file can be created/loaded/saved via the plugin interface.

## Quick Start

1. Open the plugin view from the ribbon or via the available command.
2. Use the search bar to find a volume.
3. Open the detail view and use actions to add to the library, mark as read, or rate.

## Project Structure (summary)

```
src/
├── main.ts                    # Plugin entrypoint
├── constants.ts
├── services/
│   ├── bookService.ts         # API calls and result normalization
│   └── storage.ts             # Create / load / save JSON
├── settings/
│   └── settingsTab.ts         # Settings UI
├── ui/                        # UI components and modals
└── views/
    └── libraryView.ts         # Main view
```

For technical details and data models, see `TECHNICAL.md`.

**Version**: 1.0.0
**Minimum Obsidian Version**: 0.15.0

If you want to support development: https://ko-fi.com/vittorioscaperrotta