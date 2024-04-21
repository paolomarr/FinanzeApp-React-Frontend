import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import Form from 'react-bootstrap/Form';
import { format } from '../_lib/format_locale';
import { useLingui } from '@lingui/react';
import { colors } from '../constants';
import { useState } from 'react';
import { t } from '@lingui/macro';

const MovementsHistory = ({data, slice, categories}) => {
    const [showAssets, setShowAssets] = useState(sessionStorage.getItem("MovementsHistory.showAssets")??false);
    const balanceCategoryId = categories.find((cat) => cat.category === "BALANCE")?.id ?? -1;
    const isBalanceMovement = (movement) => movement.category === balanceCategoryId;
    const {i18n} = useLingui();
    const baselineVal = data?.baseline?.at(1) ?? 0.;
    let chartData = [];
    let balance = 0;
    if(data){
        // select BALANCE movements recorder BEFORE slice.minDate
        const balance_movements = data.movements.filter((movement) => {
            let ret = isBalanceMovement(movement);
            if(slice){
                const mdate = new Date(movement.date);
                ret &= mdate <= slice.minDate;
            }
            return ret;
        });
        // take the latest BALANCE record, which is a group of N>=1 movements and SUM their values. This will be the baseline
        const latestDate = new Date(balance_movements[balance_movements.length-1].date);
        balance_movements.filter((movement) => {
            const mdate = new Date(movement.date);
            return mdate.getTime() === latestDate.getTime();
        }).forEach(movement => {
            balance += movement.abs_amount;
        });
        let cumulative = balance>0? balance : baselineVal; //baseline value

        for(let index=0; index<data.movements.length; index++){
            const movement = data.movements.at(index);
            let skipAdd = false;
            const mDate = new Date(movement.date);
            if(slice && mDate.getTime()<slice.minDate){
                continue;
            }
            if(isBalanceMovement(movement)){ // this means category.direction == 0, i.e. this is a 'BALANCE' type movement
                if(index>0 && (!slice || slice.minDate<=mDate)){
                    // BALANCE movements come in blocks of N>=1 entries with the same exact date. We need to sort-of group them into one chart point
                    const prev_mov = data.movements[index-1];
                    const prev_date = new Date(prev_mov.date);
                    if(isBalanceMovement(prev_mov) && prev_date.getTime() === mDate.getTime()){
                        // let prev_chartData = chartData[chartData.length-2];
                        balance += movement.abs_amount;
                    }else{
                        balance = movement.abs_amount; // the first of the BALANCE items group for a given date
                    }
                }
                skipAdd = true;
            }else{
                cumulative += movement.amount
                if(!skipAdd){
                    if(slice){
                        if(mDate <= slice.maxDate){
                            chartData.push({"date": (mDate).getTime(), "cumulative": cumulative, "balance": balance}) 
                        }
                    }else{
                        chartData.push({"date": (mDate).getTime(), "cumulative": cumulative, "balance": balance})  
                    }
                }
            }
        }
    }
    return (
        <div className='movements-history-container mt-2'>
            <div className='movements-history-showassetsblock text-end'>
                <Form>
                    <Form.Switch label={t`Show assets`} reverse 
                        checked={Boolean(showAssets)} 
                        onChange={()=>{sessionStorage.setItem("MovementsHistory.showAssets", !showAssets); setShowAssets(!showAssets); }}
                       />
                </Form>
            </div>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                    <Line type="stepAfter" dataKey="cumulative" stroke={colors.primary} dot={false} />
                    { showAssets?
                        <Line type="stepBefore" dataKey="balance" stroke={colors.secondary} dot={false} />
                        : null
                    }
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
                        LabelStyle={{color: colors.primary}}
                        labelFormatter={(timestamp) => (new Date(timestamp)).toLocaleDateString()} />
                </LineChart>
            </ResponsiveContainer>
        </div>
      
    )
}

export default MovementsHistory