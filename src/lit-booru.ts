import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";

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
    @property({ type: Boolean })
    searchDisplay: boolean = false;

    @property({ type: Boolean })
    viewerDisplay: boolean = false;

    @property({ type: Object })
    browsingPic: picInfo = null;

    @property({ type: Array, hasChanged: (value: string[]) => { history.pushState(null, "", `?tags=${value.join(" ")}`); return true; } })
    tags: string[] = (new URL(location.href).searchParams.get("tags") || "").split(" ").filter(tag => tag != "");

    onSearchClick() {
        this.searchDisplay = !this.searchDisplay;
    }

    onView(pic: picInfo) {
        console.log(pic);
        this.browsingPic = pic;
        this.viewerDisplay = true;
    }

    render() {
        let viewer = (this.browsingPic == null ? "" : html`<booru-viewer ?display=${this.viewerDisplay} .pic=${this.browsingPic} .tags=${this.tags} @tags-change=${(e: CustomEvent) => this.tags = e.detail} @close=${() => this.viewerDisplay = false}></booru-viewer>`);

        return html`
        <booru-nav @search-click=${this.onSearchClick}></booru-nav>
        <booru-search ?display=${this.searchDisplay} .tags=${this.tags} @tags-change=${(e: CustomEvent) => this.tags = e.detail} @close=${() => this.searchDisplay = false}></booru-search>
        ${keyed(this.tags, html`<booru-thumbnail .tags=${this.tags} @thumbnail-click=${(e: CustomEvent) => this.onView(e.detail)}></booru-thumbnail>`)}
        ${viewer}
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "lit-booru": LitBooru
    }
}
