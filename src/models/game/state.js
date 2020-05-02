import {combine, createStore, sample} from 'effector'
import {newGame} from './index'


const RETRY_COUNT = 10
export const DIFFICULTY = 2000
export const COLS = 14
export const EMPTY_COLS = 2
export const LEVELS = 4

export const $id = createStore(0)
export const $steps = createStore(DIFFICULTY)
export const $cols = createStore(COLS)
export const $emptyCols = createStore(EMPTY_COLS)
export const $levels = createStore(LEVELS)
export const $gameConfig = combine({
  id: $id,
  cols: $cols,
  emptyCols: $emptyCols,
  levels: $levels,
  steps: $steps,
})

function getColors(colorsCount, levels) {
  return Array.from(Array(colorsCount * levels))
    .map((_, color) => color % colorsCount)
}

function createEmptyColumns(cols) {
  return Array.from(Array(cols)).map(() => [])
}

function initColumns(cols, emptyCols, levels, colors) {
  const columns = createEmptyColumns(cols)

  for (let lvl = 0; lvl < levels; ++lvl) {
    for (let column of columns.slice(0, -emptyCols)) {
      const color = colors.pop()
      if (typeof color !== 'undefined') {
        column.push({column, level: lvl, color, step: -1})
      } else {
        break
      }
    }
  }

  return columns
}

export const $mixed = createStore([])

export const $columns = $gameConfig.map(config => {
  const {cols, levels, emptyCols, steps} = config
  const colorsCount = cols - emptyCols
  const colors = getColors(colorsCount, levels)

  return initColumns(cols, emptyCols, levels, colors)
})

sample({
  source: $gameConfig,
  clock: newGame,
  target: $columns,
  fn: (config) => {
    const {cols, levels, emptyCols, steps} = config
    const colorsCount = cols - emptyCols

    const isFull = (arr) => arr.length === levels
    const isEmpty = (arr) => arr.length === 0
    const isNotEmpty = (arr) => arr.length > 0
    const last = (arr, n = 0) => arr[arr.length - 1 - n]

    const getWithout = (cols, col) => cols.filter(c => c !== col)
    const getCols = (cols, callback) => cols.filter(c => callback(c))

    const findCol = (cols, callback) => cols.find(c => callback(c))

    const findSource = (cols, dest) => findCol(cols, c => {
      // берем верхний шар из колонки
      const srcTop = last(c)
      // берем шар под посдедним
      const srcUnderTop = last(c, 1)
      // смотрим что лежит в таргете
      const destTop = last(dest)
      // console.log('TOP', destTop)

      // если колонка назначения пустая то все ок
      if (!destTop) return true

      // console.log('*****', srcTop.column, dest, srcTop.level, dest.length)
      return (
        // если шар тут уже был исключаем его
        (srcTop.column !== dest && srcTop.level !== dest.length)
        // если под верхним шаром ничего нет или такой же цвет то можно брать
        && (!srcUnderTop || srcTop.color === srcUnderTop.color)
      )
    })

    const move = (from, to, step) => {
      const src = from.pop()
      src.column = from
      src.level = from.length - 1
      src.step = step
      to.push(src)
    }

    let lastTarget = null

    const resort = (cols) => {
      const newCols = [...cols]
      for (let c = 0; c < newCols.length; c++) {
        const rnd = Math.trunc(Math.random() * newCols.length)
        if (rnd !== c) {
          const tmp = newCols[c]
          newCols[c] = newCols[rnd]
          newCols[rnd] = tmp
        }
      }
      return newCols
    }

    const getSum = (col) => col.reduce((acc, item) => acc + item.step, 0)

    let retryIndex = 0
    let emptyCount = 0
    let columns
    const variants = []

    const clone = (cols) => cols.reduce((acc, col) => {
      return [...acc, col.map(item => item.color)]
    }, []).sort((a, b) => b.length - a.length)

    let noSource
    do {
      let i = 0
      noSource = false
      const colors = getColors(colorsCount, levels)
      columns = initColumns(cols, emptyCols, levels, colors)

      while (i < steps) {
        for (let dest of resort(columns)) {
          if (isFull(dest)) continue

          const rest = getWithout(columns, dest).filter(isNotEmpty)
          const rndCols = resort(rest)
          let byMinSteps = [...rndCols].sort((a, b) => last(a).step - last(b).step)
          let byMaxSteps = [...rndCols].sort((a, b) => last(b).step - last(a).step)
          let byMinCount = [...rndCols].sort((a, b) => a.length - b.length)
          let byMaxCount = [...rndCols].sort((a, b) => b.length - a.length)
          let src

          src = byMaxSteps
          if (i > 200) src = byMaxCount
          if (i > 250) src = byMinSteps

          if (isEmpty(dest)) {
            src = src.filter(c => c.length > 1)
            // console.log('dest', dest.length, src.length)
            if (isEmpty(src)) {
              noSource = true
              continue
            }
          }

          src = findSource(src, dest)
          if (!src) {
            noSource = true
            continue
          }

          noSource = false
          move(src, dest, i)
          lastTarget = dest
          break
        }
        if (noSource) break
        emptyCount = getCols(columns, isEmpty).length
        if (i > steps - steps / 10 && emptyCount === 2) break
        i++
      }
      console.log('shuffle iteration count:', i, noSource)
      variants.push({n: i, columns: clone(columns)})
    }
    while (++retryIndex < RETRY_COUNT)

    // $mixed.setState(mixed)
    variants.sort((a, b) => b.n - a.n)
    return variants[0].columns
  },
})

export const $pickedBall = createStore(null)
export const $noPicked = $pickedBall.map(val => !val)
export const $selectedColumn = createStore([])
