import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

const MovementsHistory = ({data}) => {
    // const baselineData = data.baseline?? null;
    // const minDate = data.minDate;
    // const maxDate = data.maxDate;
    // let data = [];
    // const plotStats = {
    //   nMovements: 0,
    //   minDate: minDate,
    //   maxDate: maxDate,
    //   maxCumulative: 0,
    //   minCumulative: 0,
    //   incomes: 0,
    //   outcomes: 0,
    //   savingRate: () => {return self.outcomes != 0 ? (self.incomes-self.outcomes)/self.outcomes : 0},
    //   nDays: () => {return intervalToDuration({start:self.maxDate, end: self.minDate}).days}
    // }
    // if(baselineData){
    //   let maxIdx = data.movements.length - 1;
    //   if(slice){
    //     plotStats.minDate = max([minDate, slice[0]]);
    //     plotStats.maxDate = min([maxDate, slice[1]]);
    //   }
    //   const baselineVal = baselineData[1];
    //   let cumulative = baselineVal;
      
    //   for(let i=maxIdx; i>0; i--){
    //     const movement = data.movements[i];
    //     const mDate = new Date(movement.date);
    //     cumulative += movement.abs_amount * movement.category.direction;
    //     plotStats.maxCumulative = Math.max(cumulative, plotStats.maxCumulative);
    //     plotStats.minCumulative = Math.min(cumulative, plotStats.minCumulative);
    //     if(mDate < plotStats.minDate) continue;
    //     if(mDate > plotStats.maxDate) continue;
    //     data.push({"date": (mDate).getTime(), "cumulative": cumulative});
    //   }
    //   plotStats.nMovements = data.length;
    // }
    // if(plotUpdated){
    //   plotUpdated(plotStats);
    // }
    return (
      <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data?.data?? []}>
              <Line type="stepAfter" dataKey="cumulative" stroke="#8884d8" dot={false} />
              <XAxis 
                  type='number' 
                  dataKey="date"  
                  domain={[data?.minDate, data?.maxDate]} 
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
    )
}

export default MovementsHistory