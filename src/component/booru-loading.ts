import { LitElement, html, css } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { getExtensionList, load } from "../extension";

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

        if(getExtensionList().length == 0) {
            this.title.innerText = "Must have least one Extension!";
            return;
        }

        this.dispatchEvent(new Event("onloaded"));
    }

    render() {
        return html`<h1 class="title">Loading...</h1>`;
    }

    firstUpdated() {
        this.loadExtList();
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "booru-loading": BooruLoading
    }
}
