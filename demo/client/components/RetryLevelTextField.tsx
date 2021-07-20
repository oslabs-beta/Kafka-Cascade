import React, {FC, useState, useEffect} from 'react';
import TextField from '@material-ui/core/TextField';
import Box from "@material-ui/core/Box";

export const RetryLevelTextField: FC<any> = (props:any) => {
  return (
    <Box m={1}>
      <TextField
          className='textField'
          id="filled-number"
          label={`Retry ${props.index + 1}`}
          type="number"
          variant="outlined"
          InputLabelProps={{
            shrink: true,
          }}
          defaultValue = {props.value[props.index]}
          //prevents value change when scroll wheeling
          onChange= {(event) => {props.updateLimitArrayHandler(event, props.index)}}
          onWheel={event => {event.target.blur()}}
        />
    </Box>
  )
}