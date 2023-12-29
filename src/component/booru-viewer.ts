import { LitElement, TemplateResult, css, html, unsafeCSS } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { styleMap } from "lit/directives/style-map.js";
import feather from "feather-icons";
import $ from "jquery";
import defaultCSS from "../index.css?inline";
import "./base-badge";
import { keyed } from "lit/directives/keyed.js";
import { PostInfo } from "../types/post";

@customElement("booru-viewer")
export class BooruViewer extends LitElement {
    static styles = [css`
    .page {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 200;
        background-color: rgba(0, 0, 0, .5);

        display: flex;
        flex-direction: column;
        overflow: auto;
        overflow-y: scroll;
    }

    #post {
        display: block;

        background-color: rgba(255, 255, 255, 0.5);
        box-shadow: 0 0 20px 0px rgba(255, 255, 255, .5);
        backdrop-filter: blur(10px);
    }

    .infos {
        width: 100%;
        background-color: rgba(0, 0, 0, .5);
        color: white;

        border-top: 3px double rgba(162, 148, 123, 0.4);
    }

    .infos td {
        word-break: break-all;
    }

    .tool-box {
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 100;

        display: flex;
        flex-direction: column;
    }

    a {
        color: inherit;
        text-decoration: none;
    }
    `, unsafeCSS(defaultCSS)];

    @property({ type: Boolean, reflect: true })
    display: boolean = false;

    @property({ type: Object, reflect: true })
    post: PostInfo;

    @query(".page")
    pageElement: Element;

    @query("#post")
    postElement: HTMLImageElement | HTMLVideoElement;

    @property({ type: Array, reflect: true })
    tags: TagInfo[] = [];

    picResize() {
        let w: number, h: number;
        if (this.post.width / this.post.height > $(this.pageElement).width() / $(this.pageElement).height()) {
            w = $(this.pageElement).width();
            h = this.post.height * (w / this.post.width);
        } else {
            h = $(this.pageElement).height();
            w = this.post.width * (h / this.post.height);
        }
        $(this.postElement).css({
            width: w,
            height: h,
            margin: `${($(this.pageElement).height() - h) / 2}px ${($(this.pageElement).width() - w) / 2}px`
        });
    }

    addTag(tag: TagInfo) {
        if (this.tags.map(tag => tag.value).includes(tag.value)) {
            return;
        }

        this.dispatchEvent(new CustomEvent("tags-change", { detail: [...this.tags, tag] }));
    }

    render() {
        let media: TemplateResult;
        switch (this.post.type) {
            case "image":
                media = html`<img src=${this.post.view_url} id="post" style=${styleMap({ "aspect-ratio": `${this.post.width}/${this.post.height}` })} />`;
                break;
            case "video":
                media = html`<video src=${this.post.view_url} id="post" style=${styleMap({ "aspect-ratio": `${this.post.width}/${this.post.height}` })} muted loop controls></video>`;
                break;
            case "audio":
                media = html`<audio src=${this.post.view_url} id="post" style=${styleMap({ "aspect-ratio": `${this.post.width}/${this.post.height}` })} muted loop controls></audio>`;
                break;
        }

        return html`
        <div class="page" style=${styleMap({ display: (this.display ? "" : "none") })}>
            <div class="tool-box">
                <div @click=${() => this.dispatchEvent(new CustomEvent("close"))}>${unsafeSVG(feather.icons["x"].toSvg({ color: "white" }))}</div>
            </div>
            ${keyed(this.post, media)}
            <div class="infos">
                <table>
                    <tbody>
                        <tr>
                            <th>Url:</th>
                            <td><a href=${this.post.view_url} target="_blank">${this.post.view_url}</a></td>
                        </tr>
                        <tr>
                            <th>Source:</th>
                            <td><a href=${this.post.source || "javascript:void"} target="_blank">${this.post.source || "none"}</a></td>
                        </tr>
                        <tr>
                            <th>Tags:</th>
                            <td>${this.post.tags.map(tag => html`<base-badge><a @click=${() => { this.addTag(tag); return false; }} href=${"?tags=" + encodeURIComponent(tag.value)}>${tag.label}</a></base-badge>`)}</td>
                        </tr>
                        <tr>
                            <th>Size:</th>
                            <td>${this.post.width} x ${this.post.height}</td>
                        </tr>
                        <tr>
                            <th>Debug:</th>
                            <td>
                                <details>
                                    <summary>DATA:</summary>
                                    ${JSON.stringify(this.post)}
                                </details>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        `;
    }

    updated() {
        $("body").css("overflow", (this.display ? "hidden" : ""));
        this.picResize();

        if (!this.display && (this.post.type == "video" || this.post.type == "audio")) {
            (<HTMLVideoElement | HTMLAudioElement>this.postElement).pause();
        }
    }

    firstUpdated() {
        $(window).on("resize", () => this.picResize());
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "booru-viewer": BooruViewer
    }
}