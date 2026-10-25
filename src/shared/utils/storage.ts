// localStorage can be missing or blocked (private mode, blocked site data); never let that break the app.
export const storage = {
  get: (key: string) => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key: string, value: string) => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Unavailable: the value just isn't remembered.
    }
  },
  remove: (key: string) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Unavailable: there was nothing stored to remove.
    }
  },
};
