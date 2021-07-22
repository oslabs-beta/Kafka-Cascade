import React, { FC } from 'react';
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Typography,
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

export const RadioButtonGroup: FC<any> = (props:any) => {

  const {retryType, setRetryType, handleChange} = props;

  let buttonValue = '';

  for (const key in retryType) {
    if (retryType[key]) buttonValue = key;
  }

  return(
    <div className='radioGroup'>
      <FormControl component="fieldset">
        <FormLabel component="legend"></FormLabel>
        <Typography color="textPrimary" gutterBottom>
          Retry Strategy
        </Typography>
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