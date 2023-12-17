import { isFunction, isInteger } from "lodash";
import { parseExtensionProp } from "./utils/extension";
import ExtensionUntils from "./classes/ExtensionUtils";

import { ExtensionClass, ExtensionInfo, ExtensionOptionsResult } from "./types/extension";

let extList: ExtensionInfo[] = [];
let extInfo: ExtensionInfo;
let extClass: ExtensionClass = null;

export async function load() {
    let list = await fetch("./boorus/default.json").then(res => res.json());
    for (let i in list) {
        let source = await fetch(list[i]).then(res => res.text());
        extList.push({
            meta: parseExtensionProp(source),
            source,
            ext: (await import(/* @vite-ignore */URL.createObjectURL(new Blob([source], { type: "text/javascript" })))).default
        });
    }

    console.log(extList);
}

export function getExtensionList() {
    return extList;
}

function getExtOptions(extInfo: ExtensionInfo): ExtensionOptionsResult {
    // 测试先搞简陋一点
    let result: ExtensionOptionsResult = Object.create(null);
    for (let i in extInfo.ext.setting) {
        result[extInfo.ext.setting[i].name] = extInfo.ext.setting[i].default || "";
    }

    return result;
}

function getExtUntils(extInfo: ExtensionInfo): ExtensionUntils {
    return new ExtensionUntils(extInfo);
}

export function chooseExtension(index: number) {
    if (!isInteger(index) || !(index in extList)) {
        throw new Error(`No this Extension!`);
    }
    extInfo = extList[index];
    if (extClass != null && isFunction(extClass.unMount)) {
        extClass.unMount();
    }

    extClass = new extInfo.ext.class(getExtUntils(extInfo), getExtOptions(extInfo));
}

export function getExtension() {
    return {
        extInfo,
        extClass
    };
}