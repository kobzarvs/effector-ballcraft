import React, {useEffect, useRef, useState} from 'react'
import './App.css'
import {$columns, $pickedBall} from './models/game/state'
import {useStore} from 'effector-react'
import {newGame, paste, redo, selectColumn, undo} from './models/game'
import {$history, $historyPos} from './models/game/undo'
import {shortenUrl} from './models/game/helpers'


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

function App() {
  const columns = useStore($columns)
  const pickedBall = useStore($pickedBall)
  const {from, color} = pickedBall || {}
  const [state, setState] = useState('')
  const [error, setError] = useState('')
  const [withHistory, setWithHistory] = useState(true)
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

  const share = async () => {
    // const url = new URL(window.location.origin)
    // url.searchParams.append('state', state)
    const pathname = btoa(state)
    try {
      const url = await shortenUrl(`${window.location.origin}/${pathname}`)
      await navigator.share({
        title: 'Ballcraft sort puzzle',
        text: 'Try to resolve my puzzle',
        url,
      })
    } catch (e) {
      copy()
      alert('The state has been copied to clipboard')
    }
    window.history.replaceState(state, null, pathname)
  }

  return (
    <div id="top" className="App" onTouchStart={ignore}>
      <div className="actions" style={{justifyContent: 'space-between'}}>
        <button className="btn" onClick={newGame}>New</button>
        {('share' in navigator) && <button className="btn" onClick={share}>Share</button>}
        <div>
          <button className="btn" onClick={undo} onTouchStart={ignore}>Undo</button>
          <button className="btn" onClick={redo} onTouchStart={ignore}>Redo</button>
        </div>
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

      <div id="share" style={{width: '100%'}}>
        <label className="label">
          <input type="checkbox"
                 checked={withHistory}
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
        <a href="#top">
          <button className="btn">Back</button>
        </a>
        <button className="btn" onClick={apply}>Apply</button>
      </div>
    </div>
  )
}

export default App
