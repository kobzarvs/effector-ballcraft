import produce from 'immer'
import {sample, split} from 'effector'
import {$columns, $noPicked, $pickedBall, $gameConfig, $id} from './state'
import {newGame, selectColumn} from './index'


$id.on(newGame, id => id + 1)

const stream = sample({
  clock: selectColumn,
  source: {columns: $columns, pickedBall: $pickedBall, noPicked: $noPicked, config: $gameConfig},
  fn: (stores, selected) => ({...stores, selected}),
})

const {pick, unpick, put, __: repick} = split(stream, {
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
})

repick.watch(({pickedBall, selected}) => {
  if (!pickedBall) return
  selectColumn(pickedBall.from)
  selectColumn(selected)
})

$pickedBall
  .reset(unpick, put)
  .on(pick, (_, {selected, columns}) => ({
    from: selected,
    color: columns[selected][columns[selected].length - 1],
  }))

$columns
  .on(pick, produce((columns, {selected}) => {
    columns[selected].pop()
  }))
  .on(unpick, produce((columns, {pickedBall: {from, color}}) => {
    columns[from].push(color)
  }))
  .on(put, produce((columns, {pickedBall: {color}, selected}) => {
    columns[selected].push(color)
  }))
