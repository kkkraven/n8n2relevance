module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/worker/**/*.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }]
  }
};
