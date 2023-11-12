import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("base-badge")
export class BaseBadge extends LitElement {
    static styles = css`
    .badge {
        background-color: rgba(255, 255, 255, .3);

        display: inline-block;
        box-sizing: border-box;
        border: 1px solid rgba(162, 148, 123, .7);
        padding: 3px;
        margin: 2px;
    }

    .badge:hover {
        background-color: rgba(255, 255, 255, .4);
    }
    `;

    render() {
        return html`
        <div class="badge">
            <slot></slot>
        </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "base-badge": BaseBadge
    }
}