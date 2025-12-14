export function setSetting<T>(key: string, value: T) {
  try {
    localStorage.setItem(`pm:${key}`, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
}

export function getSetting<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`pm:${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function removeSetting(key: string) {
  try {
    localStorage.removeItem(`pm:${key}`);
  } catch {
    // ignore
  }
}