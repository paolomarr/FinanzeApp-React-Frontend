import { API_ENDPOINTS } from "../constants";
import {mutateObjectWithUrl} from "./genericMutation";

const mutateMovement = async ({ movement, _delete }) => {
    var url = API_ENDPOINTS.movements;
    url.pathname += "/movements/";
    return mutateObjectWithUrl({url: url, object: movement, _delete: _delete});
};

export default mutateMovement;