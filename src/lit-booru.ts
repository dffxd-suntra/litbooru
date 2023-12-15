import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";

import "./component/booru-warning";
import "./component/booru-nav";
import "./component/booru-search";
import "./component/booru-thumbnail";
import "./component/booru-viewer";
import "./component/booru-loading";

import { getExtensionList } from "./extension";

@customElement("lit-booru")
export class LitBooru extends LitElement {
    @property({ type: Boolean })
    loaded: boolean = false;

    @property({ type: Number })
    nsfwConfirmDate: number = JSON.parse(localStorage.getItem("nsfw-confirm-date") || "0");

    @property({ type: Boolean })
    searchDisplay: boolean = false;

    @property({ type: Boolean })
    viewerDisplay: boolean = false;

    @property({ type: Object })
    browsingPic: picInfo = null;

    @property({ type: String })
    extensionName: string = new URL(location.href).searchParams.get("ext") || "";

    @property({ type: Array })
    tags: string[] = (new URL(location.href).searchParams.get("tags") || "").split(" ").filter(tag => tag != "");

    onLoaded() {
        this.loaded = true;

        getExtensionList();
    }

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
        if (!this.loaded) {
            return html`<booru-loading @onloaded=${this.onLoaded}></booru-loading>`;
        }

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

        let url = new URL(location.href);
        url.searchParams.set("tags", this.tags.join(" "));
        url.searchParams.set("ext", this.extensionName);
        history.pushState({}, "", url.href);
    }

    firstUpdated() {
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
