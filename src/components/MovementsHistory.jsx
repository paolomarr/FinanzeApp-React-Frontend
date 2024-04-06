import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { format } from '../_lib/format_locale';
import { useLingui } from '@lingui/react';
import { colors } from '../constants';

const MovementsHistory = ({data, slice}) => {
    const {i18n} = useLingui();
    const baselineVal = data?.baseline?.at(1) ?? 0.;
    let chartData = [];
    if(data){
        let cumulative = baselineVal;
        data.movements.map((movement) => {
            const mDate = new Date(movement.date);
            cumulative += movement.amount
            if(slice){
                if(mDate >= slice.minDate && mDate <= slice.maxDate){
                    chartData.push({"date": (mDate).getTime(), "cumulative": cumulative})      
                }
            }else{
                chartData.push({"date": (mDate).getTime(), "cumulative": cumulative})      
            }
        });
    }
    return (
      <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
              <Line type="stepAfter" dataKey="cumulative" stroke={colors.primary} dot={false} />
              <XAxis 
                  type='number' 
                  dataKey="date"  
                  domain={[data?.minDate, data?.maxDate]} 
                  // domain={["auto", "auto"]} 
                  tickFormatter={tick => (format(new Date(tick), i18n))}
                  tickCount="10" />
              <YAxis domain={["auto", "auto"]}/> 
              <Tooltip 
                  active={true} 
                  formatter={(value) => `${parseFloat(value).toFixed(2)} €`}
                  labelStyle={{color: colors.primary}}
                  labelFormatter={(timestamp) => (new Date(timestamp)).toLocaleDateString()} />
          </LineChart>
      </ResponsiveContainer>
    )
}

export default MovementsHistory