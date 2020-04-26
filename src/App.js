import React from 'react'
import './App.css'
import {$columns, $pickedBall} from './models/game/state'
import {useStore} from 'effector-react'
import {newGame, selectColumn} from './models/game'


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
         border: colorIndex === -1 ? '1px solid transparent' : '1px solid white'
       }}
  />
)

function App() {
  const columns = useStore($columns)
  const {from, color} = useStore($pickedBall) || {}
  console.log($pickedBall.getState())
  return (
    <div className="App">
      <button className="btn" onClick={newGame}>New Game</button>
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
    </div>
  )
}

export default App
