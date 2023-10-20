import { LitElement, css, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import defaultCSS from "../index.css?inline";

@customElement("booru-warning")
export class BooruWarning extends LitElement {
    static styles = [css`
    @keyframes moving-strips {
        0% {
            transform: translateX(-283px);
        }

        100% {
            transform: translateX(283px);
        }
    }

    #warning {
        user-select: none;
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1000;
        backdrop-filter: blur(20px);
        justify-content: center;
        align-items: center;
    }

    #warning-backdrop {
        position: fixed;
        z-index: -1;
        left: -300px;
        width: calc(100vw + 600px);
        height: 100%;
        background: repeating-linear-gradient( 45deg, rgba(58, 58, 0, 0.85), rgba(58, 58, 0, 0.85) 200px, rgba(0, 0, 0, 0.85) 200px, rgba(0, 0, 0, 0.85) 400px );
        animation: moving-strips 4s linear infinite;
    }

    #warning-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    #warning-container > .title {
        color: yellow;
        font-size: 50px;
    }

    #warning-container > .disable {
        color: gainsboro;
    }
    `, unsafeCSS(defaultCSS)];

    closeWarning() {
        this.dispatchEvent(new CustomEvent("close-warning"));
    }

    render() {
        return html`
        <div id="warning" @click=${this.closeWarning}>
            <div id="warning-backdrop"></div>
            <div id="warning-container">
                <div class="title">NSFW Warning</div>
                <div class="disable">Tap screen to close(If you are 18)</div>
            </div>
        </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "booru-warning": BooruWarning
    }
}