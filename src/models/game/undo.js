import {combine, createEvent, createStore, guard, merge, sample, split} from 'effector'
import {$columns, $pickedBall} from './state'
import {newGame, paste} from './index'
import {updateCol} from './helpers'
import {put} from './init'

const UNDO = Symbol()
const REDO = Symbol()

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

export const undo = createEvent()
export const redo = createEvent()

export const safeUndo = sample({
  source: [$currentHistory, $pickedBall],
  clock: guard(undo, {filter: $currentHistory}),
  fn: ([currentHistory, pickedBall]) => ({
    historyItem: currentHistory,
    type: UNDO,
    pickedBall,
  }),
})

export const safeRedo = sample({
  source: [$history, $historyPos, $pickedBall],
  clock: guard(redo, {filter: $canRedo}),
  fn: ([history, pos, pickedBall]) => ({
    historyItem: history[pos + 1],
    type: REDO,
    pickedBall,
  }),
})

const {execUndo, execRedo, undoUnpick} = split(merge([safeUndo, safeRedo]), {
  undoUnpick: ({pickedBall}) => !!pickedBall,
  execUndo: ({type}) => type === UNDO,
  execRedo: ({type}) => type === REDO,
})

$columns
  .on(execUndo, (cols, {historyItem: {from, to, color}}) => {
    cols = updateCol(cols, to, col => {
      col.pop()
    })
    cols = updateCol(cols, from, col => {
      col.push(color)
    })
    return cols
  })
  .on(execRedo, (cols, {historyItem: {from, to, color}}) => {
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

$history.on(paste, (_, data) => data.history)


// history cursor
$historyPos
  .on(put, (pos) => pos + 1)
  .on(execUndo, (pos) => pos - 1)
  .on(execRedo, (pos) => pos + 1)
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
