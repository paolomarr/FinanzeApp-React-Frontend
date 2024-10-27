import { API_URL } from "../constants";
import mutateObjectWithPath from "./genericMutation";

const mutateMovement = async ({ movement, _delete }) => {
    return mutateObjectWithPath({basepath: API_URL, path: "movements/", object: movement, _delete: _delete});
};

export default mutateMovement;