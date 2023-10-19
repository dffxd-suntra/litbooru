import { LitElement, css, html } from "lit";
import { customElement, property, queryAll } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { query } from 'lit/decorators.js';
import $ from "jquery";
import LazyLoad from "vanilla-lazyload";

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

@customElement("booru-thumbnail")
export class BooruThumbnail extends LitElement {
    static styles = css`
    img {
        margin: 0;
        padding: 0;
    }

    .pic-container {
        position: relative;
    }

    .pic {
        position: absolute;
        border: 1px solid rgba(162, 148, 123, 0.4);
    }

    .thumbnail {
        width: 100%;
    }

    .page-state {
        text-align: center;
        font-size: large;
        text-decoration: underline;
    }
    `;

    @property({ type: Number })
    pages: number = 0;

    @property({ type: Number })
    limit: number = 20;
    // rule34 limit: 1000

    @property({ type: Array, reflect: true })
    tags: string[] = [];

    @property({ type: Boolean })
    isOver: boolean = false;

    @property({ type: Array })
    pics: picInfo[] = [];

    @query(".pic-container")
    pic_container: any;

    @queryAll(".pic")
    pic_elements: any;

    @property({ type: Object })
    breakPoint: { [key: string]: any } = {
        1200: 5,
        940: 3,
        520: 2,
        400: 1
    };
    // { width: col }

    @property({ type: Number })
    pic_margin: number = 5;

    @property({ type: Boolean })
    loading: boolean = false;

    baseUrl: { [key: string]: URL } = {
        posts: new URL("https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1")
    };

    columnHeight: number[] = [];
    columns: number = 0;

    tagsString() {
        return this.tags.join(" ");
    }

    delay(ms: number) {
        return new Promise(resolve => setTimeout(() => resolve(ms), ms));
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

    async loadNextPage() {
        if (this.isOver) {
            return;
        }
        let limit = this.limit;
        let pages = this.pages;
        let postsUrl = new URL(this.baseUrl.posts);

        postsUrl.searchParams.set("limit", limit.toString());
        postsUrl.searchParams.set("pid", pages.toString());
        postsUrl.searchParams.set("tags", this.tagsString());

        console.log(postsUrl.href);
        let data = await fetch(postsUrl.href).then(res => res.json());
        console.log(data);

        if (data.length == 0) {
            this.isOver = true;
            return;
        }

        this.pages++;

        this.pics = this.pics.concat(data);
        console.log(this.pics);

        await this.updateComplete;

        this.waterfall();

        new LazyLoad({}, <any>$(this.pic_elements).find("img").get());
    }

    async autoLoadPic() {
        if (this.loading || this.isOver) {
            return;
        }
        console.log(this.columns, this.columnHeight, Math.min(...this.columnHeight), $(document).scrollTop() + $(window).height());
        if (this.columns == 0 || Math.min(...this.columnHeight) <= $(document).scrollTop() + $(window).height()) {
            this.loading = true;
            try {
                await this.loadNextPage();
            } catch(e) {
                console.error("autoLoadPic ERROR:", e);
            };
            this.loading = false;
            this.autoLoadPic();
        }
    }

    waterfall() {
        let breakPoint = [];
        for (let i in this.breakPoint) {
            breakPoint.push({
                width: +i,
                columns: this.breakPoint[i]
            });
        }
        breakPoint = breakPoint.sort((x, y) => x.width - y.width);

        let columns = breakPoint[breakPoint.length - 1].columns;
        for (let i = 0; i < breakPoint.length; i++) {
            if ($(window).width() < breakPoint[i].width) {
                columns = breakPoint[i].columns;
                break;
            }
        }

        let columnHeight = Array(columns).fill(0);
        function getMinColumnIndex() {
            let minn = Infinity, mini = 0;
            for (let i = 0; i < columnHeight.length; i++) {
                if (columnHeight[i] < minn) {
                    minn = columnHeight[i];
                    mini = i;
                }
            }
            return mini;
        }
        for (let i = 0; i < this.pic_elements.length; i++) {
            let j = getMinColumnIndex();
            columnHeight[j] += this.pic_margin;
            $(this.pic_elements[i]).css({
                top: `${columnHeight[j]}px`,
                width: `calc(${1 / columns * 100}% - ${this.pic_margin * 2}px)`,
                left: `calc(${1 / columns * j * 100}% + ${this.pic_margin}px)`
            });
            columnHeight[j] += $(this.pic_elements[i]).height();
        }
        $(this.pic_container).css("height", Math.max(...columnHeight));
        this.columns = columns;
        this.columnHeight = columnHeight;
    }

    onThumbnailClick(pic: picInfo) {
        this.dispatchEvent(new CustomEvent("thumbnail-click", { detail: pic }));
    }

    render() {
        let picsHtml = this.pics.map(pic => {
            return html`
            <div @click=${() => this.onThumbnailClick(pic)} class="pic">
                <div style=${styleMap({ height: "0", "padding-bottom": `${pic.height / pic.width * 100}%` })}>
                    <img class="thumbnail lazy" src=${pic.sample_url} />
                </div>
            </div>
            `;
        });

        let pageState = [ // 以后再也不用ts了，类型检查根史一样
            [this.isOver, html`<div>The END</div>`],
            [this.loading, html`<div>Loading...</div>`],
            [!this.loading, html`<div @click=${this.autoLoadPic}>Click to Load Next Page</div>`]
        ].find(v => v[0])[1];

        return html`
        <div class="pic-container">
            ${picsHtml}
        </div>
        <div class="page-state">
            ${pageState}
        </div>
        `;
    }

    firstUpdated() {
        // console.log("inited");
        this.autoLoadPic();

        $(window).on("resize", () => this.noiseDelay("waterfall", () => { this.waterfall(); this.autoLoadPic(); }, 500));
        $(window).on("scroll", () => this.autoLoadPic());
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "booru-thumbnail": BooruThumbnail
    }
}