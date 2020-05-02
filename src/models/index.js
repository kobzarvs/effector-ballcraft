import './game/init'
import './game/undo'
import './game/moves'
import './game/gameOver'
import './game/updateUrl'
import {newGame, paste} from './game'
import {$gameConfig} from './game/state'



try {
  const state = window.location.pathname.slice(1)
  if (!state) throw new Error('no state')

  const {cols, emptyCols, levels} = $gameConfig.getState()
  const maxColor = cols - emptyCols
  const _columns = state.split('-')

  if (_columns.length !== cols) throw new Error('format')

  const {total, maxCount} = _columns.reduce((acc, col) => {
    acc.total += col.length
    acc.maxCount = Math.max(col.length, acc.maxCount)
    return acc
  }, {total: 0, maxCount: 0})

  if (maxCount !== levels || total !== (cols - emptyCols) * levels) {
    throw new Error('format')
  }

  const colors = []
  const columns = _columns.map(c => {
    return c.split('').map(r => {
      const color = parseInt(r, 36)
      if (color < 0 || color > maxColor) throw new Error('invalid ball color')
      colors[color] = colors[color] || 0
      colors[color]++
      return color
    })
  })
  colors.forEach(count => {
    if (count !== levels) throw new Error('invalid colors count')
  })
  paste({columns})
} catch (e) {
  if (e.message !== 'format') {
    alert(e.message)
  }
  newGame()
}
