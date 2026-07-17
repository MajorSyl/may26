class SafeStorage {
  private memoryStore: Record<string, string> = {};

  getItem(key: string): string | null {
    try {
      const val = localStorage.getItem(key);
      return val;
    } catch (e) {
      console.warn(`localStorage.getItem failed for key "${key}", using memory store fallback:`, e);
      return this.memoryStore[key] !== undefined ? this.memoryStore[key] : null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`localStorage.setItem failed for key "${key}", using memory store fallback:`, e);
      this.memoryStore[key] = value;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`localStorage.removeItem failed for key "${key}", using memory store fallback:`, e);
      delete this.memoryStore[key];
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('localStorage.clear failed, using memory store fallback:', e);
      this.memoryStore = {};
    }
  }
}

export const safeStorage = new SafeStorage();
