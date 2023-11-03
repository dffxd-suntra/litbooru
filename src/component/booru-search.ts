import { LitElement, css, html, unsafeCSS } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { styleMap } from "lit/directives/style-map.js";
import feather from "feather-icons";
import $ from "jquery";
import defaultCSS from "../index.css?inline";

import "./base-badge";

@customElement("booru-search")
export class BooruSearch extends LitElement {
    static styles = [css`
    .dialog {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 100;
        background-color: rgba(0, 0, 0, .5);

        display: flex;
        justify-content: center;

        overflow: auto;
    }

    .content {
        box-sizing: border-box;
        padding: 5px;
        width: 100%;
        max-width: 600px;
        margin: 1rem;
        background-color: rgba(0, 0, 0, .7);
        color: inherit;
        border: 3px double rgba(162, 148, 123, .7);

        display: flex;
        flex-direction: column;
    }

    .header {
        box-sizing: border-box;
        padding: 5px 3px;
        border-bottom: 1px solid rgba(162, 148, 123, .7);

        display: flex;
    }

    .title {
        font-size: x-large;
        margin-right: auto;
    }

    .advise {
        box-sizing: border-box;
        width: 100%;
        font-size: large;
        padding: 5px;
    }

    .advise:hover {
        background-color: rgba(255, 255, 255, .3);
    }

    .tags {
        margin-bottom: 1rem;
    }

    a {
        color: inherit;
    }

    input {
        border: none;
        width: 100%;
        background-color: rgba(255, 255, 255, .4);
        color: inherit;
        font-size: larger;
        box-sizing: border-box;
        padding: 5px;
        border-radius: 0;
        appearance: none;
    }
    `, unsafeCSS(defaultCSS)];

    @property({ type: Boolean, reflect: true })
    display: boolean = false;

    @property({ type: Array, reflect: true })
    tags: string[] = [];

    @property({ type: Array })
    searchAdviseList: { [key: string]: string }[] = [];

    @property({ type: Boolean })
    searching: boolean = false;

    @query("#searchInput")
    searchInputElement: HTMLInputElement;

    tagSearchController: AbortController = new AbortController();

    baseUrl: { [key: string]: URL } = {
        autoComplete: new URL("https://rule34.xxx/public/autocomplete.php")
    };

    useCorsProxy1(quest: string) {
        let url = new URL("https://api.codetabs.com/v1/proxy");
        url.searchParams.set("quest", quest);
        return url.href;
    }

    useCorsProxy2(url: string) {
        return "https://tame-local-branch.glitch.me/" + url;
    }

    useCorsProxy3(url: string) {
        return "https://cors.clicli.workers.dev/?" + url;
    }

    async onSearch(e: any) {
        this.searchAdviseList = [];
        this.searching = true;
        let text: string = e.target.value;
        text = text.trim().replace(/ /g, "_");
        let negated = text.startsWith("-");
        if (negated) {
            text = text.substring(1);
        }
        console.log(text);

        this.tagSearchController.abort();
        this.tagSearchController = new AbortController();

        let url = new URL(this.baseUrl.autoComplete);
        url.searchParams.set("q", text);

        await fetch(this.useCorsProxy2(url.href), { signal: this.tagSearchController.signal })
            .then(res => res.json())
            .then(data => { // 使用then避免取消上一次的signal后报错
                console.log(data);

                if (negated) {
                    data = data.map((v: any) => {
                        v.label = "-" + v.label;
                        v.value = "-" + v.value;
                        return v;
                    });
                }

                this.searchAdviseList = data;

                this.searching = false;
            })
            .catch(() => { });
    }

    noiseDelay = (() => {
        let functionPool = Object.create(null);

        return (target: string, func: Function, delay: number) => {
            if (target in functionPool) {
                clearTimeout(functionPool[target]);
            }
            functionPool[target] = setTimeout(() => {
                func();
                delete functionPool[target];
            }, delay);
        }
    })();

    dispatchTagsChangeEvent() {
        this.noiseDelay("tags-change", () => this.dispatchEvent(new CustomEvent("tags-change", { detail: this.tags })), 500);
    }

    addTag(tag: string) {
        if (this.tags.includes(tag)) {
            return;
        }

        this.tags = [...this.tags, tag];
        this.dispatchTagsChangeEvent();
    }

    removeTag(tag: string) {
        if (!this.tags.includes(tag)) {
            return;
        }

        this.tags = this.tags.filter(v => v != tag);
        this.dispatchTagsChangeEvent();
    }

    render() {
        let tagsElements = this.tags.map(tag => {
            return html`
            <base-badge @click=${() => this.removeTag(tag)}>${tag}</base-badge>
            `;
        });

        let adviseElements = this.searchAdviseList.map(tag => {
            return html`
            <li class="advise" @click=${() => this.addTag(tag.value)}>${tag.label}</li>
            `;
        });

        let searchStatus = (this.searching ? "Searching..." : "");

        return html`
        <div class="dialog" style=${styleMap({ display: (this.display ? "" : "none") })}>
            <div class="content">
                <div class="header">
                    <div class="title">BooruSearch!</div>
                    <a href="https://rule34.xxx/index.php?page=help&topic=post" target="_block">${unsafeSVG(feather.icons["help-circle"].toSvg())}</a>
                    <div class="close" @click=${() => this.dispatchEvent(new CustomEvent("close"))}>${unsafeSVG(feather.icons["x"].toSvg())}</div>
                </div>
                <div class="body">
                    <b>${this.tags.length} Tags:(Click to delete)</b>
                    <div class="tags">${tagsElements}</div>
                    <input type="text" placeholder="tag name" id="searchInput" @input=${this.onSearch} />
                    <q>If you do not access the API for a long time, it will be reinitialized, please wait.</q>
                    <ol>
                        ${adviseElements}
                    </ol>
                    <b>${searchStatus}</b>
                </div>
                <div class="footer">
                    <a href="https://github.com/dffxd-suntra/litbooru">${unsafeSVG(feather.icons["github"].toSvg())}Litbooru Source</a>
                </div>
            </div>
        </div>
        `;
    }

    updated() {
        $("body").css("overflow", (this.display ? "hidden" : ""));
        if (this.display) {
            this.searchInputElement.focus();
        }
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "booru-search": BooruSearch
    }
}