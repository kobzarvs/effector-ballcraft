import {combine, sample} from 'effector'
import {$columns, $id, $pickedBall} from './state'
import {newGame, paste} from './index'
// import {$history, $historyPos} from './undo'
// import {$moves} from './moves'


sample({
  source: $columns,
  clock: newGame,
  fn: (columns) => columns,
}).watch(columns => {
  const cr = columns.map(c => c.map(r => r.toString(36)).join('')).join('-')
  window.history.replaceState(null, null, cr)
})
