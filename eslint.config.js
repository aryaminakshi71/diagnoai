import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/drizzle/**',
      '**/coverage/**',
      '**/*.config.{js,ts,mjs,cjs}',
    ],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      // These are widespread in this codebase; keep them visible without
      // blocking the gate. Tighten to "error" as the count comes down.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
)
