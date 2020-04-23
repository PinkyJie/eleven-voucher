const firebaseApp = window.firebase.app();

export const firebaseAuth = firebaseApp.auth();
export const firebaseAnalytics = firebaseApp.analytics();

export function trackScreenView() {
  console.log(`screen: ${window.location.hash}`);
  firebaseAnalytics.logEvent('screen_view', {
    // eslint-disable-next-line @typescript-eslint/camelcase
    app_name: window.location.hash,
    // eslint-disable-next-line @typescript-eslint/camelcase
    screen_name: window.location.hash,
  });
}

export function trackError(code: string, message: string) {
  firebaseAnalytics.logEvent('exception', {
    code,
    description: message,
  });
}
