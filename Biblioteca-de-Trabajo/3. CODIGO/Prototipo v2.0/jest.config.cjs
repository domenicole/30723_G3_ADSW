module.exports = {
  rootDir: '.',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/unitarias/**/*.test.js'],
  transform: { '^.+\\.js$': 'babel-jest' },
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'text-summary', 'html', 'lcov'],
  collectCoverageFrom: [
    'src/negocio/**/*.js',
    '!src/negocio/IObservadorAuditoria.js',
    '!src/negocio/IServicioFiCitas.js',
    '!src/negocio/strategy/ICanal.js',
  ],
  coverageThreshold: {
    'src/negocio/': { branches: 70, lines: 80 },
  },
};
