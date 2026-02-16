import { ItemView, WorkspaceLeaf, TFile, Notice, setIcon } from "obsidian";
import LibraryPlugin from "../main";
import { VIEW_TYPE, NAME } from "../constants";
import { Data } from "../types/DataType";
import { Book } from "../types/BookType";
import { renderOnboarding } from "../ui/onboardingFlow";
import { LibraryItemActionModal } from "../ui/modals/actionModal";
import { LibraryItemDetailModal } from "../ui/modals/detailModal";
import { JsonFileSuggestModal } from "../ui/FileSuggestModal";
import {
  createEmptyElement,
  createJsonFile,
  loadLocalFile,
  saveLocalData
} from "../services/storage";
import { searchBooks, getBookDetails } from "../services/bookService";
import { createStarRating } from "../ui/ratingWidget";
import { nullSafe } from "../utils/helpers";

export default class ShioriView extends ItemView {
  plugin: LibraryPlugin;
  file: TFile | null = null;
  data: Data | null = null;
  itemsContainer: HTMLElement | null = null;
  viewMode: "grid" | "list" = "grid";

  constructor(leaf: WorkspaceLeaf, plugin: LibraryPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType() {
    return VIEW_TYPE;
  }

  getDisplayText() {
    return NAME;
  }

  getIcon(): string {
    return "book-open-text";
  }

  async onOpen() {
    this.viewMode = this.plugin.viewMode ?? "grid";
    await this.initializeData();
    await this.render();
  }

  private async render() {
    const container = this.containerEl.children[1] as HTMLElement;
    container.empty();

    const header = container.createDiv({ cls: "obs-plugin-header" });
    header.createEl("h1", {
      text: NAME,
      cls: "obs-plugin-title"
    });

    header.createEl("p", {
      text: "This plugin allow you to manage your books, manga and comics.",
      cls: "obs-plugin-header-text"
    });

    if (!this.data) {
      renderOnboarding(container, async () => {
        this.file = await createJsonFile(this.plugin.app, this.plugin.libraryFolder);
        if (this.file) {
          await this.plugin.setLocalJsonPath(this.file.path);
        }
        await this.loadFile(this.file);
        await this.render();
      }, () => {
        new JsonFileSuggestModal(this.plugin.app, async (file) => {
          await this.loadFile(file);
          await this.render();
        }).open();
      });
      return;
    }

    const searchBox = container.createDiv({ cls: "obs-plugin-search" });
    const searchInputsGroup = searchBox.createDiv({ cls: "obs-plugin-search-inputs-group" });

    const searchInputContainer = searchInputsGroup.createDiv({ cls: "obs-plugin-search-input-container" });
    const searchInput = searchInputContainer.createEl("input", {
      cls: "obs-plugin-search-input",
      attr: { placeholder: "Search" }
    });

    let resultsList: HTMLElement | null = null;

    const content = container.createDiv({ cls: "obs-plugin-content" });
    this.itemsContainer = content;

    this.renderElements(content);

    let searchTimeout: number | null = null;
    const runSearch = async () => {
      const query = searchInput.value.trim();
      if (!query) return;
      const results = await searchBooks(query);

      if (!results || results.length === 0) {
        if (!resultsList) resultsList = searchBox.createDiv({ cls: "obs-plugin-search-results" });
        resultsList.empty();
        resultsList.createEl("div", { text: "No results found.", cls: "obs-plugin-search-empty" });
        return;
      }

      if (!resultsList) resultsList = searchBox.createDiv({ cls: "obs-plugin-search-results" });
      await this.renderSearchResults(resultsList, results);
    };

    searchInput.addEventListener("input", () => {
      if (!searchInput.value.trim()) {
        if (resultsList) { resultsList.empty(); resultsList.remove(); resultsList = null; }
        if (searchTimeout) { window.clearTimeout(searchTimeout); searchTimeout = null; }
        return;
      }
      if (searchTimeout) window.clearTimeout(searchTimeout);
      searchTimeout = window.setTimeout(runSearch, 350);
    });
  }

  private renderElements(container: HTMLElement) {
    container.empty();

    if (!this.data) { container.createEl("p", { text: "No library loaded." }); return; }

    const header = container.createDiv({ cls: "obs-plugin-tab-header" });
    const viewToggle = header.createDiv({ cls: "obs-plugin-view-toggle" });

    const gridButton = viewToggle.createEl("button", {
      cls: "obs-plugin-view-button", attr: { "aria-label": "Grid view", title: "Grid view" }
    });
    const listButton = viewToggle.createEl("button", {
      cls: "obs-plugin-view-button", attr: { "aria-label": "List view", title: "List view" }
    });
    setIcon(gridButton, "layout-grid"); setIcon(listButton, "list");

    if (this.viewMode === "grid") {
      gridButton.classList.add("obs-plugin-view-button-active");
    } else { listButton.classList.add("obs-plugin-view-button-active"); }

    const tabContent = container.createDiv({ cls: "obs-plugin-tab-content" });
    this.renderElementSection(tabContent, this.data.items);

    gridButton.addEventListener("click", async () => {
      if (this.viewMode === "grid") {
        return
      };
      this.viewMode = "grid";
      await this.plugin.setViewMode("grid");
      this.renderElements(container);
    });
    listButton.addEventListener("click", async () => {
      if (this.viewMode === "list") {
        return
      };
      this.viewMode = "list";
      await this.plugin.setViewMode("list");
      this.renderElements(container);
    });
  }

  private renderElementSection(container: HTMLElement, items: Book[]) {
    const section = container.createDiv({
      cls: "obs-plugin-section"
    });
    const emptyStateContainer = section.createDiv({
      cls: "obs-plugin-section-empty-container"
    });
    if (items.length === 0) {
      emptyStateContainer.createEl("p", {
        text: "No books or magazines in this list."
      });
      return;
    }

    const list = section.createDiv({ cls: this.viewMode === "grid" ? "obs-plugin-element-grid" : "obs-plugin-element-list" });
    if (this.viewMode === "grid") {
      this.renderElementGrid(list, items);
    } else {
      this.renderElementList(list, items)
    };
  }

  private renderElementGrid(container: HTMLElement, items: Book[]) {
    items.forEach((item) => {

      const card = container.createDiv({ cls: "obs-plugin-element-card" });
      const image = item.volumeInfo.image || "";
      card.createEl("img", { cls: "obs-plugin-element-poster" }).setAttribute("src", image);
      card.createEl("div", { text: item.volumeInfo.title, cls: "obs-plugin-element-title" });

      const detailsParts: string[] = [];

      const authorsText = Array.isArray(item.volumeInfo.authors) ? item.volumeInfo.authors.join(", ") : (item.volumeInfo.authors ?? "");
      if (authorsText) {
        card.createEl("div", { text: authorsText, cls: "obs-plugin-element-authors" });
      }

      const detailsText = detailsParts.join(" - ");
      if (detailsText) {
        card.createEl("div", { text: detailsText, cls: "obs-plugin-element-year" });
      }

      createStarRating(card, item.starRating, true);
      card.addEventListener("click", () => this.openElementDetails(item));
    });
  }

  private renderElementList(container: HTMLElement, items: Book[]) {
    items.forEach((item) => {

      const row = container.createDiv({ cls: "obs-plugin-element-row" });
      const poster = row.createEl("img", { cls: "obs-plugin-element-thumbnail" });
      const image = item.volumeInfo.image || "";
      poster.setAttribute("src", image || "");

      const info = row.createDiv({ cls: "obs-plugin-element-info" });
      info.createEl("h3", { text: item.volumeInfo.title, cls: "obs-plugin-element-title" });

      const authorsText = Array.isArray(item.volumeInfo.authors) ? item.volumeInfo.authors.join(", ") : (item.volumeInfo.authors ?? "");
      if (authorsText) info.createEl("p", { text: authorsText, cls: "obs-plugin-element-authors" });

      const detailsParts: string[] = [];
      const year = nullSafe(() => item.volumeInfo.publishedDate, null);
      const printType = item.volumeInfo.printType || "";
      const printTypeEdit = nullSafe(() => printType[0].toUpperCase() + printType.slice(1), null);

      if (year) detailsParts.push(year);
      if (printTypeEdit) detailsParts.push(printTypeEdit);

      const detailsText = detailsParts.join(" - ");
      if (detailsText) info.createEl("p", { text: detailsText, cls: "obs-plugin-element-year" });

      createStarRating(info, item.starRating, true);
      row.addEventListener("click", () => this.openElementDetails(item));
    });
  }

  private openElementDetails(item: Book) {
    new LibraryItemDetailModal(this.plugin.app, item, async (rating) => {
      if (!this.data) return;
      item.starRating = rating;
      await this.saveData();
      this.refreshElements();
    }, async () => {
      if (!this.data) return;
      this.data.items = this.data.items.filter((i) => i.id !== item.id);
      await this.saveData();
      this.refreshElements();
    }).open();
  }

  private refreshElements() { if (!this.itemsContainer) return; this.renderElements(this.itemsContainer); }

  private getJsonFiles(): TFile[] { return this.plugin.app.vault.getFiles().filter((file) => file.extension === "json"); }

  private async initializeData() {
    const localPath = this.plugin.localJsonPath;
    if (localPath) {
      const localFile = this.plugin.app.vault.getAbstractFileByPath(localPath);
      if (localFile instanceof TFile) { await this.loadFile(localFile); return; }
    }
    this.file = null; this.data = null;
  }

  private async loadFile(file: TFile) {
    try {
      const parsed = await loadLocalFile(this.plugin.app, file);
      this.file = file; this.data = parsed; await this.plugin.setLocalJsonPath(file.path);
    } catch (error) {
      this.data = null; this.file = null; new Notice("Unable to read the JSON file.");
    }
  }

  private async saveData() {
    if (!this.data) return;
    this.data.updatedAt = new Date().toISOString();
    if (this.file) await saveLocalData(this.plugin.app, this.file, this.data);
  }

  private async renderSearchResults(container: HTMLElement, results: any[]) {
    container.empty();

    results.forEach((result) => {

      const item = container.createDiv({
        cls: "obs-plugin-search-item"
      });

      if (result.volumeInfo.image) item.createEl("img", {
        cls: "obs-plugin-search-poster"
      }).setAttribute("src", result.volumeInfo.image);

      const info = item.createDiv({
        cls: "obs-plugin-search-info"
      });

      info.createEl("h3", {
        text: result.volumeInfo.title,
        cls: "obs-plugin-search-title"
      });

      info.createEl("p", {
        text: result.volumeInfo.publishedDate,
        cls: "obs-plugin-search-year"
      });

      if (result.volumeInfo.authors) {
        info.createEl("p", {
          text: result.volumeInfo.authors.join(", "),
          cls: "obs-plugin-search-authors"
        });
      }

      item.addEventListener("click", () => {
        new LibraryItemActionModal(this.plugin.app, result, async () => {
          if (!this.data) return;

          new Notice(`Loading details for ${result.title}...`);
          const details = await getBookDetails(result.volumeId);

          if (!details) { new Notice("Unable to load book details."); return; }

          const info = details.volumeInfo || {};

          const newItem = createEmptyElement();
          newItem.volumeInfo = info;
          newItem.volumeInfo.image = info.imageLinks?.thumbnail || "";

          this.data.items.push(newItem);

          await this.saveData();
          this.render();
        }).open();
      });
    });
  }
}
