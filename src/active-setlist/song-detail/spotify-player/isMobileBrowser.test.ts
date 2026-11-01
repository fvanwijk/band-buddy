import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { isMobileBrowser } from './isMobileBrowser';

describe('isMobileBrowser', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const stubNavigator = (navigatorProps: Partial<Navigator>) =>
    vi.stubGlobal('navigator', {
      maxTouchPoints: 0,
      platform: '',
      userAgent: '',
      ...navigatorProps,
    });

  it('detects Android phones', () => {
    stubNavigator({ userAgent: 'Mozilla/5.0 (Linux; Android 16; Pixel 10 Pro) Chrome/130 Mobile' });

    expect(isMobileBrowser()).toBe(true);
  });

  it('detects iPads that identify as a Mac', () => {
    stubNavigator({ maxTouchPoints: 5, platform: 'MacIntel', userAgent: 'Macintosh' });

    expect(isMobileBrowser()).toBe(true);
  });

  it('does not treat desktop browsers as mobile', () => {
    stubNavigator({ platform: 'MacIntel', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)' });

    expect(isMobileBrowser()).toBe(false);
  });
});
