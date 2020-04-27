import {forward, combine, sample, split, guard, merge, createEvent} from 'effector'
import {
  $columns,
  $noPicked,
  $pickedBall,
  $gameConfig,
  $id,
  $selectedColumn,
  $history,
  $historyPos,
  $canRedo, $currentHistory,
} from './state'
import {newGame, selectColumn, redo, undo, save, load} from './index'


function updateCol(columns, id, cb) {
  columns = [...columns]
  columns[id] = [...columns[id]]
  cb(columns[id])
  return columns
}

$id.on(newGame, id => id + 1)
$pickedBall.reset(newGame)
$historyPos.reset(newGame)
$history.reset(newGame)

const stream = sample({
  clock: selectColumn,
  source: {columns: $columns, pickedBall: $pickedBall, noPicked: $noPicked, config: $gameConfig},
  fn: (stores, selected) => ({...stores, selected}),
})

const {pick, unpick, put, repick} = split(stream, {
  pick: ({columns, selected, noPicked}) => {
    const isEmpty = columns[selected].length === 0
    return noPicked && !isEmpty
  },
  unpick: ({pickedBall, selected}) => pickedBall && selected === pickedBall.from,
  put: ({columns, pickedBall, selected, config}) => {
    const pickedAndSelectedOtherColumn = pickedBall && selected !== pickedBall?.from
    const isEmpty = columns[selected].length === 0
    const isFree = columns[selected].length < config.levels
    const canPut = columns[selected][columns[selected].length - 1] === pickedBall?.color
    return pickedAndSelectedOtherColumn && (isEmpty || (isFree && canPut))
  },
  repick: ({pickedBall}) => !!pickedBall,
})

repick.watch(({pickedBall, selected}) => {
  if (!pickedBall) return
  selectColumn(pickedBall.from)
  selectColumn(selected)
})

//
// undo feature
//
const safeUndo = sample({
  source: $currentHistory,
  clock: guard(undo, {filter: $currentHistory})
})

const safeRedo = sample({
  source: [$history, $historyPos],
  clock: guard(redo, {filter: $canRedo}),
  fn: ([history, pos]) => {
    return history[pos + 1]
  }
})

const undoUnpick = sample({
  source: $pickedBall,
  clock: guard(merge([safeUndo, safeRedo]), {filter: $pickedBall}),
  fn: pickedBall => pickedBall,
})

$columns
  .on(pick, (cols, {selected}) =>
    updateCol(cols, selected, col => {
      col.pop()
    }),
  )
  .on(put, (cols, {pickedBall: {color}, selected}) =>
    updateCol(cols, selected, col => {
      col.push(color)
    }),
  )
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
  clock: merge([unpick, undoUnpick]),
  fn: ([cols, picked]) => {
    if (!picked) return
    return updateCol(cols, picked.from, col => {
      col.push(picked.color)
    })
  },
  target: $columns,
})

//
$pickedBall
  // .reset(unpick, put)
  .on(pick, (_, {selected, columns}) => ({
    from: selected,
    color: columns[selected][columns[selected].length - 1],
  }))

sample({
  source: merge([unpick, put, undoUnpick]),
  fn: () => null,
  target: $pickedBall,
})

// history cursor
$historyPos
  .on(put, (pos) => pos + 1)
  .on(safeUndo, (pos) => pos - 1)
  .on(safeRedo, (pos) => pos + 1)

// append history record
sample({
  clock: put,
  source: [$history, $historyPos],
  fn: ([h, p], {pickedBall: {from, color}, selected}) => {
    return [...h.slice(0, p), {from, to: selected, color}]
  },
  target: $history,
})

// save selected column
sample({
  clock: selectColumn,
  source: $columns,
  fn: (cols, selected) => cols[selected],
  target: $selectedColumn,
})
