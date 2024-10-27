import { API_URL } from "../constants";
import mutateObjectWithPath from "./genericMutation";

const mutateCategory = async ({ category, _delete }) => {
    return mutateObjectWithPath({basepath: API_URL, path: "categories/", object: category, _delete: _delete});
};

export default mutateCategory;