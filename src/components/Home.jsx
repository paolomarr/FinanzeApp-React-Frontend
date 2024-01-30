import MovimentiList from "./MovimentiList";
import MovementsHistory from "./MovimentiHistory";
import { useQuery } from "@tanstack/react-query";
import fetchMovements from "../queries/fetchMovements";
import { Navigate } from "react-router-dom";

const Home = () => {
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
            <MovementsHistory data={results.data} />
            <MovimentiList movements={results.data.movements} refresh={results.refetch}/>
        </>
    )
}

export default Home;