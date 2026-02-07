import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import reactRefresh from 'eslint-plugin-react-refresh';
import sortKeysFixPlugin from 'eslint-plugin-sort-keys-fix';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      import: importPlugin,
      'sort-keys-fix': sortKeysFixPlugin,
      'unused-imports': unusedImportsPlugin,
    },
    rules: {
      'import/order': [
        'error',
        {
          alphabetize: { caseInsensitive: true, order: 'asc' },
          groups: ['builtin', 'external', ['index', 'sibling', 'parent', 'object']],
          'newlines-between': 'always',
        },
      ],
      'react-refresh/only-export-components': ['off'],
      'sort-imports': ['error', { ignoreDeclarationSort: true }],
      'sort-keys-fix/sort-keys-fix': 'warn',
      'unused-imports/no-unused-imports': 'warn',
    },
  },
]);
