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
  //number of retry levels
  const [numberOfRetries, setNumberOfRetries] = useState<any>(5)
  //set the maximum number of retry level
  const [retryLevelLIMIT, setRetryLevelLimit] = useState<Number>(10);
  //retry types
  const [retryType, setRetryType] = useState<any>({
    fastRetry: true,
    timeout: false,
    batching: false,
  });
  //contains the number of messages that needs to be sent per second
  const [messagesPerSecond, setMessagesPerSecond] = useState<any>(1);
  //contains each retry level 
  const [timeoutLimitArray, setTimeoutLimitArray] = useState<Number[]>([1000, 2000, 4000, 8000, 16000]);
  const [batchLimitArray, setBatchLimitArray] = useState<Number[]>([6,6,6,6,6]);
  //Toggle visibility for retry option menu
  const [retryOptionToggle, setRetryOptionToggle] = useState<boolean>(false);

  //used by RadioButtonGroup component, changes the type of retry
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

  //used by start button, initilize the options to the backend
  const startHandler = () => {
    let options: any;
    if(retryType.fastRetry) options = {};
    else if(retryType.timeout) options = {timeoutLimit: [1000, 2000, 4000, 8000, 16000, 32000]};
    else options = {batchLimit: [6,6,6,6,6,6]}
    socket.sendEvent('start', {retries: numberOfRetries, options});
  }

  //stops the current session
  const endHandler = () => {
    socket.sendEvent('stop', {});
  }

  //set the number of messages sent
  const setMessagesPerSecondHandler = (event: any, rate: number) => {
    setMessagesPerSecond(rate);
    socket.sendEvent('set_rate', {rate});
  }

  //toggles visibility of the retry option menu
  const toggleRetryOptionContainer = () => {
    setRetryOptionToggle(!retryOptionToggle);
  }

  //updates the number of retrys
  const updateNumberOfRetriesHandler = (event) => {
    let value = event.target.value;
    if(value >= 0 && value <= retryLevelLIMIT)
    setNumberOfRetries(event.target.value);
    console.log(numberOfRetries);
    if(timeoutLimitArray.length > value){
      setTimeoutLimitArray(timeoutLimitArray.slice(0,value))
      setBatchLimitArray(batchLimitArray.slice(0,value))
    }
    else{
      for(let i = timeoutLimitArray.length; i < value; i++){
        timeoutLimitArray.push(5);
        batchLimitArray.push(5);
      }
    }
  }

  //updates the value of a retry level from the option menu
  const updateLimitArrayHandler = (event, index) => {
    if(retryType.timeout){
      setTimeoutLimitArray(() => {let copy = timeoutLimitArray; copy[index] = parseInt(event.target.value); return copy})
    }
    if(retryType.batching) {
      setBatchLimitArray(() => {let copy = batchLimitArray; copy[index] = parseInt(event.target.value); return copy})
    }
  }

  //used to pick which type of retry level option to display
  let retryLevels:any[] = [];
  //contains rows for each retry level for timeout option
  let timeoutRetryLevel = [];
  //contains rows for each retry level for batching option
  let batchRetryLevel = [];

  //constructs each component rows for timeout and batching
  for(let i = 0; i < numberOfRetries; i++){
    timeoutRetryLevel.push(
      <RetryLevelTextField key={`${i}RetryLevelTimeout`} index={i} value={timeoutLimitArray} updateLimitArrayHandler={updateLimitArrayHandler} />
    )
    batchRetryLevel.push(
      <RetryLevelTextField key={`${i}RetryLevelBatch`} index={i} value={batchLimitArray} updateLimitArrayHandler={updateLimitArrayHandler} />
    )
  }

  //handles setting the correct retry level rows inside of retryLevels
  if(!retryType.fastRetry){
    if(retryType.timeout) retryLevels = timeoutRetryLevel;
    else retryLevels = batchRetryLevel;
  }
  else{
    retryLevels = [];
  }

  //container for retry level rows
  let retryLevelsContainer = <div></div>;
  //Makes retryLevelsContainer into a scrollable box if option is timeout or batching
  if(retryLevels.length) retryLevelsContainer = <div className='frame'>{retryLevels}</div>

  //Handles hidding and showing the option menu for retry level
  let retryOptionContainer = <div></div>;
  //if option button is clicked, retry options are added onto retryOptionContainer
  if(retryOptionToggle){
    retryOptionContainer = (
      <div className="retryOptionContainer">
        <div>
          <div className='numberOfRetriesContainer'>
            <TextField
              className='textField'
              id="filled-number"
              label="Number of Retries"
              type="number"
              fullWidth={true}
              InputLabelProps={{
                shrink: true,
              }}
              defaultValue = {numberOfRetries}
              inputProps={{ min: 0, max: retryLevelLIMIT}}
              onChange={updateNumberOfRetriesHandler}
              // onKeyPress = {(event) => {if(event.target.value > retryLevelLIMIT) event.target.blur()}}
            />
          </div>
          <RadioButtonGroup retryType={retryType} setRetryType={setRetryType} handleChange={handleChange}/>
        </div>
        <div className='frameContainer'>
          {retryLevelsContainer}
        </div>
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