/**
 * get and check prop from source（不严谨，但也就这样了
 * @param content extension source
 * @returns extension prop
 */
export function parseExtensionProp(content: string): { [key: string]: any } {
    let prop: any = Object.create(null);

    // 解析
    let comment = <string[]>content.match(/\/\/.*(\n|$)/g) || [];
    comment = comment.map(value => value.trim().substring(2).trim());

    let i = 0;
    for (; comment[i] != "==litbooruExt=="; i++);
    i++;
    for (; comment[i] != "==/litbooruExt=="; i++) {
        let [_str, key, value] = <string[]>comment[i].match(/@(\w+)\s+(.*)/);
        prop[key.trim()] = value.trim();
    }

    return prop;
}