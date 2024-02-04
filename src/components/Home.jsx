import MovimentiList from "./MovimentiList";
import MovementsHistory from "./MovimentiHistory";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import fetchMovements from "../queries/fetchMovements";
import { Navigate } from "react-router-dom";
import { Temporal } from "@js-temporal/polyfill";
import { useLingui } from "@lingui/react";
import { t } from "@lingui/macro"

const Home = () => {
    const {i18n} = useLingui()
    const printTemporalDate = ((temporalZonedDateTime) => {
      return i18n.date(temporalZonedDateTime.toInstant().epochMilliseconds);
      // const options = { year: 'numeric', month: 'short', day: 'numeric' };
      // return temporalZonedDateTime.toLocaleString('it-IT', options);
    });

    const today = Temporal.Now.zonedDateTimeISO();
    const threeMonthsAgo = Temporal.Now.zonedDateTimeISO().subtract({months: 1});
    const [dateRange] = useState([threeMonthsAgo, today]);

    const results = useQuery({
      queryKey: ["movements"],
      queryFn: fetchMovements,
      retry: (failureCount, error) => {
        if(error.message === "forbidden") return false;
        else return 3;
      }});
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
    return (
        <>
            <h3 className="text-center">{t({id: "date.from", message: "From"})} {printTemporalDate(dateRange[0])} {t({id: "date.to", message: "to"})} {printTemporalDate(dateRange[1])}</h3>
            <MovementsHistory data={results.data} />
            <MovimentiList movements={results.data.movements} refresh={results.refetch}/>
        </>
    )
}

export default Home;