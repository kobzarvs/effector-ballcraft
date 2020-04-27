import React, {useEffect, useRef, useState} from 'react'
import './App.css'
import {$columns, $pickedBall} from './models/game/state'
import {useStore} from 'effector-react'
import {newGame, paste, redo, selectColumn, undo} from './models/game'
import {$history, $historyPos} from './models/game/undo'


const palette = [
  'red',
  'darkgreen',
  'blue',
  'orange',
  'cyan',
  'pink',
  'lime',
  'lightblue',
  'brown',
  'yellow',
  'gray',
  'purple',
]

const Ball = ({colorIndex}) => (
  <div className="ball"
       style={{
         backgroundColor: colorIndex === -1 ? 'transparent' : palette[colorIndex],
         border: colorIndex === -1 ? '1px solid transparent' : '1px solid white',
       }}
  />
)

function App() {
  const columns = useStore($columns)
  const pickedBall = useStore($pickedBall)
  const {from, color} = pickedBall || {}
  const [state, setState] = useState('')
  const [error, setError] = useState('')
  const [withHistory, setWithHistory] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    setError('')
    const data = {columns, pickedBall}
    if (withHistory) {
      data.history = $history.getState()
      data.historyPos = $historyPos.getState()
    }
    setState(JSON.stringify(data))
  }, [columns, pickedBall, withHistory])

  const copy = () => {
    ref.current.select()
    document.execCommand('copy')
  }

  const apply = () => {
    let data = {}
    try {
      data = JSON.parse(ref.current.value)
    } catch (e) {
      setError(e.message)
    }
    paste(data)
  }

  const handleCheck = e => setWithHistory(e.target.checked)

  return (
    <div className="App">
      <div className="actions" style={{justifyContent: 'space-between'}}>
        <button className="btn" onClick={newGame}>New Game</button>
        <div>
          <button className="btn" onClick={undo}>Undo</button>
          <button className="btn" onClick={redo}>Redo</button>
        </div>
      </div>
      <div className="game-field">
        {columns.map((column, idx) => (
          <div key={idx}>
            <Ball colorIndex={from === idx ? color : -1} />
            <div className="column" onClick={() => selectColumn(idx)}>
              {column.map((_, idx) => (
                <Ball key={idx} colorIndex={column[column.length - idx - 1]} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{width: '100%'}}>
        <label className="label">
          <input type="checkbox"
                 value={withHistory}
                 onChange={handleCheck}
          />
          State includes history
        </label>
      </div>
      <textarea id="state"
                ref={ref}
                value={state}
                onChange={e => setState(e.target.value)}
      />
      {error && <div className="error">{error}</div>}
      <div className="actions" style={{marginTop: 5}}>
        <button className="btn" onClick={copy}>Copy to clipboard</button>
        <button className="btn" onClick={apply}>Apply</button>
      </div>
    </div>
  )
}

export default App
