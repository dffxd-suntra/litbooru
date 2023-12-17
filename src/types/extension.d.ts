import "./post";
import "./tag";

interface Extension {
    setting: ExtensionOptions;
    checkSetting(options: ExtensionOptionsResult): boolean;
    class: any;
};

interface ExtensionClass {
    posts(tags: TagInfo[], page: number): Promise<PostInfo[] | "end">;
    autocomplete(str: string): Promise<TagInfo[]>;
    idToPost(id: number | string): Promise<PostInfo | null>;
    getTagInfo(name: string): Promise<TagInfo | null>;
    unMount(): void;
};

// 缺一不可，都要写
interface ExtensionMeta {
    icon: string;
    name: string;
    description: string; // 支持 markdown
    version: string;
    author: string;
    source: string; // 爬取的源站
};

interface ExtensionInfo {
    meta: ExtensionMeta;
    source: string;
    ext: Extension;
};

interface ExtensionOption {
    name: string;
    type: "input" | "textarea";
    label: string;
    description: string;
    default: string;
};

interface ExtensionOptions {
    []: ExtensionOption
};

interface ExtensionOptionsResult extends object { };