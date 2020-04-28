import {createStore, merge} from 'effector'
import {safeRedo, safeUndo} from './undo'
import {newGame, paste} from './index'
import {put} from './init'

export const $moves = createStore(0)
  .reset(newGame)
  .on(merge([put, safeUndo, safeRedo]), moves => moves + 1)
  .on(paste, (_, data) => data.moves)
