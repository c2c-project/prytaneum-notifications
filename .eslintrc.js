module.exports = {
    extends: [
        'airbnb-typescript/base',
        'prettier',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:jest/recommended',
    ],
    parserOptions: {
        project: './tsconfig.json',
    },
    rules: {
        quotes: ['error', 'single'],
        indent: 'off',
        '@typescript-eslint/indent': ['error', 4, { SwitchCase: 1 }],
        'jsx-quotes': ['error', 'prefer-single'],
        'import/no-extraneous-dependencies': [
            'error',
            { devDependencies: ['**/*.test.*', '**/*.stories.*'] },
        ],
        'import/no-absolute-path': 0,
        'no-underscore-dangle': 'off',
        'func-names': 'off',
        '@typescript-eslint/naming-convention': 'off',
    },
    env: {
        node: true,
        browser: true,
        'jest/globals': true,
    },
    settings: {
        'import/extensions': ['.js', '.jsx'],
    },
};
