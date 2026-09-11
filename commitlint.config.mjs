// Mensagens de commit: Conventional Commits (os tipos do CONTRIBUTING.md) e assinatura DCO (`-s`).
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'signed-off-by': [2, 'always', 'Signed-off-by:'],
  },
}
