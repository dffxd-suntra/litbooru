import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";

import "./component/booru-posts";
import "./component/booru-warning";
import "./component/booru-nav";
import "./component/booru-search";
import "./component/booru-loading";
import "./component/booru-viewer";
import "./component/booru-options";

import { chooseExtension, getExtension, getExtensionList } from "./extension";
import { PostInfo } from "./types/post";

@customElement("lit-booru")
export class LitBooru extends LitElement {
    @property({ type: Boolean })
    loaded: boolean = false;

    @property({ type: Number })
    nsfwConfirmDate: number = JSON.parse(localStorage.getItem("nsfw-confirm-date") || "0");

    @property({ type: Boolean })
    searchDisplay: boolean = false;

    @property({ type: Boolean })
    optionDisplay: boolean = false;

    @property({ type: Boolean })
    viewerDisplay: boolean = false;

    @property({ type: Object })
    browsingPost: PostInfo = null;

    @property({ type: String })
    extensionName: string = new URL(location.href).searchParams.get("ext") || "";

    @property({ type: Array })
    tags: TagInfo[] = (new URL(location.href).searchParams.get("tags") || "").split(" ").filter(tag => tag != "").map(value => <TagInfo>new Object({ label: value, value: value, category: "" }));

    chooseExtension(index: number) {
        chooseExtension(index);
        this.extensionName = getExtension().extInfo.meta.name;
    }

    onLoaded() {
        this.loaded = true;

        if (this.extensionName) {
            let index = getExtensionList().findIndex(value => value.meta.name == this.extensionName) || 0;
            this.chooseExtension(index);
        } else {
            this.chooseExtension(0);
        }
    }

    onSearchClick() {
        this.searchDisplay = true;
    }

    onOptionClick() {
        this.optionDisplay = true;
    }

    onView(post: PostInfo) {
        console.log("view", post);

        this.browsingPost = post;
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

        // 一次同意管4小时
        let warning = (Date.now() - this.nsfwConfirmDate > 4 * 60 * 60 * 1000 ? html`<booru-warning @close-warning=${this.closeWarning}></booru-warning>` : "");

        // 浏览器没有post会报错
        let viewer = (this.browsingPost == null ? "" : html`<booru-viewer ?display=${this.viewerDisplay} .post=${this.browsingPost} .tags=${this.tags} @tags-change=${(e: CustomEvent) => this.tags = e.detail} @close=${() => this.viewerDisplay = false}></booru-viewer>`);

        return html`
        ${warning}
        ${viewer}
        <booru-nav @search-click=${this.onSearchClick} @option-click=${this.onOptionClick}></booru-nav>
        <booru-options ?display=${this.optionDisplay} @close=${() => this.optionDisplay = false}></booru-options>
        <booru-search ?display=${this.searchDisplay} .tags=${this.tags} @tags-change=${(e: CustomEvent) => this.tags = e.detail} @close=${() => this.searchDisplay = false}></booru-search>
        ${keyed(this.tags, html`<booru-posts .tags=${this.tags} @post-click=${(e: CustomEvent) => this.onView(e.detail)}></booru-posts>`)}
        `;
    }

    updated() {
        window.clarity("set", "tags", this.tags);

        let url = new URL(location.href);
        url.searchParams.set("tags", this.tags.map(tag => tag.value).join(" "));
        url.searchParams.set("ext", this.extensionName);
        if (this.viewerDisplay) {
            url.searchParams.set("preview", this.browsingPost.id.toString());
        } else {
            url.searchParams.delete("preview");
        }
        history.pushState({}, "", url.href);

        document.title = `Litbooru${(this.tags.length != 0?`-${this.tags.map(tag => tag.label).join(",")}`:"")}-${this.extensionName}`;
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
