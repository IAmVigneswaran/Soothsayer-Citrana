export default [
    {
        files: ['assets/js/**/*.js'],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            globals: {
                Konva: 'readonly',
                lucide: 'readonly'
            }
        },
        linterOptions: {
            reportUnusedDisableDirectives: true
        },
        rules: {
            'no-unused-vars': ['warn', { vars: 'all', args: 'after-used', ignoreRestSiblings: false }],
            'no-console': 'off',
            'semi': ['error', 'always'],
            'quotes': ['error', 'single'],
            'eqeqeq': 'warn',
            'no-var': 'error',
            'prefer-const': 'warn',
            'indent': ['error', 4, { SwitchCase: 1 }],
            'comma-dangle': ['error', 'never']
        }
    }
]; 