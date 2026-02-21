import { Modal } from "obsidian";
import { Book } from "../../types/BookType";
import { createStarRating } from "../ratingWidget";
import { nullSafe, formatPublishedDate } from "src/utils/helpers";

export class LibraryItemDetailModal extends Modal {
  private element: Book;
  private onRate: (rating: number) => void;
  private onRemove: () => void;
  private onSave?: (item: Book) => void;

  constructor(
    app: Modal["app"],
    element: Book,
    onRate: (rating: number) => void,
    onRemove: () => void,
    onSave?: (item: Book) => void,
  ) {
    super(app);
    this.element = element;
    this.onRate = onRate;
    this.onRemove = onRemove;
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
    const authorsText = Array.isArray(this.element.volumeInfo.authors) ? this.element.volumeInfo.authors.join(", ") : nullSafe(() => (this.element.volumeInfo as any).authors as string | null, null);
    if (authorsText) {
      modalTitleContainer.createEl("p", {
        text: "Authors: " + authorsText,
      });
    }

    const pages = (this.element.volumeInfo as any).pageCount ?? null;
    if (pages) {
      modalTitleContainer.createEl("p", {
        text: "Pages: " + String(pages),
      });
    }

    // Poster
    if (this.element.volumeInfo.image) {
      modalHeader.createEl("img", { cls: "obs-plugin-shiori-modal-detail-poster" }).setAttribute("src", this.element.volumeInfo.image);
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

      // Wait for layout so we can measure overflow
      requestAnimationFrame(() => {
        // If content height exceeds container height, it's truncated
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
    if ((this.element.volumeInfo as any).categories) {
      rederDetailSection("Categories", ((this.element.volumeInfo as any).categories || []).join(", "));
    }

    // Publisher / info link
    if ((this.element.volumeInfo as any).publisher) {
      rederDetailSection("Publisher", (this.element.volumeInfo as any).publisher);
    }

    modalContainer.createEl("hr");

    const ratingWrapper = modalContainer.createDiv({ cls: "obs-plugin-shiori-modal-detail-rating-wrapper" });

    // Personal Rating
    const ratingContainer = ratingWrapper.createDiv({
      cls: "obs-plugin-shiori-modal-detail-rating-container"
    });

    ratingContainer.createEl("div", { text: "Rating", cls: "obs-plugin-shiori-modal-detail-rating-label" });
    createStarRating(ratingContainer, this.element.starRating, false, (rating) => {
      this.onRate(rating);
    });

    // Read Date
    const readDateContainer = ratingWrapper.createDiv({
      cls: "obs-plugin-shiori-modal-detail-rating-container"
    });
    readDateContainer.createEl("div", { text: "Read Date", cls: "obs-plugin-shiori-modal-detail-rating-label" });
    const dateField = readDateContainer.createDiv({
      cls: "obs-plugin-shiori-field"
    });
    const dateInput = dateField.createEl(
      "input",
      {
        type: "date",
        cls: "obs-plugin-shiori-date-input"
      }
    ) as HTMLInputElement;

    dateInput.value = this.element.readDate ?? "";

    // Note section
    const noteContainer = modalContainer.createDiv({
      cls: "obs-plugin-shiori-modal-detail-note-container"
    });
    noteContainer.createEl("div", {
      text: "Note",
      cls: "obs-plugin-shiori-modal-detail-rating-label"
    });
    const textAreaField = noteContainer.createDiv({
      cls: "obs-plugin-shiori-field"
    });
    const noteTextarea = textAreaField.createEl(
      "textarea",
      {
        cls: "obs-plugin-shiori-textarea",
        placeholder: "Add your personal notes about this book..."
      }
    ) as HTMLTextAreaElement;

    noteTextarea.value = this.element.note ?? "";

    const actions = modalContainer.createDiv({ cls: "obs-plugin-shiori-modal-detail-actions" });
    const removeButton = actions.createEl("button", { text: "Remove", cls: "obs-plugin-shiori-danger" });
    const saveButton = actions.createEl("button", { text: "Save", cls: "mod-cta" });

    saveButton.addEventListener("click", async () => {
      this.element.note = noteTextarea.value;
      this.element.readDate = dateInput.value || undefined;
      if (this.onSave) await this.onSave(this.element);
      this.close();
    });

    removeButton.addEventListener("click", () => {
      this.onRemove();
      this.close();
    });
  }
}