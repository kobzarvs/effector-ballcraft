import React, {useEffect, useRef, useState} from 'react'
import './App.css'
import {$columns, $pickedBall} from './models/game/state'
import {useStore} from 'effector-react'
import {newGame, redo, selectColumn, save, load, undo} from './models/game'


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

  useEffect(() => {
    setState(JSON.stringify({columns, pickedBall}))
  }, [columns, pickedBall])

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
      <label htmlFor="state" style={{alignSelf: 'flex-start'}}>
        State
      </label>
      <textarea id="state"
                value={state}
                onChange={e => setState(e.target.value)}
      />
      <div className="actions" style={{alignSelf: 'flex-end'}}>
        <button className="btn">Copy to clipboard</button>
        <button className="btn">Apply</button>
      </div>
    </div>
  )
}

export default App
