import React, {useEffect, useRef, useState} from 'react'
import cn from 'classnames'
import './App.css'
import {$columns, $gameConfig, $pickedBall} from './models/game/state'
import {useStore} from 'effector-react'
import {newGame, selectColumn} from './models/game'
import {$historyPos, undo, redo} from './models/game/undo'
import {$moves} from './models/game/moves'
import {$validTargets} from './models/game/validTargets'
import {$gameOver} from './models/game/gameOver'
import {GameOver} from './GameOver'
import * as firebase from 'firebase'
import * as firebaseui from 'firebaseui'


// console.log(ui)

const firebaseConfig = {
  apiKey: 'AIzaSyDMXPHm_YS0FnQcjsdXerR1gj1lN0sG6Ww',
  authDomain: 'ballcraft-a61cb.firebaseapp.com',
  databaseURL: 'https://ballcraft-a61cb.firebaseio.com',
  projectId: 'ballcraft-a61cb',
  storageBucket: 'ballcraft-a61cb.appspot.com',
  messagingSenderId: '426907411213',
  appId: '1:426907411213:web:0c60273203bc70d69e8644',
  measurementId: 'G-SNCMNHXPH0',
}
// Initialize Firebase
firebase.initializeApp(firebaseConfig)
firebase.analytics()

// const ui = new firebaseui.auth.AuthUI(firebase.auth())
// ui.start('#firebaseui-auth-container', {
//   signInOptions: [
//     firebase.auth.GithubAuthProvider.PROVIDER_ID,
//     firebase.auth.FacebookAuthProvider.PROVIDER_ID,
//   ],
// })
// console.log(firebase, firebaseui)
// window.firebase = firebase
// window.firebaseui = firebaseui

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

const Ball = ({colorIndex, onMouseDown, children, style}) => (
  <div className="ball"
       onMouseDown={onMouseDown}
       style={{
         backgroundColor: colorIndex === -1 ? 'transparent' : palette[colorIndex],
         border: colorIndex === -1 ? '1px solid transparent' : '1px solid white',
         ...style,
       }}
  >
    {children}
  </div>
)

let touch = false
const ignore = e => {
  e.preventDefault()
  e.stopPropagation()
  touch = true
}

function App() {
  const gameOver = useStore($gameOver)
  const moves = useStore($moves)
  const columns = useStore($columns)
  const validTargets = useStore($validTargets)
  const pickedBall = useStore($pickedBall)
  const [showGameOver, setShowGameOver] = useState(false)
  const {from, color} = pickedBall || {}

  useEffect(() => {
    if (gameOver) {
      setShowGameOver(true)
    } else {
      setShowGameOver(false)
    }
  }, [gameOver, moves])

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
        {columns.map((column, cid) => (
          <div key={cid}
               onTouchStart={(e) => {
                 e.preventDefault()
                 e.stopPropagation()
                 touch = true
                 selectColumn(cid)
               }}
               onMouseDown={(e) => {
                 e.preventDefault()
                 e.stopPropagation()
                 !touch && selectColumn(cid)
               }}
          >
            <Ball colorIndex={from === cid ? color : -1} />
            <div className={cn('column', {valid: validTargets.includes(column)})}>
              {column.map((_, bid) => {
                // console.log(bid, _, column.length, mixed[cid].length)
                return (
                  <Ball key={bid}
                        colorIndex={column[column.length - bid - 1]}
                        style={{color: 'black', fontWeight: 'bold'}}
                  >
                    {/*{mixed[cid][column.length - bid - 1]?.step}*/}
                  </Ball>
                )
              })}
            </div>
          </div>
        ))}

        <GameOver show={showGameOver}
                  moves={moves}
                  onClick={() => setShowGameOver(false)}
        />
      </div>

      <div className='actions' style={{marginTop: 10}}>
        <a href="https://github.com/kobzarvs/effector-craftball"
           target="_blank"
           rel="noopener noreferrer"
        >
          GitHub source code
        </a>
        <a href="https://github.com/zerobias/effector"
           target="_blank"
           rel="noopener noreferrer"
        >
          Powered by effector
        </a>
      </div>
      <div className='actions' style={{marginTop: -10}}>
        <a href="https://t.me/ValeryKobzar">
          Created by Valery Kobzar
        </a>
      </div>
    </div>
  )
}

export default App
