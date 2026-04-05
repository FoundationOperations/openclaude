import type { LocalCommandCall } from '../../types/command.js'
import { execSync } from 'node:child_process'
import { getEventLog } from '../../services/router/index.js'

export const call: LocalCommandCall = async (args: string) => {
  var eventLog = getEventLog()
  var sub = args.trim().toLowerCase()
  var cwd = process.cwd()

  try {
    if (sub === 'all') {
      // Find safety branch
      var branches = execSync('git branch --list "openclaude-safety-*" --sort=-creatordate', { cwd: cwd, encoding: 'utf-8' }).trim()
      if (!branches) {
        return { type: 'text', value: 'No safety branches found. Nothing to undo.' }
      }
      var latestBranch = branches.split('\n')[0].trim().replace(/^\*?\s/, '')
      return { type: 'text', value: [
        '## Undo All',
        '',
        'Safety branch found: **' + latestBranch + '**',
        '',
        'To rollback to this point, run:',
        '  git checkout ' + latestBranch + ' -- .',
        '',
        'This will restore all files to the state before the last multi-file change.',
        'Your current changes will be lost. Commit first if needed.',
      ].join('\n') }
    }

    // Default: undo last change via git
    var status = execSync('git status --porcelain', { cwd: cwd, encoding: 'utf-8' }).trim()
    if (!status) {
      // No uncommitted changes — offer to revert last commit
      var lastCommit = execSync('git log --oneline -1', { cwd: cwd, encoding: 'utf-8' }).trim()
      return { type: 'text', value: [
        '## Undo',
        '',
        'No uncommitted changes. Last commit:',
        '  ' + lastCommit,
        '',
        'To revert the last commit (keeping changes unstaged):',
        '  git reset HEAD~1',
      ].join('\n') }
    }

    var changedFiles = status.split('\n').length
    return { type: 'text', value: [
      '## Undo',
      '',
      changedFiles + ' file(s) with uncommitted changes.',
      '',
      'To discard all uncommitted changes:',
      '  git checkout -- .',
      '',
      'To stash changes (recoverable):',
      '  git stash push -m "undo-' + new Date().toISOString().slice(0, 19).replace(/[:.]/g, '') + '"',
    ].join('\n') }
  } catch (err) {
    return { type: 'text', value: 'Error: ' + String(err) }
  }
}
