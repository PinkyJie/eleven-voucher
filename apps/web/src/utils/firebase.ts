const firebaseApp = window.firebase.app();

export const firebaseAuth = firebaseApp.auth();
export const firebaseAnalytics = firebaseApp.analytics();

export function logPageView() {
  firebaseAnalytics.logEvent('page_view', {
    // eslint-disable-next-line @typescript-eslint/camelcase
    page_path: window.location.hash,
  });
}
