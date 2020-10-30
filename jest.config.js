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
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90,
        },
    },
    moduleDirectories: ['node_modules', 'src'],
};
