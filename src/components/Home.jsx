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

    const results = useQuery({
      queryKey: ["movements", "all"],
      queryFn: fetchMovements,
      retry: (failureCount, error) => {
        if(error.message === "forbidden") return false;
        else return 3;
      },
      // onSuccess: (data) => {
      //   const from = new Date(data.minDate);
      //   const to = new Date(data.maxDate);
      // }
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
    };
    return (
      <>
        <h3 className="text-center">{t({id: "date.from", message: "From"})} {printDate(dataSlice.minDate)} {t({id: "date.to", message: "to"})} {printDate(dataSlice.maxDate)}</h3>
        <TimeSpanSlider min={new Date(results.data.minDate)} max={new Date(results.data.maxDate)} start={sub(new Date(), {months:3})} end={new Date()} steps={100} onChange={onSliderChange} /> 
        <MovementsHistory data={results.data} slice={[dataSlice.minIdx, dataSlice.maxIdx]}/>
        <MovementsList movements={results.data.movements.slice(-dataSlice.maxIdx, -dataSlice.minIdx)} refresh={results.refetch}/>
      </>
    )
}

export default Home;