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
    const [showTooltip, setShowTooltip] = useState(false);
    balance_movements.addMovement({"date": data.filtered.minDate, "abs_amount": balance_to_date.value})

    if(data?.filtered.movements) {
        const _movements = data.filtered.movements;
        const MAX_SHOWN_MOVEMENTS = 10; // the max number of chart points
        const reduce_factor = Math.floor(_movements.length/MAX_SHOWN_MOVEMENTS); // use floor, even though it will result in more points than MAX_SHOWN_MOVEMENTS
        for (var i = 0; i < _movements.length; i++) {
            const movement = _movements[i]; 
            let ret = isBalanceMovement(movement);
            if(ret){
                balance_movements.addMovement(movement);
            }else{
                const mDate = new Date(movement.date);
                cumulative += movement.amount
                if(i % reduce_factor === 0){
                    non_balance_movements.push({"date": (mDate).getTime(), "cumulative": cumulative});
                }
            }
        }  
    }
    const xAxisDateFormatter = (tick) => {
        // if the date domain spans over multiple years, show dd/mm/yy, otherwise dd/mm
        const minDate = new Date(data.filtered.minDate);
        const maxDate = new Date(data.filtered.maxDate);
        if(minDate.getFullYear() !== maxDate.getFullYear()){
            return format(new Date(tick), i18n, {"month": "numeric", "day": "numeric", "year": "2-digit"});
        }else{
            return format(new Date(tick), i18n, {"month": "numeric", "day": "numeric"});
        }
    }
    return (
        <div className='movements-history-container mt-2 py-4'>
            <div className='movements-history-showassetsblock text-end'>
                <Form>
                    <Form.Switch label={t`Show assets`} reverse 
                        checked={Boolean(showAssets)} 
                        onChange={()=>{localStorage.setItem("MovementsHistory.showAssets", !showAssets); setShowAssets(!showAssets); }}
                       />
                </Form>
            </div>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart
                    margin={{left:0, right:0, top:5, bottom:5}}
                    onClick={() => setShowTooltip(!showTooltip)}>
                    <Line type="bump" dataKey="cumulative" data={non_balance_movements} 
                        className='history-movements-chartline' dot={false} 
                        animationDuration={400}/>
                    { showAssets?
                        <Line type="linear" dataKey="balance" 
                            data={balance_movements.timeSeries()} 
                            className='history-assets-chartline' 
                            dot={true} strokeDasharray="5 5"
                            animationDuration={400}
                            label={{ fontSize: 12 }}>
                                <LabelList formatter={(value)=>parseFloat(value).toFixed(0)} position="insideBottomLeft" />
                            </Line>
                        : null
                    }
                    <XAxis 
                        type='number' 
                        dataKey="date"  
                        domain={[(new Date(data.filtered.minDate)).getTime(), data?.filtered.maxDate]} 
                        // domain={["auto", "auto"]} 
                        tickFormatter={xAxisDateFormatter}
                        tick={{fontSize: 12}}
                        tickCount="10" />
                    <YAxis domain={["auto", "auto"]}
                      /* reduce font size of axis tick labels */
                        tick={{fontSize: 12}}
                    /> 
                    <Tooltip 
                        active={showTooltip} 
                        formatter={(value) => `${parseFloat(value).toFixed(2)} €`}
                        // LabelStyle={{color: colors.primary}}
                        labelFormatter={(timestamp) => (new Date(timestamp)).toLocaleDateString()} />
                </LineChart>
            </ResponsiveContainer>
        </div>
      
    )
}

export default MovementsHistory