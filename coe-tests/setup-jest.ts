import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';

setupZoneTestEnv();
expect.extend(toHaveNoViolations);

// crypto.randomUUID no jsdom
if (!globalThis.crypto?.randomUUID) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Object.defineProperty(globalThis, 'crypto', { value: require('node:crypto').webcrypto });
}
