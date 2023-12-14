// ==litbooruExt==
// @icon https://gelbooru.com/favicon.png
// @name Gelbooru
// @description gelbooru litbooru扩展插件
// @version 0.0.1
// @author dffxd-suntra 
// @website https://gelbooru.com/
// ==/litbooruExt==

class Gelbooru {
    extmap = {
        "image": ["bmp", "jpg", "jpeg", "png", "gif", "webp"],
        "video": ["mp4", "mov", "mkv", "avi", "wmv", "m4v", "xvid", "asf", "dv", "mpeg", "vob", "webm", "ogv", "divx", "3gp", "mxf", "ts", "trp", "mpg", "flv", "f4v"],
        "audio": ["mp3", "wav", "m4a", "wma", "aac", "flac", "ac3", "aiff", "m4b", "m4r", "au", "ape", "mka", "ogg"]
    }
    getMediaTypeFromFilename(filename) {
        let ext = filename.split(".").pop();
        for (let i in this.extmap) {
            if (this.extmap[i].includes(ext)) {
                return i;
            }
        }
        return "image";
    }
    async posts(tags, page) {
        let tagStr = tags.join(" ");

        let url = new URL("https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1");
        url.searchParams.set("tags", tags);
        url.searchParams.set("limit", limit);
        url.searchParams.set("pid", page);

        let res = await fetch(this.untils.useCors(url.href)).then(res => res.text());

        // 判断是否结束
        let data;
        try {
            data = JSON.parse(res);
        } catch (error) {
            return "end";
        };
        if (data.post == undefined || data.post.length == 0) {
            return "end";
        }

        return data.post.map(post => {
            return {
                id: post.id,
                preview_url: post.preview_url,
                view_url: post.file_url,
                type: this.getMediaTypeFromFilename(post.image),
                width: post.width,
                height: post.height,
                tags: tags.split(" "),
                source: `https://gelbooru.com/index.php?page=post&s=view&id=${post.id}` // 指向booru网站的链接,并不是图源链接
            };
        });
    }
    async autocomplete(str) {
        let url = new URL("https://gelbooru.com/index.php?page=autocomplete2&type=tag_query&limit=10");
        url.search.set("term", str);

        let data = await fetch(this.untils.useCors(url.href)).then(res => res.json());

        return data.map(tag => {
            return {
                name: tag.name,
                label: tag.label,
                category: tag.category
            }
        });
    }
    async idToPost(id) {
    }
    async getTagCategory(tag) {
    }
    constructor(utils, setting) {
        this.untils = utils;
        this.limit = setting.limit;
    }
};

function checkSetting(setting) { // 保存时调用,有错误时请抛出Error,Error内容为提示信息,否则默认算过
    if(parseInt(setting.limit) == NaN) {
        throw new Error(`limit必须为数字`);
    }
    if(parseInt(setting.limit) < 1) {
        throw new Error(`limit必须为正数`);
    }
    if(parseInt(setting.limit) > 100) {
        throw new Error(`api限制,limit大不了100`);
    }
}

export default {
    setting: [
        {
            id: "limit",
            type: "input",
            label: "limit",
            description: "每页`limit`个图片", // 支持 markdown
            default: "50"
        }
    ],
    checkSetting, // checkSetting: checkSetting
    class: Gelbooru
};
