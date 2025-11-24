import { LocalizedError } from "./errors";
import { localize } from "./utils";

const ELEMENT_STYLE = `
.container {
  width: 100%;
  display: flex;
  gap: 5px;

  input[type="text"] {
    flex: 1;
  }
}
`;

const SELECT_ICON = "fa-crosshairs";
const SELECTING_ICON = "fa-spinner";


interface DocumentPickerInputConfig extends foundry.applications.fields.FormInputConfig<string> {
  type: string;
}

/**
 * Quick wrapper to create an {@link HTMLButtonElement} with an icon in it
 * @param {string[]} classes - List of classes to apply to the icon
 * @returns 
 */
function createIconButton(...classes: string[]): HTMLButtonElement {
  const button = document.createElement("button");
  button.setAttribute("type", "button");

  const icon = document.createElement("i");
  icon.classList.add(...classes);
  button.appendChild(icon);

  return button;
}

/**
 * Wrapper to create an {@link HTMLLinkElement} to link to an external stylesheet
 * @param {string} url - Path to the stylesheet
 * @returns 
 */
function createStyleLink(url: string): HTMLLinkElement {
  const style = document.createElement("link");
  style.setAttribute("rel", "stylesheet");
  style.setAttribute("href", url);
  return style;
}

export class HTMLDocumentPickerElement<t extends foundry.abstract.Document.Any = foundry.abstract.Document.Any> extends foundry.applications.elements.AbstractFormInputElement<string> {
  static tagName = "document-picker";
  static observedAttributes = ["disabled", "type", "value"];

  private isListening = false;

  #input: HTMLInputElement | undefined = undefined;
  #selectButton: HTMLButtonElement | undefined = undefined;
  #viewButton: HTMLButtonElement | undefined = undefined;
  #clearButton: HTMLButtonElement | undefined = undefined;
  #compendiumOpenHook: number | undefined = undefined;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  #clickEventListeners: { elem: HTMLElement, listener: Function }[] = [];
  #controlHooks: { event: Hooks.HookName, hook: number }[] = [];

