import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

import { load } from "../extension";

@customElement("booru-loading")
export class BooruLoading extends LitElement {
    static styles = css`
    `;
    
    @property({ type: Boolean, reflect: true })
    loaded: boolean = false

    async loadExtList() {
        await load();
        this.loaded = true;

        this.dispatchEvent(new Event("onloaded"));
    }

    render() {
        return (this.loaded ? html`` : html``);
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
