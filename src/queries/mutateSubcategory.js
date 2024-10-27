import { API_URL } from "../constants";
import mutateObjectWithPath from "./genericMutation";

const mutateSubcategory = async ({ subcategory, _delete }) => {
    return mutateObjectWithPath({basepath: API_URL, path: "subcategories/", object: subcategory, _delete: _delete});
};

export default mutateSubcategory;