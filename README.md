# lit-booru --Booru浏览器
just use lit-element + vite  
Demo(感谢cloudflare): [https://litbooru.pages.dev/](https://litbooru.pages.dev/)  

## 开发
环境`nodejs`即可  
```shell
npm install # 初始化，仅运行一次
npm run dev # 运行调试模式，支持热重载
npm run build # 编译源码
```
  
## booru扩展插件：  
网站跟目录下`booru/default.json`文件定义了默认的插件列表，用户可在前端自行添加。  
`booru/default.json`文件格式如下：
```javascript
[
    {
        "icon": "https://gelbooru.com/favicon.png",
        "title": "Gelbooru",
        "subtitle": "-- dffxd-suntra",
        "src": "./boorus/gelbooru.js"
    }
]
```
用一个数组包含若干个对象,每一个对象代表一个插件  
其中`"src"`和`"icon"`若使用相对文件目录，则以网站代码目录为准  
实例的六个键每一个键都必须要有，即使是空字符串

## Todo: 优先级基本从低到高
- [ ] 代码全注释
- [ ] 多网站适配
    - [ ] [gelbooru](https://gelbooru.com/)
    - [x] [rule34.xxx](https://rule34.xxx/)
    - [ ] [danbooru](https://danbooru.donmai.us/)
    - [ ] [rule34.us](https://rule34.us/)
    - [ ] [hypnohub](https://hypnohub.net/)
    - [ ] [xbooru](https://xbooru.com/)
    - [ ] [konachan.com](https://konachan.com/)
    - [ ] [konachan.net(Save)](https://konachan.net/)
    - [ ] [realbooru](https://realbooru.com/)
    - [ ] [safebooru](https://safebooru.org/)
    - [ ] [BOORU PROJECT(boorus)](https://booru.org/) 没想好怎么做这个
- [ ] 缓存
    - [ ] 本地缓存
        - [ ] zip压缩
    - [ ] aria2c
    - [ ] google drive
    - [ ] 各种api...
- [ ] 收藏夹
- [ ] i18n多语言适配
- [ ] ServiseWorker离线使用
- [ ] 导出为数据库
- [ ] 手势操作
- [ ] 试试写一个论文转本针对这个