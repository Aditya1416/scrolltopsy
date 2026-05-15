import 'vitest-localstorage-mock'
import { IDBFactory } from 'fake-indexeddb'

// Polyfill IndexedDB for jsdom/happy-dom
Object.defineProperty(globalThis, 'indexedDB', {
  value: new IDBFactory(),
  writable: true,
})

// Reset localStorage and IndexedDB before every test
beforeEach(() => {
  localStorage.clear()
  // fake-indexeddb auto-resets per import — no manual clear needed
})
