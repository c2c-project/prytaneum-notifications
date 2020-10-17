var path = require('path');

module.exports = {
    collectCoverage: true,
    rootDir: path.resolve(__dirname, './'),
    coverageDirectory: './coverage',
    coverageReporters: ['text', 'json', ['lcov', { projectRoot: './' }]],
    coverageThreshold: {
        global: {
            branches: 0,
            functions: 0,
            lines: 0,
            statements: 0,
        },
    },
    moduleDirectories: ['node_modules', 'src'],
};
