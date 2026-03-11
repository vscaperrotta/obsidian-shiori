import { Modal } from "obsidian";
import { nullSafe, formatPublishedDate } from "src/utils/helpers";
import { SearchItem } from "src/types/googleBooks";

export class LibraryItemActionModal extends Modal {
  private element: SearchItem;
  private onSave: (watched: boolean) => void;

  constructor(app: Modal["app"], element: SearchItem, onSave: (watched: boolean) => void) {
    super(app);
    this.element = element;
    this.onSave = onSave;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    const modalContainer = contentEl.createDiv({
      cls: "obs-plugin-shiori-modal-detail-container"
    });

    const modalHeader = modalContainer.createDiv({
      cls: "obs-plugin-shiori-modal-detail-header"
    });

    const modalTitleContainer = modalHeader.createDiv({
      cls: "obs-plugin-shiori-modal-detail-title-container"
    });

    modalTitleContainer.createEl("h1", {
      text: this.element.volumeInfo.title,
      cls: "obs-plugin-shiori-modal-detail-title"
    });

    // Year and Type
    const type = nullSafe(() => this.element.volumeInfo.printType && this.element.volumeInfo.printType[0].toUpperCase() + this.element.volumeInfo.printType.slice(1), null);
    const publishedDate = nullSafe(() => this.element.volumeInfo.publishedDate, null);
    const formatDate = publishedDate ? formatPublishedDate(publishedDate) : 'N/A';

    modalTitleContainer.createEl("p", {
      text: `${formatDate} - ${type}`,
    });

    // Authors / publisher / pages (book-specific)
    const authorsText = Array.isArray(this.element.volumeInfo.authors) ? this.element.volumeInfo.authors.join(", ") : null;
    if (authorsText) {
      modalTitleContainer.createEl("p", {
        text: "Authors: " + authorsText,
      });
    }

    // Pages
    const pages = this.element.volumeInfo.pageCount ?? null;
    if (pages) {
      modalTitleContainer.createEl("p", {
        text: "Pages: " + String(pages),
      });
    }

    // Poster
    if (this.element.volumeInfo.image) {
      modalHeader.createEl("img", { cls: "obs-plugin-shiori-modal-detail-poster" }).setAttribute("src", this.element.volumeInfo.image || "");
    }

    // Plot
    if (this.element.volumeInfo.description) {
      const plotContainer = modalContainer.createEl("div", { cls: "obs-plugin-shiori-modal-detail-plot-container" });

      const plotEl = plotContainer.createEl("p", {
        text: this.element.volumeInfo.description,
        cls: "obs-plugin-shiori-modal-detail-plot"
      });

      const showMoreButton = plotContainer.createEl("button", {
        text: "Show more",
        cls: "obs-plugin-shiori-modal-detail-show-more obs-plugin-shiori-modal-detail-show-more-hidden"
      })

      showMoreButton.addEventListener("click", () => {
        const isExpanded = plotEl.classList.toggle("expanded-plot");
        showMoreButton.setText(isExpanded ? "Show less" : "Show more");
      });

      requestAnimationFrame(() => {
        if (plotEl.scrollHeight > plotEl.clientHeight + 1) {
          showMoreButton.removeClass("obs-plugin-shiori-modal-detail-show-more-hidden");
        }
      });
    }

    // Generate details section only if at least one detail is available
    function rederDetailSection(type: string, value: string) {
      const detailElement = modalContainer.createEl("div", { cls: "obs-plugin-shiori-modal-detail-detail-container" });
      detailElement.createEl("p", {
        text: `${type}:`,
        cls: "obs-plugin-shiori-modal-detail-label"
      });
      detailElement.createEl("p", {
        text: value,
        cls: "obs-plugin-shiori-modal-detail-detail-value"
      });
    }

    modalContainer.createEl("hr");

    // Categories
    if (this.element.volumeInfo.categories) {
      rederDetailSection("Categories", (this.element.volumeInfo.categories || []).join(", "));
    }

    // Publisher / info link
    if (this.element.volumeInfo.publisher) {
      rederDetailSection("Publisher", this.element.volumeInfo.publisher);
    }

    const actions = modalContainer.createDiv({ cls: "obs-plugin-shiori-modal-detail-actions" });

    const watchedButton = actions.createEl("button", { text: "Add" });

    watchedButton.addEventListener("click", () => {
      this.onSave(true);
      this.close();
    });
  }
}
