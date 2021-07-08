import React, { FC, useState } from 'react';
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@material-ui/core";

interface RadioButtonGroupProps {
  
}

interface RadioButtonGroupState {
  retryType: {
    fastRetry: boolean,
    timeout: boolean,
    batching: boolean,
  },
}

// import socket from '../socket';

// socket.sendEvent('start', {})

export const RadioButtonGroup: FC<any> = (props:any) => {

  const {retryType, setRetryType} = props;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    let newRetryType = {...retryType};
    newRetryType = {
      fastRetry: false,
      timeout: false,
      batching: false,
    }
    newRetryType[(event.target as HTMLInputElement).value] = true;
    setRetryType(newRetryType);
  };

  let buttonValue = '';

  for (const key in retryType) {
    if (retryType[key]) buttonValue = key;
  }

  return(
    <div className='radioGroup'>
      <FormControl component="fieldset">
        <FormLabel component="legend">Retry Strategy</FormLabel>
        <RadioGroup
          aria-label="Retry Strategy"
          name="retryStrategy"
          value={buttonValue}
          onChange={handleChange}
        >
          <FormControlLabel
            value="fastRetry"
            control={<Radio />}
            label="Fast Retry" />
          <FormControlLabel
            value="timeout"
            control={<Radio />}
            label="Timeout"
          />
          <FormControlLabel
            value="batching"
            control={<Radio />}
            label="Batching"
          />
        </RadioGroup>
      </FormControl>
    </div>
  );

}