  public get type() { return this.getAttribute("type"); }
  public set type(val) {
    if (val) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const isValid = Object.values(foundry.documents).some((docType: any) => (docType.documentName?.toLowerCase() ?? "") === val?.toLowerCase());
      if (!isValid) throw new LocalizedError("BATTLETRANSITIONS.ERRORS.INVALIDDOCUMENTTYPE", { type: val });
    }
    this.setAttribute("type", val ?? "");
  }

  public get document(): t | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    if (this.value) return (fromUuidSync(this.value) as any) ?? undefined;
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    // super.attributeChangedCallback(name, oldValue, newValue);
    switch (name) {
      case "value":
        this.setEnabledButtons();
        this.setTooltips();
        if (this.#input) this.#input.value = newValue;
        break;
      case "type":
        this.setEnabledButtons();
        this.setTooltips();
        break;
    }
  }

  /** @inheritdoc */
  protected _activateListeners(): void {
    super._activateListeners();

    this.addEventListener("focus", () => { if (this.#input) this.#input.focus(); })

    if (this.#input) {
      // Stop propagation so that the global Keyboard manager doesn't grab it
      this.#input.addEventListener("keydown", e => { e.stopPropagation(); })
      this.#input.addEventListener("input", () => { this.value = this.#input?.value ?? ""; });
      // this.#input.addEventListener("change", () => { console.log("Changed:", this.#input?.value); });
    }
    if (this.#selectButton) this.#selectButton.addEventListener("click", this.selectButtonClicked.bind(this));
    if (this.#clearButton) this.#clearButton.addEventListener("click", this.clearButtonClicked.bind(this));
    if (this.#viewButton) this.#viewButton.addEventListener("click", this.viewButtonClicked.bind(this));
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.#input) this.#input.value = this.getAttribute("value") ?? "";
  }

  protected viewButtonClicked() {
    try {
      if (!this.#input?.value) return;
      fromUuid(this.#input.value)
        .then(obj => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          if (obj instanceof foundry.abstract.Document) (obj as any)?.sheet.render(true);
        })
        .catch((err: Error) => {
          console.error(err);
          ui.notifications?.error(err.message, { console: false });
        })
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
    }
  }

  protected _getValue(): string {
    return this.#input?.value ?? "";
  }

  protected selectButtonClicked() {
    if (this.isListening) {
      // cancel
      this.cancelSelection();
    } else {
      this.isListening = true;
      this.setEnabledButtons();

      if (this.type) {
        // Handle placeable clicking
        let hookName: Hooks.HookName | "" = "";
        switch (this.type.toLowerCase()) {
          case "token":
            hookName = "controlToken";
            break;
          case "ambientlight":
            hookName = "controlAmbientLight";
            break;
          case "ambientsound":
            hookName = "controlAmbientSound";
            break;
          case "drawing":
            hookName = "controlDrawing";
            break;
          // case "journal":
          // case "note":
          // case "playlist":
          // case "playlistsound":
          case "region":
            hookName = "controlRegion";
            break;
          case "tile":
            hookName = "controlTile";
            break;
          case "wall":
            hookName = "controlWall";
            break;
        }

        if (hookName) {

          this.clearControlHooks();
          this.#controlHooks.push({
            event: hookName,
            hook: Hooks.on(hookName, this.objectControlled.bind(this))
          });
        }
      }

      this.#compendiumOpenHook = Hooks.on("renderCompendium", this.compendiumOpened.bind(this));
      const entries = document.querySelectorAll(`.directory-item.entry.document.${this.type}`);
      for (const entry of entries) {
        const listener = this.itemEntryClicked.bind(this);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        entry.addEventListener("click", listener as any);
        this.#clickEventListeners.push({ elem: entry as HTMLElement, listener })
      }
    }
  }

  protected objectControlled(obj: PlaceableObject, controlled: boolean) {
    if (controlled && obj.document.documentName.toLowerCase() === this.type?.toLowerCase()) {
      // console.log("Selected:", obj);
      if (this.#input) this.#input.value = obj.document.uuid;
      this.cancelSelection();
      this.setEnabledButtons();
    }
  }

  protected clearControlHooks() {
    for (const elem of this.#controlHooks) {
      Hooks.off(elem.event, elem.hook);
    }
    this.#controlHooks.splice(0, this.#controlHooks.length);
  }

  protected cancelSelection() {
    this.isListening = false;
    this.setEnabledButtons();
    this.clearControlHooks();
    this.clearControlHooks();
    if (this.#compendiumOpenHook) Hooks.off("renderCompendium", this.#compendiumOpenHook);
    for (const { listener, elem } of this.#clickEventListeners) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      elem.removeEventListener("click", listener as any);
    }
    this.#clickEventListeners.splice(0, this.#clickEventListeners.length);
  }

  protected itemEntryClicked(e: PointerEvent) {
    try {
      if (!this.type || !this.isListening) return;

      if (e.target instanceof HTMLElement) {
        const li = e.target.closest("li");
        if (!(li instanceof HTMLLIElement)) return;

        const id = li.dataset.entryId;
        if (!id) return;

        e.stopPropagation();
        e.preventDefault();

        if (e.target.dataset.compendiumId) {
          if (!game.packs) return;
          const compendium = game.packs.get(e.target.dataset.compendiumId);
          if (!compendium) return;
          const doc = compendium.get(id);
          if (doc) {
            if (this.#input) this.#input.value = doc.uuid;
          } else {
            compendium.getDocument(id)
              .then(doc => {
                if (doc && this.#input) this.#input.value = doc.uuid;
              }).catch((err: Error) => {
                console.error(err);
                ui.notifications?.error(err.message, { console: false });
              });
          }
        } else {
          const collection = game.collections?.contents.find(collection => collection.documentName.toLowerCase() === this.type?.toLowerCase());
          if (collection) {
            const document = collection.get(id);
            if (document && this.#input) this.#input.value = document.uuid;
            else if (this.#input) this.#input.value = id;
          } else {
            if (this.#input) this.#input.value = id;
          }
        }

      }

    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
    } finally {
      this.clearControlHooks();
      this.cancelSelection();
      this.setEnabledButtons();
    }
  }

  protected compendiumOpened(app: Compendium.Any, html: HTMLElement) {
    const entries = html.querySelectorAll(`.directory-item.entry.${this.type}`);
    for (const entry of entries) {
      const listener = this.itemEntryClicked.bind(this);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      entry.addEventListener("click", listener as any);
      this.#clickEventListeners.push({ elem: entry as HTMLElement, listener });
    }
  }

  protected _refresh(): void {
    super._refresh();
    this.setTooltips();
    this.setEnabledButtons();
  }

  protected clearButtonClicked() {
    this.value = "";
    if (this.#input) this.#input.value = "";
    this.setEnabledButtons();
    this.setTooltips();
  }

  /** @inheritdoc */
  protected _toggleDisabled(disabled: boolean): void {
    super._toggleDisabled(disabled);

    if (this.#input) this.#input.disabled = disabled;
    if (this.#selectButton) this.#selectButton.disabled = disabled;
    if (this.#clearButton) this.#clearButton.disabled = disabled;
  }


  protected createElements() {
    // Font Awesome style sheet
    this.shadowRoot?.appendChild(createStyleLink("fonts/fontawesome/css/all.min.css"));

    // Foundry style sheet
    this.shadowRoot?.appendChild(createStyleLink("css/foundry2.css"));

    // Standard style sheet
    const style = document.createElement("style");
    style.innerText = ELEMENT_STYLE;
    this.shadowRoot?.appendChild(style);


    const wrapper = document.createElement("div");
    wrapper.classList.add("container");


    this.#input = document.createElement("input");
    this.#input.setAttribute("type", "text");
    this.#input.setAttribute("tabindex", "0");

    this.#selectButton = createIconButton("fa-solid", "fa-crosshairs", "fa-fw", "fa-sm");
    this.#clearButton = createIconButton("fa-solid", "fa-trash", "fa-fw", "fa-sm");

    this.#viewButton = createIconButton("fa-solid", "fa-eye", "fa-fw", "fa-sm");

    wrapper.appendChild(this.#input);
    wrapper.appendChild(this.#viewButton);
    wrapper.appendChild(this.#selectButton);
    wrapper.appendChild(this.#clearButton);


    this.shadowRoot?.appendChild(wrapper);
    this.setEnabledButtons();
    this.setTooltips();
  }

  public get documentType(): foundry.abstract.Document.Any | undefined {
    // Some special cases, since the actual document selector will look for a different type than we expect
    // the user to provide
    switch (this.type?.toLowerCase()) {
      case "token":
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
        return (foundry.canvas as any).placeables.Token;
      case "tile":
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
        return (foundry.canvas as any).placeables.Tile;
      case "drawing":
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
        return (foundry.canvas as any).placeables.Drawing;
      case "region":
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
        return (foundry.canvas as any).placeables.Region;
      case "wall":
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
        return (foundry.canvas as any).placeables.Wall;
      default:
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return this.type ? Object.values(foundry.documents).find(doc => ((doc as any).name ?? "").toLowerCase() === (this.type ?? "").toLowerCase()) as any : undefined;
    }

  }

  protected setTooltips() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const translatedDocType = this.documentType ? localize(`DOCUMENT.${(this.documentType as any).name}`) : typeof undefined;
    if (this.#input) this.#input.placeholder = localize("BATTLETRANSITIONS.DOCUMENTPICKER.PLACEHOLDER", { type: translatedDocType });
    if (this.#selectButton) this.#selectButton.dataset.tooltip = localize("BATTLETRANSITIONS.DOCUMENTPICKER.TOOLTIP", { type: translatedDocType });
    if (this.#clearButton) this.#clearButton.dataset.tooltip = localize("BATTLETRANSITIONS.DOCUMENTPICKER.CLEARTOOLTIP", { type: translatedDocType });
  }

  protected setEnabledButtons() {
    // if (this.#clearButton) this.#clearButton.disabled = !this.value;

    if (this.#selectButton) {
      const icon = this.#selectButton.querySelector(`i`);
      if (icon instanceof HTMLElement) {
        if (this.isListening) {
          icon.classList.remove(SELECT_ICON);
          icon.classList.add(SELECTING_ICON, "fa-spin")
        } else {
          icon.classList.remove(SELECTING_ICON, "fa-spin");
          icon.classList.add(SELECT_ICON);
        }
      }
    }
  }


  /**
   * Create an {@link HTMLDocumentPickerElement}
   * @param {DocumentPickerInputConfig} config 
   */
  static create(config: DocumentPickerInputConfig) {
    const picker = document.createElement(HTMLDocumentPickerElement.tagName) as HTMLDocumentPickerElement;
    picker.name = config.name ?? "";
    picker.setAttribute("value", config.value || "");
    picker.type = config.type;
    foundry.applications.fields.setInputAttributes(picker, config);
    return picker;
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.createElements();
    this.setTooltips();
    this.setEnabledButtons();
  }
}



customElements.define(HTMLDocumentPickerElement.tagName, HTMLDocumentPickerElement);

Hooks.on("renderCompendium", (app: foundry.applications.api.ApplicationV2, html: HTMLElement | JQuery<HTMLElement>) => {

  const entries = Array.from((html instanceof HTMLElement ? html : html[0]).querySelectorAll(`[data-action="activateEntry"]`));
  for (const entry of entries) {
    if (entry instanceof HTMLElement) {

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const collectionId = (app as any).collection.metadata.id as string;
      entry.dataset.compendiumId = collectionId;
    }
  }
});