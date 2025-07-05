// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock window methods
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock HTMLVideoElement
Object.defineProperty(HTMLVideoElement.prototype, 'play', {
  writable: true,
  value: jest.fn().mockResolvedValue(undefined)
});

Object.defineProperty(HTMLVideoElement.prototype, 'pause', {
  writable: true,
  value: jest.fn()
});

Object.defineProperty(HTMLVideoElement.prototype, 'load', {
  writable: true,
  value: jest.fn()
});

Object.defineProperty(HTMLVideoElement.prototype, 'duration', {
  writable: true,
  value: 120
});

Object.defineProperty(HTMLVideoElement.prototype, 'currentTime', {
  writable: true,
  value: 0
});

Object.defineProperty(HTMLVideoElement.prototype, 'volume', {
  writable: true,
  value: 1
});

Object.defineProperty(HTMLVideoElement.prototype, 'muted', {
  writable: true,
  value: false
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 0));
global.cancelAnimationFrame = jest.fn();
