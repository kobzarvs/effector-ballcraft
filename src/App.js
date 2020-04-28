import React, {useEffect, useRef, useState} from 'react'
import './App.css'
import {$columns, $pickedBall} from './models/game/state'
import {useStore} from 'effector-react'
import {newGame, paste, redo, selectColumn, undo} from './models/game'
import {$history, $historyPos} from './models/game/undo'
import {shortenUrl} from './models/game/helpers'
import {$moves} from './models/game/moves'


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

const Ball = ({colorIndex, onMouseDown}) => (
  <div className="ball"
       onMouseDown={onMouseDown}
       style={{
         backgroundColor: colorIndex === -1 ? 'transparent' : palette[colorIndex],
         border: colorIndex === -1 ? '1px solid transparent' : '1px solid white',
       }}
  />
)

let touch = false
const ignore = e => {
  e.preventDefault()
  e.stopPropagation()
  touch = true
}

let _url = ''

function App() {
  const moves = useStore($moves)
  const columns = useStore($columns)
  const pickedBall = useStore($pickedBall)
  const {from, color} = pickedBall || {}

  const copy = () => {
    const ta = document.createElement('textarea')
    ta.value = window.location.href
    document.body.appendChild(ta)
    ta.select()
    console.log(ta.value)
    document.execCommand('copy')
    document.body.removeChild(ta)
    alert('URL copied to clipboard')
  }

  const share = () => {
    navigator.share && navigator.share({
      title: 'Ballcraft sort puzzle',
      text: 'Try to resolve my puzzle',
      url: window.location.href,
    }).catch(error => alert(error))
  }

  return (
    <div id="top" className="App" onTouchStart={ignore}>
      <div className="actions" style={{justifyContent: 'space-between'}}>
        <button className="btn" onClick={newGame}>New</button>
        {navigator.share
          ? <button className="btn" onClick={share}>Share</button>
          : <button className="btn" onClick={copy}>Copy URL</button>
        }
        <div>
          <button className="btn" onClick={undo} onTouchStart={ignore}>Undo</button>
          <button className="btn" onClick={redo} onTouchStart={ignore}>Redo</button>
        </div>
      </div>

      <div className="moves">
        <div><span>Total moves</span> {moves}</div>
        <div><span>From start</span> {useStore($historyPos) + 1}</div>
      </div>

      <div className="game-field" onTouchStart={ignore}>
        {columns.map((column, idx) => (
          <div key={idx}
               onTouchStart={(e) => {
                 e.preventDefault()
                 e.stopPropagation()
                 touch = true
                 selectColumn(idx)
               }}
               onMouseDown={(e) => {
                 e.preventDefault()
                 e.stopPropagation()
                 !touch && selectColumn(idx)
               }}
          >
            <Ball colorIndex={from === idx ? color : -1} />
            <div className="column">
              {column.map((_, idx) => (
                <Ball key={idx} colorIndex={column[column.length - idx - 1]} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <a href="https://github.com/kobzarvs/effector-craftball"
         target="_blank"
         rel="noopener noreferrer"
      >
        GitHub source code
      </a>
    </div>
  )
}

export default App
