import {mutateObjectWithUrl} from "./genericMutation";
import { API_ENDPOINTS } from "../constants";

const mutateQuotes = async ({ quotes: quotesData, _delete }) => {
    var url = API_ENDPOINTS.tradinglog();
    url.pathname += "/quotes/";
    
    return mutateObjectWithUrl({url: url, object: quotesData, _delete: _delete});
};

export default mutateQuotes;