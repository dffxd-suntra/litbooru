import { ExtensionInfo, ExtensionMeta } from "../types/extension";

export default class ExtensionUntils {
    extInfo: ExtensionInfo;
    async getValue(key: string): Promise<any> { console.warn("ExtensionUntils 的 键值对存储正在开发。"); }
    async setValue(key: string, value: any): Promise<void> { console.warn("ExtensionUntils 的 键值对存储正在开发。"); }
    async getValueList(): Promise<any> { console.warn("ExtensionUntils 的 键值对存储正在开发。"); }
    async deleteValue(key: string): Promise<void> { console.warn("ExtensionUntils 的 键值对存储正在开发。"); }
    getExtProp(): ExtensionMeta {
        return this.extInfo.meta;
    }
    useCors(url: string) {
        return "https://tame-local-branch.glitch.me/" + url;
    }
    useCors2(quest: string) {
        let url = new URL("https://api.codetabs.com/v1/proxy");
        url.searchParams.set("quest", quest);
        return url.href;
    }
    constructor(extInfo: ExtensionInfo) {
        this.extInfo = extInfo;
    }
};