import { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import MultiRangeSlider from "multi-range-slider-react";
import { sub } from 'date-fns' 


const MovementsHistory = (props) => {
    const rawdata = props.data;
    const initialStart = sub(new Date(), {days: 90});
    const initialEnd = new Date();
    const initialMin = new Date(rawdata.minDate);
    const initialMax = new Date(rawdata.maxDate);

    const [timeRange] = useState([initialMin, initialMax]);
    const [step] = useState((initialMax - initialMin)/100);
    const [selectedInterval] = useState([initialStart, initialEnd]);

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
    const initialResult = {
      min: timeRange[0], max: timeRange[1], minValue: selectedInterval[0], maxValue: selectedInterval[1]
    };
    const initialShownData = slicedData(initialResult);
    const [shownData, setShownData] = useState(initialShownData);

    const handleInput = (changeResult) => {
    //   setSelectedTimeInterval([new Date(changeResult.minValue), new Date(changeResult.maxValue)]);
      setShownData(slicedData(changeResult));
      // console.log(changeResult);
    };
    
    
    return (
      <>
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={shownData}>
                <Line type="stepAfter" dataKey="cumulative" stroke="#8884d8" dot={false} />
                <XAxis 
                    type='number' 
                    dataKey="date"  
                    // domain={selectedInterval} 
                    domain={["auto", "auto"]} 
                    tickFormatter={tick => (new Date(tick)).toLocaleDateString()}
                    tickCount="10" />
                <YAxis domain={["auto", "auto"]}/> 
                <Tooltip 
                    active={true} 
                    formatter={(value) => `${parseFloat(value).toFixed(2)} €`}
                    labelFormatter={(timestamp) => (new Date(timestamp)).toLocaleDateString()} />
                {/* <Brush dataKey="date" /> */}
            </LineChart>
        </ResponsiveContainer>
        <MultiRangeSlider 
            min={timeRange[0]}
            max={timeRange[1]}
            step={step}
            minValue={selectedInterval[0]}
            maxValue={selectedInterval[1]}
            ruler={false}
            onInput={(e)=>{
              handleInput(e);
            }}
        />
      </>
    )
}

export default MovementsHistory