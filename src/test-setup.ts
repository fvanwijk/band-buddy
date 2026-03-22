import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vite-plus/test';

beforeEach(() => {
  localStorage.clear();
});

// afterEach is not registered globally, so auto cleanup is disabled in testing-library/react, and we need to call it manually after each test to reset the DOM.
afterEach(() => {
  cleanup();
});

// Polyfill DOMMatrix for Node test environment (for pdfjs-dist/react-pdf)
if (globalThis.DOMMatrix === undefined) {
  class DOMMatrixMock {
    constructor() {}
    multiply() {
      return this;
    }
    invertSelf() {
      return this;
    }
    translate() {
      return this;
    }
    scale() {
      return this;
    }
    rotate() {
      return this;
    }
    toFloat32Array() {
      return new Float32Array(6);
    }
    toFloat64Array() {
      return new Float64Array(6);
    }
    static fromFloat32Array() {
      return new DOMMatrixMock();
    }
    static fromFloat64Array() {
      return new DOMMatrixMock();
    }
    static fromMatrix() {
      return new DOMMatrixMock();
    }
  }
  globalThis.DOMMatrix = DOMMatrixMock as unknown as typeof DOMMatrix;
}
