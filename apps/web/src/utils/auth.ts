import { firebaseAuth, trackError } from './firebase';

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

export async function loginAndGetToken(
  email: string,
  password: string
): Promise<string> {
  try {
    await firebaseAuth.signInWithEmailAndPassword(email, password);
    return firebaseAuth.currentUser.getIdToken(true);
  } catch (e) {
    trackError(e.code, e.message);
    throw e;
  }
}
