import {combine} from 'effector'
import {$history, $historyPos} from './undo'
import {$columns, $pickedBall} from './state'
import {paste} from './index'
import {$moves} from './moves'


const url = new URL(window.location)
const state = url.pathname.slice(1)
if (state) {
  try {
    console.log(atob(state))
    paste(JSON.parse(atob(state)))
  } catch(e) {
    alert(e.message)
  }

  combine(
    $history, $historyPos, $columns, $pickedBall, $moves
    // ([history, historyPos, columns, pickedBall]) => ({
    //   history, historyPos, columns, pickedBall
    // })
  ).watch(([history, historyPos, columns, pickedBall, moves]) => {
    const json = JSON.stringify({
      history, historyPos, columns, pickedBall, moves
    }, null, 0)
    window.history.replaceState({
      history, historyPos, columns, pickedBall, moves
    }, null, btoa(json))
  })
}
