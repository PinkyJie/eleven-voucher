const TOKEN_KEY = 'ELEVEN_TOKEN';

export function getTokenFromStore() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function saveTokenToStore(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function removeTokenFromStore() {
  window.localStorage.removeItem(TOKEN_KEY);
}
