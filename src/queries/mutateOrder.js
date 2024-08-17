import mutateObjectWithPath from "./genericMutation";
import { API_URL } from "../constants";

const mutateOrder = async ({ order, _delete }) => {
    return mutateObjectWithPath({basepath: API_URL, path: "orders/", object: order, _delete: _delete});
};

export default mutateOrder;