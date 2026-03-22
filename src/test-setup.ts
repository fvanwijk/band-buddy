import '@testing-library/jest-dom';
import { beforeEach } from 'vite-plus/test';

beforeEach(() => {
  localStorage.clear();
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
