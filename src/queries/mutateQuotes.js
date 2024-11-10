import mutateObjectWithPath from "./genericMutation";
import { API_URL } from "../constants";

const mutateQuotes = async ({ quotes: quotesData, _delete }) => {
    return mutateObjectWithPath({basepath: API_URL, path: "quotes/", object: quotesData, _delete: _delete});
};

export default mutateQuotes;