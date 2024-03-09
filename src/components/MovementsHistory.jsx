import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { format } from '../_lib/format_locale';

const MovementsHistory = ({data}) => {
    return (
      <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data?.chartData?? []}>
              <Line type="stepAfter" dataKey="cumulative" stroke="#8884d8" dot={false} />
              <XAxis 
                  type='number' 
                  dataKey="date"  
                  domain={[data?.minDate, data?.maxDate]} 
                  // domain={["auto", "auto"]} 
                  tickFormatter={tick => (format(new Date(tick)))}
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