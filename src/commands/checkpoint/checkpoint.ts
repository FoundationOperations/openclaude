import type { LocalCommandCall } from '../../types/command.js'
import { getEventLog } from '../../services/router/index.js'
import { Checkpointer } from '../../services/router/checkpointer.js'
import { DecisionLog } from '../../services/router/decisionLog.js'
import { TaskPersistence } from '../../services/router/taskPersistence.js'

export const call: LocalCommandCall = async () => {
  const eventLog = getEventLog()
  const cwd = process.cwd()

  try {
    const checkpointer = new Checkpointer(cwd)
    const decisionLog = new DecisionLog(cwd)
    const taskPersistence = new TaskPersistence(cwd)
    const sessionId = eventLog?.getSessionId() ?? 'unknown'

    const path = checkpointer.save(sessionId, eventLog, decisionLog, taskPersistence)
    return { type: 'text', value: `Checkpoint saved to \`${path}\`` }
  } catch (err) {
    return { type: 'text', value: `Failed to save checkpoint: ${err}` }
  }
}
