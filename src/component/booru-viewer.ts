import { LitElement, css, html, unsafeCSS } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { styleMap } from "lit/directives/style-map.js";
import feather from "feather-icons";
import $ from "jquery";
import defaultCSS from "../index.css?inline";

import "./base-badge";
import { keyed } from "lit/directives/keyed.js";

interface picInfo {
    id: number,
    tags: string,
    height: number,
    width: number,
    file_url: string,
    has_notes: boolean
    hash: string,
    image: string,
    owner: string
    parent_id: number,
    preview_url: string,
    rating: string,
    sample: boolean,
    sample_height: number,
    sample_url: string,
    sample_width: number,
    score: number,
    source: string,
    change: number,
    comment_count: number,
    directory: number,
    status: string
};

@customElement("booru-viewer")
export class BooruViewer extends LitElement {
    static styles = [css`
    .page {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 100;
        background-color: rgba(0, 0, 0, .5);

        display: flex;
        flex-direction: column;
        overflow: auto;
        overflow-y: scroll;
    }

    #pic {
        display: block;
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

        display: flex;
        flex-direction: column;
    }
    `, unsafeCSS(defaultCSS)];

    @property({ type: Boolean, reflect: true })
    display: boolean = false;

    @property({ type: Object, reflect: true })
    pic: picInfo;

    @query(".page")
    pageElement: Element;

    @query("#pic")
    picElement: HTMLImageElement | HTMLVideoElement;

    @property({ type: Array, reflect: true })
    tags: string[] = [];

    picResize() {
        let w, h;
        if (this.pic.width / this.pic.height > $(this.pageElement).width() / $(this.pageElement).height()) {
            w = $(this.pageElement).width();
            h = this.pic.height * (w / this.pic.width);
        } else {
            h = $(this.pageElement).height();
            w = this.pic.width * (h / this.pic.height);
        }
        $(this.picElement).css({
            width: w,
            height: h,
            margin: `${($(this.pageElement).height() - h) / 2}px ${($(this.pageElement).width() - w) / 2}px`
        });
    }

    addTag(tag: string) {
        if (this.tags.includes(tag)) {
            return;
        }

        this.dispatchEvent(new CustomEvent("tags-change", { detail: [...this.tags, tag] }));
    }

    // 根据扩展名判断文件类型
    extType(filename) {
        let exts = {
            "image": ["bmp", "jpg", "jpeg", "png", "gif", "webp"],
            "video": ["mp4", "mov", "mkv", "avi", "wmv", "m4v", "xvid", "asf", "dv", "mpeg", "vob", "webm", "ogv", "divx", "3gp", "mxf", "ts", "trp", "mpg", "flv", "f4v", "swf"],
            "audio": ["mp3", "wav", "m4a", "wma", "aac", "flac", "ac3", "aiff", "m4b", "m4r", "au", "ape", "mka", "ogg", "mid"]
        };
        let ext = filename.split(".").pop();
        for (let i in exts) {
            if (exts[i].includes(ext)) {
                return i;
            }
        }
        return false;
    }

    render() {
        let media = (this.extType(this.pic.image) == "video" ? html`<video src=${this.pic.file_url} id="pic" style=${styleMap({ "aspect-ratio": `${this.pic.width}/${this.pic.height}` })} muted loop controls></video>` : html`<img src=${this.pic.file_url} id="pic" style=${styleMap({ "aspect-ratio": `${this.pic.width}/${this.pic.height}` })} />`);

        return html`
        <div class="page" style=${styleMap({ display: (this.display ? "" : "none") })}>
            <div class="tool-box">
                <div @click=${() => this.dispatchEvent(new CustomEvent("close"))}>${unsafeSVG(feather.icons["x"].toSvg({ color: "white" }))}</div>
            </div>
            ${keyed(this.pic, media)}
            <div class="infos">
                <table>
                    <tbody>
                        <tr>
                            <th>Url:</th>
                            <td><a href=${this.pic.file_url} target="_block">${this.pic.file_url}</a></td>
                        </tr>
                        <tr>
                            <th>Source:</th>
                            <td>${this.pic.source || "none"}</td>
                        </tr>
                        <tr>
                            <th>Tags:</th>
                            <td>${this.pic.tags.split(" ").map(tag => html`<base-badge @click=${() => this.addTag(tag)}>${tag}</base-badge>`)}</td>
                        </tr>
                        <tr>
                            <th>Size:</th>
                            <td>${this.pic.width} x ${this.pic.height}</td>
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

        if (!this.display && this.extType(this.pic.image) == "video") {
            (<HTMLVideoElement>this.picElement).pause();
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