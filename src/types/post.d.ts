import "./tag";

interface PostInfo {
    id: number | string;
    preview_url: string;
    view_url: string;
    type: "image" | "video" | "audio";
    width: number;
    height:  number;
    tags: TagInfo[];
    source: string; // 指向booru网站的链接,并不是图源链接
    data?: any;
};