import type { Config } from 'jest';

// Este arquivo fica em coe-tests/ e é lido pelo ts-node (incluído no package.coe.json).
// rootDir é a raiz do projeto: assim a cobertura mede o código da aplicação (src/) e o lcov chega ao SonarQube.
// O tsconfig.spec.json desta pasta usa target ES2016: o zone.js precisa do async/await convertido para rastrear promessas.
const config: Config = {
  preset: 'jest-preset-angular',
  rootDir: '..',
  transform: {
    '^.+\\.(ts|js|mjs|html|svg)$': ['jest-preset-angular', { tsconfig: '<rootDir>/coe-tests/tsconfig.spec.json', stringifyContentPathRegex: '\\.(html|svg)$' }],
  },
  setupFilesAfterEnv: ['<rootDir>/coe-tests/setup-jest.ts'],
  testMatch: ['<rootDir>/coe-tests/**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/coe-tests/e2e/'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/main.ts', '!src/**/*.spec.ts', '!src/environments/**'],
  coverageDirectory: '<rootDir>/artefatos/cobertura-angular',
  coverageReporters: ['lcov', 'text-summary'],
  reporters: ['default', ['jest-junit', { outputDirectory: '<rootDir>/resultados/unitario', outputName: 'angular-junit.xml', classNameTemplate: '{classname}', titleTemplate: '{title}' }]],
};

export default config;
