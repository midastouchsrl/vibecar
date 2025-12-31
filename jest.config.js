/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        resolveJsonModule: true,
      },
    }],
  },
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/lib/**/*.ts',
    '!src/lib/datasource.ts', // Skip datasource (network calls)
  ],
};
