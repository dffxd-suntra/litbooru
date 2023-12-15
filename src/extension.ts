import { parseExtensionProp } from "./utils/extension";

let extList = [];
let ext: any;

export async function load() {
    let list = await fetch("./boorus/default.json").then(res => res.json());
    for(let i in list) {
        let source = await fetch(list[i]).then(res => res.text());
        extList.push({
            meta: parseExtensionProp(source),
            source,
            ext: await import(URL.createObjectURL(new Blob([source], { type: "text/javascript" })))
        });
    }

    console.log(extList);
}

export function getExtensionList() {
    return extList;
}

export async function chooseExtension(index: number) {
    if(extList[index] == undefined) {
        throw new Error(`No this Extension!`);
    }
    ext = extList[index];
}

export function getExtension() {
    return ext;
}