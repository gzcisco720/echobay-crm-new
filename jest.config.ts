import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  testTimeout: 30000,
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/__tests__/unit/**/*.test.ts'],
      testEnvironment: 'node',
      transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: { module: 'commonjs' } }] },
      moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/__tests__/integration/**/*.test.ts'],
      testEnvironment: 'node',
      transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: { module: 'commonjs' } }] },
      moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      maxWorkers: 1,
    },
  ],
}

export default createJestConfig(config)
