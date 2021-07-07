import React, { FC, useState} from 'react';
import Slider from '@material-ui/core/Slider';

function valuetext(value: number) {
  return `${value}`;
}

export const MessageSlider: FC<any> = (props:any) => {
  const {messagesPerSecond, setMessagesPerSecondHandler} = props;
  //updates the number of messages per send
  // const numMessagesHandler = (event) => {
  //   console.log(event.target.value);
  //   setMessagesPerSecond(event.target.value);
  // }

  return(
    // <input type='range' min='1' max='30' value={messagesPerSecond} className='slider' onChange={numMessagesHandler}/>
    <Slider 
      value={1}
      getAriaValueText={valuetext}
      aria-labelledby="discrete-slider"
      valueLabelDisplay="auto"
      step={1}
      marks
      min={1}
      max={100}
      onChange={setMessagesPerSecondHandler}
    />
  )
}