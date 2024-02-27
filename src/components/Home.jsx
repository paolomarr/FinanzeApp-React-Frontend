import MovementsList from "./MovementsList";
import MovementsHistory from "./MovementsHistory";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import fetchMovements from "../queries/fetchMovements";
import { Navigate } from "react-router-dom";
import { useLingui } from "@lingui/react";
import { t } from "@lingui/macro"
import TimeSpanSlider from "./TimeSpanSlider";
import { sub } from "date-fns";
import { intervalToDuration, min, max } from "date-fns";
import { formatDuration } from "../_lib/format_locale"

const generateChartData = (data, slice) => {
  const baselineData = data.baseline?? null;
  const minDate = data.minDate;
  const maxDate = data.maxDate;
  const plotStats = {
    data: [],
    nMovements: function() { return this.data.length }, // no arrow function when using 'this'
    minDate: minDate,
    maxDate: maxDate,
    maxCumulative: 0,
    minCumulative: 0,
    incomes: 0,
    outcomes: 0,
    savingRate: function() {return this.outcomes != 0 ? (this.incomes-this.outcomes)/this.outcomes : 0},
    duration: function(keys) {
      const fulldur = intervalToDuration({start:this.minDate, end: this.maxDate});
      if(fulldur && keys && keys.length>0){
        const ret = {};
        keys.forEach(element => {
          fulldur[element] ? ret[element] = fulldur[element] : null;
        });
        return ret;
      }
      return fulldur;
    }
  }
  if(baselineData){
    let maxIdx = data.movements.length - 1;
    if(slice){
      plotStats.minDate = max([minDate, slice.minDate]);
      plotStats.maxDate = min([maxDate, slice.maxDate]);
    }
    const baselineVal = baselineData[1];
    let cumulative = baselineVal;
    
    for(let i=maxIdx; i>0; i--){
      const movement = data.movements[i];
      const mDate = new Date(movement.date);
      cumulative += movement.abs_amount * movement.category.direction;
      plotStats.maxCumulative = Math.max(cumulative, plotStats.maxCumulative);
      plotStats.minCumulative = Math.min(cumulative, plotStats.minCumulative);
      if(mDate < plotStats.minDate) continue;
      if(mDate > plotStats.maxDate) continue;
      plotStats.data.push({"date": (mDate).getTime(), "cumulative": cumulative});
      if(movement.category.direction>0)   plotStats.incomes += movement.abs_amount;
      else plotStats.outcomes += movement.abs_amount;
    }
  }
  return plotStats;
};
const MovementStats = ({stats}) => {
  return (
    <>
    { stats && stats !== undefined ?
    <div className="movement-stats text-center">
      <p>{stats.nMovements()} {t`movements in`} {formatDuration(stats.duration(["years", "months", "days"]))}</p>
      <p>{t`Outcomes`}: {parseFloat(stats.outcomes).toFixed(2)} - {t`Incomes`}: {parseFloat(stats.incomes).toFixed(2)} - <b>{t`Saving rate`}: {parseFloat(stats.savingRate()*100).toFixed(1)}</b></p>
    </div> : null}
    </>
  )
};
const Home = () => {
    const {i18n} = useLingui()
    const printDate = ((date) => {
      return i18n.date(date);
      // const options = { year: 'numeric', month: 'short', day: 'numeric' };
      // return temporalZonedDateTime.toLocaleString('it-IT', options);
    });

    const today = new Date();
    const [dataSlice, setDataSlice] = useState({
      minIdx: 0,
      maxIdx: 1,
      minDate: today,
      maxDate: today
    });
    const [chartData, setChartData] = useState(null);

    const results = useQuery({
      queryKey: ["movements", "all"],
      queryFn: fetchMovements,
      retry: (failureCount, error) => {
        if(error.message === "forbidden") return false;
        else return 3;
      },
      onSuccess: (data) => {
        setChartData(generateChartData(data));
      }
    });
    if (results.isLoading) {
      return (
        <div className="loading-pane">
          <h2 className="loader">🌀</h2>
        </div>
      );
    }
    if (results.isError) {
        switch (results.error.message) {
            case "forbidden":
                console.log("Unable to fetch: unauthenticated");
                return (
                    <Navigate to="/login" />
                )
            default:
                console.log("Unable to fetch: unknown error");
                break;
        }
    }
    const onSliderChange = (changeResult) => {
      if(dataSlice.minDate == changeResult.minValue && dataSlice.maxDate == changeResult.maxValue){
        return;
      }
      let newDataSlice = { minDate: changeResult.minValue, maxDate: changeResult.maxValue};
      if(results.data?.movements){
        const minPercent = (changeResult.minValue - changeResult.min) / (changeResult.max - changeResult.min);
        const maxPercent = (changeResult.maxValue - changeResult.min) / (changeResult.max - changeResult.min);
        const movements = results.data.movements;
        const startIdx = parseInt(minPercent * movements.length);
        const endIdx = parseInt(maxPercent * movements.length);
        newDataSlice.minIdx = startIdx;
        newDataSlice.maxIdx = endIdx;
      }
      setDataSlice(newDataSlice);
      setChartData(generateChartData(results.data, newDataSlice));
    };
    return (
      <>
        <h3 className="text-center">
          {t({id: "date.from", message: "From"})} {printDate(dataSlice.minDate)} {t({id: "date.to", message: "to"})} {printDate(dataSlice.maxDate)}
        </h3>
        <MovementStats stats={chartData}></MovementStats>
        <TimeSpanSlider min={new Date(results.data.minDate)} max={new Date(results.data.maxDate)} start={sub(new Date(), {months:3})} end={new Date()} steps={100} onChange={onSliderChange} /> 
        <MovementsHistory data={chartData}/>
        <MovementsList movements={results.data.movements.slice(-dataSlice.maxIdx, -dataSlice.minIdx)} refresh={results.refetch}/>
      </>
    )
}

export default Home;