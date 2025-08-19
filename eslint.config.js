import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import nodePlugin from 'eslint-plugin-node';

export default [
  js.configs.recommended,
  prettier,
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
      },
    },
    plugins: {
      prettier: prettierPlugin,
      node: nodePlugin,
    },
    rules: {
      // 代码风格规则
      indent: ['error', 2],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      'no-debugger': 'error',

      // Node.js 规则
      'node/no-unsupported-features/es-syntax': 'off',
      'node/no-missing-import': 'off',

      // 最佳实践
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',

      // 错误处理
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',

      // Prettier 规则
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['client/**/*.js', 'client/**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        Promise: 'readonly',
        Set: 'readonly',
        Map: 'readonly',
        WeakMap: 'readonly',
        WeakSet: 'readonly',
        Proxy: 'readonly',
        Reflect: 'readonly',
        Symbol: 'readonly',
        Intl: 'readonly',
        ArrayBuffer: 'readonly',
        DataView: 'readonly',
        Float32Array: 'readonly',
        Float64Array: 'readonly',
        Int8Array: 'readonly',
        Int16Array: 'readonly',
        Int32Array: 'readonly',
        Uint8Array: 'readonly',
        Uint8ClampedArray: 'readonly',
        Uint16Array: 'readonly',
        Uint32Array: 'readonly',
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'prettier/prettier': 'error',
    },
  },
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
      '*.min.js',
      '*.bundle.js',
      '.env*',
      '*.log',
      'package-lock.json',
      'yarn.lock',
    ],
  },
];
