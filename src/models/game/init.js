import {merge, sample, split} from 'effector'
import {$columns, $gameConfig, $id, $noPicked, $pickedBall, $selectedColumn} from './state'
import {newGame, paste, selectColumn} from './index'
import {updateCol} from './helpers'


$id.on(newGame, id => id + 1)
$pickedBall.reset(newGame)

const stream = sample({
  clock: selectColumn,
  source: {columns: $columns, pickedBall: $pickedBall, noPicked: $noPicked, config: $gameConfig},
  fn: (stores, selected) => ({...stores, selected}),
})

export const {pick, unpick, put} = split(stream, {
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
  // repick: ({pickedBall}) => !!pickedBall,
})

// repick.watch(({pickedBall, selected}) => {
//   if (!pickedBall) return
//   selectColumn(pickedBall.from)
//   selectColumn(selected)
// })

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
  .on(paste, (_, data) => data.columns)

sample({
  source: [$columns, $pickedBall],
  clock: unpick,
  fn: ([cols, picked]) => {
    if (!picked) return
    return updateCol(cols, picked.from, col => {
      col.push(picked.color)
    })
  },
  target: $columns,
})

$pickedBall
  .on(pick, (_, {selected, columns}) => ({
    from: selected,
    color: columns[selected][columns[selected].length - 1],
  }))
  .on(paste, (_, data) => data.pickedBall)

sample({
  source: merge([unpick, put]),
  fn: () => null,
  target: $pickedBall,
})


// save selected column
sample({
  clock: selectColumn,
  source: $columns,
  fn: (cols, selected) => cols[selected],
  target: $selectedColumn,
})

newGame.watch(() => {
  window.history.replaceState({}, null, '/')
})

const url = new URL(window.location)
const state = url.searchParams.get('state')
if (state) {
  try {
    paste(JSON.parse(state))
  } catch(e) {
    alert(e.message)
  }
}
