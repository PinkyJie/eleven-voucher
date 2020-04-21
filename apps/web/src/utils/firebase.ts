const firebaseApp = window.firebase.app();

export const firebaseAuth = firebaseApp.auth();
export const firebaseAnalytics = firebaseApp.analytics();

export function logScreenView() {
  firebaseAnalytics.logEvent('screen_view', {
    // eslint-disable-next-line @typescript-eslint/camelcase
    app_name: 'Eleven Voucher',
    // eslint-disable-next-line @typescript-eslint/camelcase
    screen_name: window.location.hash,
  });
}
