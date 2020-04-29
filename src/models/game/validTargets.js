import {combine} from 'effector'
import {$columns, $gameConfig, $pickedBall} from './state'


export const $validTargets = combine($gameConfig, $columns, $pickedBall, (config, columns, pickedBall) => {
  if (!pickedBall) return []

  return columns.filter((col, i) => (
    col.length === 0 || (
      col.length !== config.levels &&
      col[col.length - 1] === pickedBall.color &&
      i !== pickedBall.from
    )
  ))
})
