/// <reference types="firebase" />

interface Window {
  firebase?: firebase.app.App;
}

declare const window: Window;

interface HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
}

declare global {
  interface Document {
    webkitExitFullscreen?: () => Promise<void>;
    documentElement: HTMLElement;
  }
}
