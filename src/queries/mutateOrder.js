import {mutateObjectWithUrl} from "./genericMutation";
import { API_ENDPOINTS } from "../constants";

const mutateOrder = async ({ order, _delete }) => {
    var url = API_ENDPOINTS.tradinglog();
    url.pathname += "/orders/";
    return mutateObjectWithUrl({url: url, object: order, _delete: _delete});
};

export default mutateOrder;