import "./lit-booru";

// keep cors proxy on
// 4.5min per fetch
fetch("https://tame-local-branch.glitch.me/");
setInterval(() => fetch("https://tame-local-branch.glitch.me/"), 4.5 * 60 * 1000);

declare global {
    interface Window {
        // clarity 统计工具
        clarity: any;
    }
}