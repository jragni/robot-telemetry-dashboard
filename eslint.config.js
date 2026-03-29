import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import boundaries from 'eslint-plugin-boundaries';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      'dist/',
      'node_modules/',
      '.planning/',
      'e2e/',
      'eslint.config.js',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  // Three-tier architecture enforcement: Shared → Features → App
  // See docs/FOLDER-STRUCTURE.md for the dependency diagram
  {
    plugins: {
      boundaries,
    },
    settings: {
      'boundaries/elements': [
        {
          type: 'shared',
          pattern: ['src/shared/*', 'src/shared/**/*'],
          mode: 'full',
        },
        {
          type: 'feature',
          pattern: ['src/features/*', 'src/features/**/*'],
          mode: 'full',
        },
        { type: 'ui', pattern: ['src/components/ui/*'], mode: 'full' },
        { type: 'app', pattern: ['src/App.tsx', 'src/main.tsx'], mode: 'full' },
        {
          type: 'utils',
          pattern: ['src/utils/*', 'src/test-utils/*'],
          mode: 'full',
        },
      ],
      'boundaries/ignore': ['**/*.test.ts', '**/*.test.tsx'],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          rules: [
            // Shared can only import from shared, ui, and utils
            { from: ['shared'], allow: ['shared', 'ui', 'utils'] },
            // Features can import from shared, ui, utils, and own feature
            { from: ['feature'], allow: ['shared', 'ui', 'utils', 'feature'] },
            // UI (shadcn) can import from shared and utils
            { from: ['ui'], allow: ['shared', 'utils', 'ui'] },
            // App can import from everything
            { from: ['app'], allow: ['shared', 'feature', 'ui', 'utils'] },
            // Utils can only import from utils
            { from: ['utils'], allow: ['utils'] },
          ],
        },
      ],
    },
  },
  eslintConfigPrettier,
);
