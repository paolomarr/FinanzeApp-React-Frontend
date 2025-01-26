import { API_ENDPOINTS } from "../constants";
import { mutateObjectWithUrl } from "./genericMutation";

const mutateSubcategory = async ({ subcategory, _delete }) => {
    var url = API_ENDPOINTS.movements;
    url.pathname += "/subcategories/";
    return mutateObjectWithUrl({url: url, object: subcategory, _delete: _delete});
};

export default mutateSubcategory;