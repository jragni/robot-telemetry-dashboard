import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import boundaries from 'eslint-plugin-boundaries';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import jsdoc from 'eslint-plugin-jsdoc';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      'dist/',
      'node_modules/',
      '.planning/',
      'e2e/',
      'eslint.config.js',
      'src/components/ui/',
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
  // Accessibility enforcement — catches <div onClick>, missing aria-labels, heading order
  jsxA11y.flatConfigs.recommended,
  // JSDoc enforcement — require docstrings on exported functions/components
  {
    plugins: { jsdoc },
    rules: {
      'jsdoc/require-jsdoc': [
        'warn',
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            FunctionExpression: true,
            ArrowFunctionExpression: true,
          },
          contexts: ['ExportNamedDeclaration > FunctionDeclaration'],
        },
      ],
    },
  },
  // Three-tier architecture enforcement: Shared (src/*) → Features → App
  // See docs/FOLDER-STRUCTURE.md for the dependency diagram
  {
    plugins: {
      boundaries,
    },
    settings: {
      'boundaries/elements': [
        {
          type: 'components',
          pattern: ['src/components/*'],
          mode: 'full',
        },
        { type: 'ui', pattern: ['src/components/ui/*'], mode: 'full' },
        {
          type: 'hooks',
          pattern: ['src/hooks/*'],
          mode: 'full',
        },
        {
          type: 'stores',
          pattern: ['src/stores/*', 'src/stores/**/*'],
          mode: 'full',
        },
        {
          type: 'lib',
          pattern: ['src/lib/*'],
          mode: 'full',
        },
        {
          type: 'feature',
          pattern: ['src/features/*', 'src/features/**/*'],
          mode: 'full',
        },
        { type: 'app', pattern: ['src/App.tsx', 'src/main.tsx'], mode: 'full' },
        {
          type: 'utils',
          pattern: ['src/utils/*', 'src/test-utils/*'],
          mode: 'full',
        },
        {
          type: 'types',
          pattern: ['src/types/*'],
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
            // Shared layers can import from each other and utils
            {
              from: ['components'],
              allow: [
                'components',
                'hooks',
                'stores',
                'lib',
                'ui',
                'utils',
                'types',
              ],
            },
            {
              from: ['hooks'],
              allow: ['hooks', 'stores', 'lib', 'utils', 'types'],
            },
            { from: ['stores'], allow: ['stores', 'lib', 'utils', 'types'] },
            { from: ['lib'], allow: ['lib', 'utils'] },
            { from: ['types'], allow: ['types'] },
            // UI (shadcn) can import from lib and utils only
            { from: ['ui'], allow: ['lib', 'utils', 'ui'] },
            // Features can import from all shared layers and own feature
            {
              from: ['feature'],
              allow: [
                'components',
                'hooks',
                'stores',
                'lib',
                'ui',
                'utils',
                'types',
                'feature',
              ],
            },
            // App can import from everything
            {
              from: ['app'],
              allow: [
                'components',
                'hooks',
                'stores',
                'lib',
                'feature',
                'ui',
                'utils',
                'types',
              ],
            },
            // Utils can only import from utils
            { from: ['utils'], allow: ['utils'] },
          ],
        },
      ],
    },
  },
  eslintConfigPrettier,
);
