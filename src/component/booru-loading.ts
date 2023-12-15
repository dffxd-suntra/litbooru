import { LitElement, html, css } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import fitty from "fitty";
import { load } from "../extension";

@customElement("booru-loading")
export class BooruLoading extends LitElement {
    static styles = css`
    :host {
        display: flex;
        justify-content: center;
        align-items: center;

        width: 100%;
        height: 100vh;
    }
    `;

    @property({ type: Boolean, reflect: true })
    loaded: boolean = false

    @query(".title")
    title: any;

    async loadExtList() {
        await load().catch((error: Error) => this.title.innerText = `加载错误,请刷新页面(${error.message})`);
        this.loaded = true;

        // this.dispatchEvent(new Event("onloaded"));
    }

    render() {
        return html`<span class="title">Loading...</span>`;
    }

    firstUpdated() {
        fitty(this.title);

        this.loadExtList();
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "booru-loading": BooruLoading
    }
}
