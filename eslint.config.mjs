/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-underscore-dangle */
import { defineConfig, globalIgnores } from 'eslint/config';
import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import jest from 'eslint-plugin-jest';
import _import from 'eslint-plugin-import';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([globalIgnores(['**/docs']), {
  extends: fixupConfigRules(compat.extends(
    'airbnb-base',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  )),

  plugins: {
    '@typescript-eslint': typescriptEslint,
    jest,
    import: fixupPluginRules(_import),
  },

  languageOptions: {
    globals: {
      ...globals.browser,
      ...jest.environments.globals.globals,
    },

    parser: tsParser,
  },
  rules: {
    'no-console': ['error', {
      allow: ['info', 'warn', 'error'],
    }],

    'import/extensions': ['error', 'ignorePackages', {
      ts: 'never',
      js: 'never',
    }],

    'import/prefer-default-export': 'off',
  },
}]);
