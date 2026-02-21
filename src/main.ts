import { Plugin } from "obsidian";
import { VIEW_TYPE, NAME, FOLDER } from "./constants";
import pluginView from "./views/pluginView";
import LibrarySettingTab from "./settings/settingsTab";

type LibraryPluginData = {
  localJsonPath?: string;
  omdbApiKey?: string;
  viewMode?: "grid" | "list";
  libraryFolder?: string;
  open?: boolean;
};

export default class LibraryPlugin extends Plugin {
  localJsonPath: string | null = null;
  omdbApiKey: string = "";
  viewMode: "grid" | "list" = "grid";
  libraryFolder: string = FOLDER;

  async onload() {
    await this.loadPluginData();

    this.addSettingTab(new LibrarySettingTab(this.app, this));

    this.registerView(
      VIEW_TYPE,
      (leaf) => new pluginView(leaf, this)
    );

    this.addRibbonIcon("book-open-text", NAME, async () => {
      await this.openNewTab();
    });
  }

  onunload() { }

  private async loadPluginData() {
    const data = (await this.loadData()) as LibraryPluginData | null;
    this.localJsonPath = data?.localJsonPath ?? null;
    this.omdbApiKey = data?.omdbApiKey ?? "";
    this.viewMode = data?.viewMode ?? "grid";
    this.libraryFolder = data?.libraryFolder ?? FOLDER;
  }

  async setOmdbApiKey(apiKey: string) {
    this.omdbApiKey = apiKey;
    await this.savePluginData();
  }

  async setViewMode(viewMode: "grid" | "list") {
    this.viewMode = viewMode;
    await this.savePluginData();
  }

  private async savePluginData() {
    const data: LibraryPluginData = {
      omdbApiKey: this.omdbApiKey,
      viewMode: this.viewMode,
      libraryFolder: this.libraryFolder
    };
    if (this.localJsonPath) data.localJsonPath = this.localJsonPath;
    await this.saveData(data);
  }

  async setLocalJsonPath(path: string | null) {
    this.localJsonPath = path;
    await this.savePluginData();
  }

  async setLibraryFolder(folder: string) {
    this.libraryFolder = folder;
    await this.savePluginData();
  }

  private async openNewTab() {
    const existingLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    if (existingLeaves.length > 0) {
      this.app.workspace.revealLeaf(existingLeaves[0]);
      return;
    }

    const leaf = this.app.workspace.getLeaf(true);
    await leaf.setViewState({ type: VIEW_TYPE, active: true });
  }
}
