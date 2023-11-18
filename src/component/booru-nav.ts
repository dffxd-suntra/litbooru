import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("booru-nav")
export class BooruNav extends LitElement {
    static styles = css`
    .nav {
        width: 100%;
        display: flex;
        font-size: small;
        position: sticky;
        z-index: 100;
        top: 0;
        background-color: rgba(25, 23, 20, .6);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(162, 148, 123, 0.4);
        box-sizing: border-box;
        padding: 3px 5px;
        transition: 0.25s;
    }

    .nav:hover {
        font-size: xx-large;
        background-color: rgba(25, 23, 20, .7);
    }

    .title {
        margin-right: auto;
        color: inherit;
        text-decoration: none !important;
    }
    `;

    onSearch() {
        this.dispatchEvent(new Event("search-click"));
    }

    render() {
        return html`
        <div class="nav">
            <a class="title" href="." title="back to homepage">Lit Booru</a>
            <span @click=${this.onSearch}>Search</span>
            <span style="margin-left: 0.5em;" @click=${() => alert("wait a minite")}>Options</span>
        </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "booru-nav": BooruNav
    }
}