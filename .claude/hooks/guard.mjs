// Hook PreToolUse do Claude Code: lê a chamada da ferramenta no stdin e sai com 2 (bloqueio,
// motivo no stderr) quando uma regra de guard-rules.mjs recusa.
import { checkCommand, checkPath } from './guard-rules.mjs'

const WRITE_TOOLS = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit'])

let input = ''
for await (const chunk of process.stdin) input += chunk

const { tool_name: tool, tool_input: args = {} } = JSON.parse(input || '{}')
const reason =
  tool === 'Bash' || tool === 'PowerShell'
    ? checkCommand(args.command)
    : checkPath(args.file_path ?? args.notebook_path, { writing: WRITE_TOOLS.has(tool) })

if (reason) {
  process.stderr.write(`Bloqueado: ${reason}\n`)
  process.exit(2)
}
