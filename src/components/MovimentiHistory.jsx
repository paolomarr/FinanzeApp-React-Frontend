import { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';


const MovementsHistory = (props) => {
    const rawdata = props.data;
    const [timeRange] = useState([(new Date(rawdata.minDate)).getTime(), (new Date(rawdata.maxDate)).getTime()]);
    const baselineData = rawdata.baseline?? null;
    let rawmovements = rawdata.movements.toReversed();
    
    let data;
    if(baselineData){
        // const baselineDate = new Date(baselineData[0]);
        const baselineVal = baselineData[1];
        let cumulative = baselineVal;
        data = rawmovements.map((movement) => {
            cumulative += movement.abs_amount * movement.category.direction;
            return {"date": (new Date(movement.date)).getTime(), "cumulative": cumulative};
        });
    }
    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
                <Line type="stepAfter" dataKey="cumulative" stroke="#8884d8" dot={false} />
                <XAxis 
                    type='number' 
                    dataKey="date"  
                    domain={timeRange} 
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