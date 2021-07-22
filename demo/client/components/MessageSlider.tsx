import React, { FC } from 'react';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';

function valuetext(value: number) {
  return `${value}`;
}

// updates the number of messages per second
export const MessageSlider: FC<any> = (props:any) => {
  const {messagesPerSecond, setMessagesPerSecondHandler} = props;

  return(
    <div>
      <Typography id="discrete-slider" gutterBottom>
        Messages per Second
      </Typography>
      <Slider 
        value={messagesPerSecond}
        getAriaValueText={valuetext}
        aria-labelledby="discrete-slider"
        valueLabelDisplay="auto"
        step={1}
        marks
        min={1}
        max={10}
        onChange={setMessagesPerSecondHandler}
      />
    </div>
  )
}