import "./lit-booru";

// keep cors proxy on
// 4.5min per fetch
setInterval(() => fetch("https://tame-local-branch.glitch.me/"), 4.5 * 60 * 1000);

declare global {
    interface Window {
        clarity: any;
    }
}