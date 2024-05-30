import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import fetchTradinglog from "../queries/fetchTradinglog";
import { useNavigate } from "react-router-dom";
import LoadingDiv from "./LoadingDiv";

const defaultQueryRetryFunction = (failureCount, error, queryclient, navigate) => {
    if(error.message === "forbidden"){
        queryclient.cancelQueries();
        navigate("/login");
        return false;
    } else{ 
        return failureCount-1;
    }
};
const Trading = () => {
    const queryclient = useQueryClient();
    const navigate = useNavigate();
    const [stockQuery, orderQuery] = useQueries({
        queries: [
            {queryKey: ["stocks"], queryFn: fetchTradinglog, retry: (failureCount, error) => defaultQueryRetryFunction(failureCount, error, queryclient, navigate)},
            {queryKey: ["orders"], queryFn: fetchTradinglog, retry: (failureCount, error) => defaultQueryRetryFunction(failureCount, error, queryclient, navigate)},
        ]
    });
    if(stockQuery.status === "loading" || orderQuery.status === "loading"){
        return <LoadingDiv />
    }

    return <>
    </>
};

export default Trading;