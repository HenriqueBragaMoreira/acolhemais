// Plugin do OpenCode com as mesmas travas do hook do Claude Code (.claude/hooks/guard-rules.mjs).
import { checkCommand, checkPath } from '../../.claude/hooks/guard-rules.mjs'

const WRITE_TOOLS = new Set(['edit', 'write', 'patch'])

export const Guard = async () => ({
  'tool.execute.before': async (input, output) => {
    const reason =
      input.tool === 'bash'
        ? checkCommand(output.args.command)
        : checkPath(output.args.filePath, { writing: WRITE_TOOLS.has(input.tool) })
    if (reason) throw new Error(`Bloqueado: ${reason}`)
  },
})
