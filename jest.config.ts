import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const baseTestConfig: Config = {
  clearMocks: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/?(*.)+(stories|spec|test).[tj]s?(x)',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'] as const,
  moduleNameMapper: {
    '^app/(.*)$': '<rootDir>/src/app/$1',
    '^modules/(.*)$': '<rootDir>/src/modules/$1',
    '^api/(.*)$': '<rootDir>/src/app/api/$1',
    '^components/(.*)$': '<rootDir>/src/app/components/$1',
    '^lib/(.*)$': '<rootDir>/src/app/lib/$1',
    '^types/(.*)$': '<rootDir>/src/types/$1',
    '^test-utils$': '<rootDir>/tests/utils/test-utils',
    '^.+\\.(css|scss|sass)$': 'identity-obj-proxy',
    '^.+\\.(jpg|jpeg|png|gif|webp|avif|svg|ico)$': '<rootDir>/tests/__mocks__/fileMock.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/dist/'],
};

const lintProject: Config = {
  displayName: 'lint',
  runner: 'jest-runner-eslint',
  testMatch: ['<rootDir>/**/*.{js,jsx,ts,tsx}'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/coverage/',
    '<rootDir>/dist/',
    '<rootDir>/node_modules/',
  ],
};

const createConfig = createJestConfig(baseTestConfig);

const jestConfig = async (): Promise<Config> => {
  const nextConfig = await createConfig();

  return {
    watchPlugins: [
      'jest-watch-typeahead/filename',
      'jest-watch-typeahead/testname',
    ],
    projects: [
      {
        ...nextConfig,
        displayName: 'test',
      },
      lintProject,
    ],
  };
};

export default jestConfig;
