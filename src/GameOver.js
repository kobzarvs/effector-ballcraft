import React from 'react'
import cn from 'classnames'


export const GameOver = ({show, moves, onClick}) => {
  return (
    <div className={cn('gameover', {show})} onClick={onClick}>
      <h2>Congratulation!</h2>
      <div>
        You result is {moves}!
      </div>
    </div>
  )
}
