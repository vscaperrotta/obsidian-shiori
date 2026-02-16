import { App, SuggestModal, TFile } from "obsidian";

export class JsonFileSuggestModal extends SuggestModal<TFile> {
  private jsonFiles: TFile[];
  private onSelect: (file: TFile) => void;

  constructor(app: App, onSelect: (file: TFile) => void) {
    super(app);
    this.onSelect = onSelect;
    this.jsonFiles = this.app.vault.getFiles().filter((f) => f.extension === "json");
    this.setPlaceholder("Select a JSON file from your vault...");
  }

  getSuggestions(query: string): TFile[] {
    const lowerQuery = query.toLowerCase();
    return this.jsonFiles.filter((file) => file.path.toLowerCase().includes(lowerQuery));
  }

  renderSuggestion(file: TFile, el: HTMLElement) {
    el.createEl("div", { text: file.path });
  }

  onChooseSuggestion(file: TFile, evt: MouseEvent | KeyboardEvent) {
    this.onSelect(file);
  }
}
