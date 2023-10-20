import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";

import "./component/booru-warning";
import "./component/booru-nav";
import "./component/booru-search";
import "./component/booru-thumbnail";
import "./component/booru-viewer";

interface picInfo {
    id: number,
    tags: string,
    height: number,
    width: number,
    file_url: string,
    has_notes: boolean
    hash: string,
    image: string,
    owner: string
    parent_id: number,
    preview_url: string,
    rating: string,
    sample: boolean,
    sample_height: number,
    sample_url: string,
    sample_width: number,
    score: number,
    source: string,
    change: number,
    comment_count: number,
    directory: number,
    status: string
};

@customElement("lit-booru")
export class LitBooru extends LitElement {
    @property({ type: Number })
    nsfwConfirmDate: number = JSON.parse(localStorage.getItem("nsfw-confirm-date") || "0");

    @property({ type: Boolean })
    searchDisplay: boolean = false;

    @property({ type: Boolean })
    viewerDisplay: boolean = false;

    @property({ type: Object })
    browsingPic: picInfo = null;

    @property({ type: Array, hasChanged(newTags: any) { history.pushState(null, "", `?tags=${newTags.join(" ")}`); return true; } })
    tags: string[] = (new URL(location.href).searchParams.get("tags") || "").split(" ").filter(tag => tag != "");

    onSearchClick() {
        this.searchDisplay = !this.searchDisplay;
    }

    onView(pic: picInfo) {
        console.log(pic);
        this.browsingPic = pic;
        this.viewerDisplay = true;
    }

    closeWarning() {
        this.nsfwConfirmDate = Date.now();
        localStorage.setItem("nsfw-confirm-date", JSON.stringify(this.nsfwConfirmDate));
    }

    render() {
        // 一次管4小时
        let warning = (Date.now() - this.nsfwConfirmDate > 4 * 60 * 60 * 1000 ? html`<booru-warning @close-warning=${this.closeWarning}></booru-warning>` : "");

        let viewer = (this.browsingPic == null ? "" : html`<booru-viewer ?display=${this.viewerDisplay} .pic=${this.browsingPic} .tags=${this.tags} @tags-change=${(e: CustomEvent) => this.tags = e.detail} @close=${() => this.viewerDisplay = false}></booru-viewer>`);

        return html`
        ${warning}
        <booru-nav @search-click=${this.onSearchClick}></booru-nav>
        <booru-search ?display=${this.searchDisplay} .tags=${this.tags} @tags-change=${(e: CustomEvent) => this.tags = e.detail} @close=${() => this.searchDisplay = false}></booru-search>
        ${keyed(this.tags, html`<booru-thumbnail .tags=${this.tags} @thumbnail-click=${(e: CustomEvent) => this.onView(e.detail)}></booru-thumbnail>`)}
        ${viewer}
        `;
    }

    updated() {
        window.clarity("set", "tags", this.tags);
    }

    constructor() {
        super();

        window.addEventListener("storage", () => {
            this.nsfwConfirmDate = JSON.parse(localStorage.getItem("nsfw-confirm-date") || "0");
        });
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "lit-booru": LitBooru
    }
}
