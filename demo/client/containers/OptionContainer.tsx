import React, {FC, useState} from 'react';
import { RadioButtonGroup } from '../components/RadioButtonGroup';
import { MessageSlider } from '../components/MessageSlider';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import socket from '../socket';
import { RetryLevelTextField } from '../components/RetryLevelTextField';


import './OptionContainer.scss';
import { colors } from '@material-ui/core';

export const OptionContainer: FC<any> = (props:any) => {
  const [numberOfRetries, setNumberOfRetries] = useState<any>(5)
  const [retryType, setRetryType] = useState<any>({
    fastRetry: true,
    timeout: false,
    batching: false,
  });
  const [messagesPerSecond, setMessagesPerSecond] = useState<any>(1);
  //contains each retry level 
  const [retryOptionToggle, setRetryOptionToggle] = useState<boolean>(false);
  const [timeoutLimitArray, setTimeoutLimitArray] = useState<Number[]>([1000, 2000, 4000, 8000, 16000]);
  const [batchLimitArray, setBatchLimitArray] = useState<Number[]>([6,6,6,6,6]);

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

  const startHandler = () => {
    let options: any;
    if(retryType.fastRetry) options = {};
    else if(retryType.timeout) options = {timeoutLimit: [1000, 2000, 4000, 8000, 16000, 32000]};
    else options = {batchLimit: [6,6,6,6,6,6]}
    socket.sendEvent('start', {retries: numberOfRetries, options});
  }

  const endHandler = () => {
    socket.sendEvent('stop', {});
  }

  const setMessagesPerSecondHandler = (event: any, rate: number) => {
    setMessagesPerSecond(rate);
    socket.sendEvent('set_rate', {rate});
  }

  const toggleRetryOptionContainer = () => {
    setRetryOptionToggle(!retryOptionToggle);
  }

  const updateLimitArrayHandler = (event, index) => {
    if(retryType.timeout){
      setTimeoutLimitArray(() => {let copy = timeoutLimitArray; copy[index] = parseInt(event.target.value); return copy})
    }
    if(retryType.batching) {
      setBatchLimitArray(() => {let copy = batchLimitArray; copy[index] = parseInt(event.target.value); return copy})
    }
  }

  let retryLevels:any[] = [];
  let timeoutRetryLevel = [];
  let batchRetryLevel = [];

  if(!retryType.fastRetry){

    for(let i = 0; i < numberOfRetries; i++){
      timeoutRetryLevel.push(
        <RetryLevelTextField key={`${i}RetryLevelTimeout`} index={i} value={timeoutLimitArray} updateLimitArrayHandler={updateLimitArrayHandler} />
      )
      batchRetryLevel.push(
        <RetryLevelTextField key={`${i}RetryLevelBatch`} index={i} value={batchLimitArray} updateLimitArrayHandler={updateLimitArrayHandler} />
      )
    }
  }
  if(!retryType.fastRetry){
    if(retryType.timeout) retryLevels = timeoutRetryLevel;
    else retryLevels = batchRetryLevel;
  }
  else{
    retryLevels = [];
  }

  let retryLevelsContainer = <div></div>;
  if(retryLevels.length) retryLevelsContainer = <div className='frame'>{retryLevels}</div>

  let retryOptionContainer = <div></div>;
  if(retryOptionToggle){
    retryOptionContainer = (
      <div className="retryOptionContainer">
        <div>
          <TextField
            className='textField'
            id="filled-number"
            label="Number of Retries"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <RadioButtonGroup retryType={retryType} setRetryType={setRetryType} handleChange={handleChange}/>
        </div>
        {retryLevelsContainer}
      </div>
    )
  }

  return (
    <div className='optionContainer'>
      <div className='buttonsContainer'>
        <Box m={2}>
          <Button
            className='startButton'
            variant="contained"
            color="primary"
            onClick={startHandler}
            >Start
          </Button>
        </Box>
        <Box m={2}>
          <Button
            className='resetButton'
            variant="contained"
            color="secondary"
            onClick={endHandler}
            >Reset
          </Button>
        </Box>
        <Box m={2}>
          <Button
            className='optionButton'
            variant="contained"
            color="secondary"
            onClick={toggleRetryOptionContainer}
            >Option
          </Button>
        </Box>
        {/* <div className='spacer'></div> */}
      </div>
      {retryOptionContainer}
      <div className='messageSliderContainer'>
        <MessageSlider messagesPerSecond={messagesPerSecond} setMessagesPerSecondHandler={setMessagesPerSecondHandler}/>
      </div>
    </div>
  )
}