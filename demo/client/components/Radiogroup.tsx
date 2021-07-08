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
  const [retryType, setRetryType] = React.useState<object>({
    fastRetry: true,
    timeout: false,
    batching: false,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    // setRetryType((event.target as HTMLInputElement).value);
    let newRetryType = {...retryType};
    newRetryType = {
      fastRetry: false,
      timeout: false,
      batching: false,
    }
    newRetryType[(event.target as HTMLInputElement).value] = true;
    setRetryType(newRetryType);
  };

  return(
    <FormControl component="fieldset">
      <FormLabel component="legend">Retry Strategy</FormLabel>
      <RadioGroup
        aria-label="Retry Strategy"
        name="retryStrategy"
        value={retryType}
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
  );

}