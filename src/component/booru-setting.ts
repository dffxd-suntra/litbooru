import { LitElement, css, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { styleMap } from "lit/directives/style-map.js";
import feather from "feather-icons";
import $ from "jquery";
import defaultCSS from "../index.css?inline";

import "./base-badge";

@customElement("booru-setting")
export class BooruSetting extends LitElement {
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

    render() {
        return html`
        <div class="dialog" style=${styleMap({ display: (this.display ? "" : "none") })}>
            <div class="content">
                <div class="header">
                    <div class="title">BooruSearch!</div>
                    <a href="https://rule34.xxx/index.php?page=help&topic=post" target="_block">${unsafeSVG(feather.icons["help-circle"].toSvg())}</a>
                    <div class="close" @click=${() => this.dispatchEvent(new CustomEvent("close"))}>${unsafeSVG(feather.icons["x"].toSvg())}</div>
                </div>
                <div class="body">
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
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "booru-setting": BooruSetting
    }
}