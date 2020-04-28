import {combine, createStore, guard, merge, sample} from 'effector'
import {$columns, $pickedBall} from './state'
import {newGame, paste, redo, undo} from './index'
import {updateCol} from './helpers'
import {put} from './init'


export const $historyPos = createStore(-1).reset(newGame)
export const $history = createStore([]).reset(newGame)
export const $currentHistory = combine(
  [$history, $historyPos],
  ([h, p]) => h[p] || null,
)

export const $canRedo = combine(
  [$history, $historyPos],
  ([h, p, t]) => p < h.length - 1,
)

export const safeUndo = sample({
  source: $currentHistory,
  clock: guard(undo, {filter: $currentHistory}),
})

export const safeRedo = sample({
  source: [$history, $historyPos],
  clock: guard(redo, {filter: $canRedo}),
  fn: ([history, pos]) => {
    return history[pos + 1]
  },
})

export const undoUnpick = sample({
  source: $pickedBall,
  clock: guard(merge([safeUndo, safeRedo]), {filter: $pickedBall}),
  fn: pickedBall => pickedBall,
})

$columns
  .on(safeUndo, (cols, {from, to, color}) => {
    cols = updateCol(cols, to, col => {
      col.pop()
    })
    cols = updateCol(cols, from, col => {
      col.push(color)
    })
    return cols
  })
  .on(safeRedo, (cols, {from, to, color}) => {
    cols = updateCol(cols, from, col => {
      col.pop()
    })
    cols = updateCol(cols, to, col => {
      col.push(color)
    })
    return cols
  })

sample({
  source: [$columns, $pickedBall],
  clock: undoUnpick,
  fn: ([cols, picked]) => {
    if (!picked) return
    return updateCol(cols, picked.from, col => {
      col.push(picked.color)
    })
  },
  target: $columns,
})

$history.on(paste, (_, data) => {
  console.log('paste history', data.history)
  return data.history
})


// history cursor
$historyPos
  .on(put, (pos) => pos + 1)
  .on(safeUndo, (pos) => pos - 1)
  .on(safeRedo, (pos) => pos + 1)
  .on(paste, (_, data) => data.historyPos || -1)

// append history record
sample({
  clock: put,
  source: [$history, $historyPos],
  fn: ([h, p], {pickedBall: {from, color}, selected}) => {
    return [...h.slice(0, p), {from, to: selected, color}]
  },
  target: $history,
})

sample({
  source: undoUnpick,
  fn: () => null,
  target: $pickedBall,
})
