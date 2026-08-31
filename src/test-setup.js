import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

const storage = new Map();
const localStorageMock = {
  get length() {
    return storage.size;
  },
  clear() {
    storage.clear();
  },
  getItem(key) {
    return storage.has(key) ? storage.get(key) : null;
  },
  key(index) {
    return [...storage.keys()][index] ?? null;
  },
  removeItem(key) {
    storage.delete(key);
  },
  setItem(key, value) {
    storage.set(key, String(value));
  },
};

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: localStorageMock,
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});
