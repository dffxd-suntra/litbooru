// todo: [ ] ServiseWorker缓存booru插件
let boorusInfo: booruInfo[] = [];
let boorusClass: any[] = [];

let choosedBooru: number = null;

function checkInfo(info: booruInfo) {
    if ("icon" in info &&
        "name" in info &&
        "auther" in info &&
        "description" in info &&
        "version" in info &&
        "src" in info) {
        return;
    }
    throw new SyntaxError("Booru info SyntaxError, " + JSON.stringify(info));
}

export async function loadInfo() {
    // 获取booru插件数据
    boorusInfo = await fetch("./boorus/default.json").then(res => res.json());
    console.log("boorusInfo:", boorusInfo);

    // 检查是否合规
    for (let i in boorusInfo) {
        checkInfo(boorusInfo[i]);
    }

    // 获取所有插件 ServiseWorker缓存（todo...）
    for (let i in boorusInfo) {
        boorusClass[i] = await import(boorusInfo[i].src);
    }
}

export function getBoorusInfo() {
    return boorusInfo;
}

export function chooseBooru(index: number) {
    if (index < 0 || index >= boorusInfo.length) {
        throw new RangeError("out of range");
    }
    choosedBooru = index;
}

export function getChoosedBooru() {
    return {
        info: boorusInfo[choosedBooru],
        class: boorusClass[choosedBooru]
    };
}

declare global {
    interface booruInfo {
        icon: string
        name: string
        auther: string
        description: string
        version: string
        src: string
        class: any
    }
}

