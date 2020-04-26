import {createStore, combine} from 'effector'


export const COLS = 14
export const EMPTY_COLS = 2
export const LEVELS = 4

export const $id = createStore(0)
export const $cols = createStore(COLS)
export const $emptyCols = createStore(EMPTY_COLS)
export const $levels = createStore(LEVELS)
export const $gameConfig = combine({
  id: $id,
  cols: $cols,
  emptyCols: $emptyCols,
  levels: $levels,
})

export const $columns = $gameConfig.map(config => {
  const {cols, levels, emptyCols} = config
  const colorsCount = cols - emptyCols
  const colors = Array.from(Array(colorsCount * levels))
    .map((_, color) => color % colorsCount)
    .reduce((acc, color) => {
      acc.push(color)
      const i1 = Math.trunc(Math.random() * acc.length)
      const i2 = Math.trunc(Math.random() * acc.length)
      const [a, b] = [acc[i1], acc[i2]]
      acc[i1] = b
      acc[i2] = a
      return acc
    }, [])
  const columns = Array.from(Array(cols)).map(() => [])
  columns.forEach(col => {
    for(let lvl = 0; lvl < levels; ++lvl) {
      const color = colors.pop()
      if (typeof color !== 'undefined') {
        col.push(color)
      }
    }
  })
  return columns
})

// {
//  from: column number,
//  color: ball color
// }
export const $pickedBall = createStore(null)
export const $noPicked = $pickedBall.map(val => !val)

/**
 * undo history
 * [{from, to}, ...]
 */
export const $history = createStore([])
export const $historyPos = createStore(0)

window.$columns = $columns
