import { LitElement, css, html } from "lit";
import { customElement, property, queryAll } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { query } from 'lit/decorators.js';
import $ from "jquery";
import LazyLoad from "vanilla-lazyload";
import { PostInfo } from "../types/post";
import { getExtension } from "../extension";

@customElement("booru-posts")
export class BooruPosts extends LitElement {
    static styles = css`
    img {
        margin: 0;
        padding: 0;
    }

    .post-container {
        position: relative;
    }

    .pic {
        position: absolute;
        border: 1px solid rgba(162, 148, 123, 0.4);

        border-radius: .25rem;
        overflow: hidden;
    }

    .post {
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

    @property({ type: Array, reflect: true })
    tags: TagInfo[] = [];

    @property({ type: Boolean })
    isOver: boolean = false;

    @property({ type: Array })
    posts: PostInfo[] = [];

    @query(".post-container")
    post_container: any;

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

        let data = await getExtension().extClass.posts(this.tags, this.pages);
        if (data == "end") {
            this.isOver = true;
            return;
        }
        console.log(data);

        this.pages++;

        this.posts = [...this.posts, ...data];
        console.log(this.posts);

        await this.updateComplete;

        this.waterfall();

        new LazyLoad({}, <any>$(this.pic_elements).find("img").get());
    }

    async autoLoadPost() {
        if (this.loading || this.isOver) {
            return;
        }
        if (this.columns == 0 || Math.min(...this.columnHeight) <= $(document).scrollTop() + $(window).height()) {
            this.loading = true;
            await this.loadNextPage();
            this.loading = false;
            this.autoLoadPost();
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
        $(this.post_container).css("height", Math.max(...columnHeight));
        this.columns = columns;
        this.columnHeight = columnHeight;
    }

    onPostClick(post: PostInfo) {
        this.dispatchEvent(new CustomEvent("post-click", { detail: post }));
    }

    handleWindowResize = () => {
        this.noiseDelay("waterfall", () => {
            this.waterfall();
            this.autoLoadPost();
        }, 500);
    }

    handleWindowScroll = () => {
        this.autoLoadPost();
    }

    render() {
        let picsHtml = this.posts.map(post => {
            return html`
            <div @click=${() => this.onPostClick(post)} class="pic">
                <div style=${styleMap({ height: "0", "padding-bottom": `${post.height / post.width * 100}%` })}>
                    <img class="post lazy" src=${post.preview_url} />
                </div>
            </div>
            `;
        });

        let pageState = [ // 以后再也不用ts了，类型检查根史一样
            [this.isOver, html`<div>The END</div>`],
            [this.loading, html`<div>Loading...</div>`],
            [!this.loading, html`<div @click=${this.autoLoadPost}>Click to Load Next Page</div>`]
        ].find(v => v[0])[1];

        return html`
        <div class="post-container">
            ${picsHtml}
        </div>
        <div class="page-state">
            ${pageState}
        </div>
        `;
    }

    connectedCallback() {
        super.connectedCallback();

        $(window).on("resize", this.handleWindowResize);
        $(window).on("scroll", this.handleWindowScroll);
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        $(window).off("resize", this.handleWindowResize);
        $(window).off("scroll", this.handleWindowScroll);
    }

    firstUpdated() {
        // console.log("inited");
        this.autoLoadPost();
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "booru-posts": BooruPosts
    }
}