import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';


const MovementsHistory = ({data, slice}) => {
    const baselineData = data.baseline?? null;
    let _chartData = [], chartData = _chartData;
    if(baselineData){
      let maxIdx = data.movements.length - 1;
      let start = 0;
      let end = maxIdx;
      if(slice){
        start = Math.max(0, slice[0]);
        end = Math.min(maxIdx, slice[1]);
      }

      const baselineVal = baselineData[1];
      let cumulative = baselineVal;

      for(let i=maxIdx; i>maxIdx-end; i--){ // reverse, already slicing the tail (stop at 'start', not 0)
          const movement = data.movements[i];
          cumulative += movement.abs_amount * movement.category.direction;
          _chartData.push({"date": (new Date(movement.date)).getTime(), "cumulative": cumulative})
      }
      chartData = _chartData.slice(start);
    }
    
    return (
      <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
              <Line type="stepAfter" dataKey="cumulative" stroke="#8884d8" dot={false} />
              <XAxis 
                  type='number' 
                  dataKey="date"  
                  // domain={[currentChange.minValue, currentChange.maxValue]} 
                  domain={["auto", "auto"]} 
                  tickFormatter={tick => (new Date(tick)).toLocaleDateString()}
                  tickCount="10" />
              <YAxis domain={["auto", "auto"]}/> 
              <Tooltip 
                  active={true} 
                  formatter={(value) => `${parseFloat(value).toFixed(2)} €`}
                  labelFormatter={(timestamp) => (new Date(timestamp)).toLocaleDateString()} />
          </LineChart>
      </ResponsiveContainer>
    )
}

export default MovementsHistory