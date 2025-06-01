import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, LabelList } from 'recharts';
import Form from 'react-bootstrap/Form';
import { format } from '../_lib/format_locale';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { t } from '@lingui/macro';

function BalanceManager() {
    this.groupedMovements = {};
    this.addMovement = function(movement){
        const mdate = new Date(movement.date);
        if(mdate.getTime() in this.groupedMovements){
            this.groupedMovements[mdate.getTime()].movements.push(movement);
            this.groupedMovements[mdate.getTime()].groupSum += movement.abs_amount;
        }else{
            this.groupedMovements[mdate.getTime()] = {
                "movements": [movement],
                "groupSum": movement.abs_amount,
            }
        }
    }
    this.timeSeries = function(){
        var series = [];
        for (const timestamp in this.groupedMovements) {
            series.push({"date": parseInt(timestamp), "balance": this.groupedMovements[timestamp].groupSum});
        }
        return series;
    }
}
const MovementsHistory = ({data, categories}) => {
    const [showAssets, setShowAssets] = useState(localStorage.getItem("MovementsHistory.showAssets")??false);
    const balanceCategoryId = categories.find((cat) => cat.category === "BALANCE")?.id ?? -1;
    const isBalanceMovement = (movement) => movement.category === balanceCategoryId;
    const {i18n} = useLingui();
    let balance_to_date = data.previous.balance ?? { date: new Date(), value: 0.0 };
    let cumulative = balance_to_date.value; /* baseline */
    const non_balance_movements = [];
    const balance_movements = new BalanceManager();
    balance_movements.addMovement({"date": data.filtered.minDate, "abs_amount": balance_to_date.value})

    if(data?.filtered.movements) {
        const _movements = data.filtered.movements;

        for (const movement of _movements) {
            let ret = isBalanceMovement(movement);
            if(ret){
                balance_movements.addMovement(movement);
            }else{
                const mDate = new Date(movement.date);
                cumulative += movement.amount
                non_balance_movements.push({"date": (mDate).getTime(), "cumulative": cumulative});
            }
        }
        
    }
    return (
        <div className='movements-history-container mt-2'>
            <div className='movements-history-showassetsblock text-end'>
                <Form>
                    <Form.Switch label={t`Show assets`} reverse 
                        checked={Boolean(showAssets)} 
                        onChange={()=>{localStorage.setItem("MovementsHistory.showAssets", !showAssets); setShowAssets(!showAssets); }}
                       />
                </Form>
            </div>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart>
                    <Line type="bump" dataKey="cumulative" data={non_balance_movements} className='history-movements-chartline' dot={false} />
                    { showAssets?
                        <Line type="stepAfter" dataKey="balance" 
                            data={balance_movements.timeSeries()} 
                            className='history-assets-chartline' 
                            dot={true} strokeDasharray="5 5">
                                <LabelList formatter={(value)=>parseFloat(value).toFixed(0)} position="insideBottomLeft" />
                            </Line>
                        : null
                    }
                    <XAxis 
                        type='number' 
                        dataKey="date"  
                        domain={[(new Date(data.filtered.minDate)).getTime(), data?.filtered.maxDate]} 
                        // domain={["auto", "auto"]} 
                        tickFormatter={tick => (format(new Date(tick), i18n))}
                        tickCount="10" />
                    <YAxis domain={["auto", "auto"]}/> 
                    <Tooltip 
                        active={true} 
                        formatter={(value) => `${parseFloat(value).toFixed(2)} €`}
                        // LabelStyle={{color: colors.primary}}
                        labelFormatter={(timestamp) => (new Date(timestamp)).toLocaleDateString()} />
                </LineChart>
            </ResponsiveContainer>
        </div>
      
    )
}

export default MovementsHistory