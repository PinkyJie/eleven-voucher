export function logPageView() {
  if (window.firebase) {
    const analytics = window.firebase.analytics();
    analytics.logEvent('page_view', {
      // eslint-disable-next-line @typescript-eslint/camelcase
      page_path: window.location.hash,
    });
  }
}
