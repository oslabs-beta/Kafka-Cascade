import React, {FC, useState, useEffect} from 'react';
import TextField from '@material-ui/core/TextField';

export const RetryLevelTextField: FC<any> = (props:any) => {
  return (
    <TextField
        className='textField'
        id="filled-number"
        label={`Retry ${props.index + 1}`}
        type="number"
        InputLabelProps={{
          shrink: true,
        }}
        defaultValue = {props.value[props.index]}
        //prevents value change when scroll wheeling
        onChange= {(event) => {props.updateLimitArrayHandler(event, props.index)}}
        onWheel={event => {event.target.blur()}}
      />
  )
}