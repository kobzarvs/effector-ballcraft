import {combine} from 'effector'
import {$columns, $gameConfig} from './state'
import {$moves} from './moves'


export const $gameOver = combine($columns, $gameConfig, $moves, (cols, config, moves) => {
  const nonEmptyCols = cols.filter(c => c.length !== 0)
  if (nonEmptyCols.length + config.emptyCols !== config.cols) {
    return false
  }
  return moves > 0 && nonEmptyCols.every(c => c.length === config.levels && c.every(b => b === c[0]))
})
