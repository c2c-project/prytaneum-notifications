var path = require('path');

module.exports = {
    collectCoverage: true,
    rootDir: path.resolve(__dirname, './'),
    coverageDirectory: './coverage',
    coverageReporters: ['text', 'json', ['lcov', { projectRoot: './' }]],
    collectCoverageFrom: [
        'src/routes/*.ts',
        'src/app/*.ts',
        'src/config/*.ts',
        'src/config/env/*.ts',
        'src/db/*.ts',
        'src/lib/**/.ts',
        'src/modules/notifications/*.ts',
    ],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50,
        },
    },
    moduleDirectories: ['node_modules', 'src'],
};
