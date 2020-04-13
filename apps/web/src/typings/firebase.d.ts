/// <reference types="firebase" />

interface Window {
  firebase?: firebase.app.App;
}

declare const window: Window;
