import { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import MultiRangeSlider from "multi-range-slider-react";
import { sub, format, eachMonthOfInterval, eachWeekOfInterval, eachDayOfInterval, intervalToDuration } from 'date-fns' 


const MovementsHistory = (props) => {
    const rawdata = props.data;
    const initialStart = sub(new Date(), {days: 90});
    const initialEnd = new Date();
    const initialMin = new Date(rawdata.minDate);
    const initialMax = new Date(rawdata.maxDate);

    const nSteps = 100;
    const [step] = useState((initialMax - initialMin)/nSteps);

    const initialInterval = {start: initialMin, end: initialMax};
    const initialDuration = intervalToDuration(initialInterval);
    let eachFunction = null;
    let formatPattern = "P";
    if(initialDuration.years > 0){
      eachFunction = eachMonthOfInterval;
      formatPattern = "MMM yyyy";
    }else if(initialDuration.months > 0){
      eachFunction = eachWeekOfInterval;
      formatPattern = "DD MMM yyyy";
    }else{
      eachFunction = eachDayOfInterval;
      formatPattern = "DD MMM";
    }
    let _labels = eachFunction(initialInterval).map((date)=>{return format(date, formatPattern);});
    let labels;
    const multiples = parseInt(_labels.length/10);
    if(multiples>1){ // 20 or more
      labels = _labels.filter((label, index)=> index % multiples == 0 );
    }else{
      labels = _labels;
    }
    const baselineData = rawdata.baseline?? null;

    let data;
    if(baselineData){
        const baselineVal = baselineData[1];
        let cumulative = baselineVal;
        data = [];
        for(let i=rawdata.movements.length-1; i>0; i--){ // reverse
            const movement = rawdata.movements[i];
            cumulative += movement.abs_amount * movement.category.direction;
            data.push({"date": (new Date(movement.date)).getTime(), "cumulative": cumulative})
        }
    }
    const slicedData = (changeResult) => {
      const minPercent = (changeResult.minValue - changeResult.min) / (changeResult.max - changeResult.min);
      const maxPercent = (changeResult.maxValue - changeResult.min) / (changeResult.max - changeResult.min);
      const startIdx = parseInt(minPercent * data.length);
      const endIdx = parseInt(maxPercent * data.length);
      return data.slice(startIdx, endIdx);
    }
    const [currentChange, setCurrentChange] = useState({min: initialMin, max: initialMax, minValue: initialStart, maxValue: initialEnd});

    const handleInput = (changeResult) => {
      if(changeResult.minValue != currentChange.minValue || changeResult.maxValue != currentChange.maxValue)
        setCurrentChange(changeResult);
    };
    
    
    return (
      <>
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={slicedData(currentChange)}>
                <Line type="stepAfter" dataKey="cumulative" stroke="#8884d8" dot={false} />
                <XAxis 
                    type='number' 
                    dataKey="date"  
                    domain={[currentChange.minValue, currentChange.maxValue]} 
                    // domain={["auto", "auto"]} 
                    tickFormatter={tick => (new Date(tick)).toLocaleDateString()}
                    tickCount="10" />
                <YAxis domain={["auto", "auto"]}/> 
                <Tooltip 
                    active={true} 
                    formatter={(value) => `${parseFloat(value).toFixed(2)} €`}
                    labelFormatter={(timestamp) => (new Date(timestamp)).toLocaleDateString()} />
            </LineChart>
        </ResponsiveContainer>
        <MultiRangeSlider 
            min={initialMin}
            max={initialMax}
            step={step}
            minValue={currentChange.minValue}
            maxValue={currentChange.maxValue}
            minCaption={format(new Date(currentChange.minValue), "P")}
            maxCaption={format(new Date(currentChange.maxValue), "P")}
            ruler={false}
            onInput={(e)=>{
              handleInput(e);
            }}
            labels={labels}
        />
      </>
    )
}

export default MovementsHistory