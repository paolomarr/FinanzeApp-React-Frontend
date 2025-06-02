import { API_ENDPOINTS } from "../constants";
import {mutateObjectWithUrl} from "./genericMutation";

const mutateCategory = async ({ category, _delete }) => {
    var url = API_ENDPOINTS.movements();
    url.pathname += "/categories/";
    return mutateObjectWithUrl({url: url, object: category, _delete: _delete});
};

export default mutateCategory;