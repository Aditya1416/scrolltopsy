import 'vitest-localstorage-mock'
import { IDBFactory } from 'fake-indexeddb'

Object.defineProperty(globalThis, 'indexedDB', {
  value: new IDBFactory(),
  writable: true,
  configurable: true,
})

beforeEach(() => { localStorage.clear() })
