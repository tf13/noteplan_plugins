// @flow

import { renameNoteToTitle } from '../../helpers/renameNotes'
import { logDebug, logError, logInfo, logWarn } from '@helpers/dev'

/**
 * Renames the current note to match its title.
 * @returns void
 */
export function titleToFilename(): void {
  try {
    const { note } = Editor

    if (note) {
      renameNoteToTitle(note)
    }
  } catch (error) {
    logError(error)
  }
}
