import { API_ENDPOINTS } from "../constants";
import { mutateObjectWithUrl } from "./genericMutation";

const mutateReceipt = async ({imgBase64}) => {
    const payload = {
        "base64image": imgBase64,
    };
    return mutateObjectWithUrl({url: API_ENDPOINTS.scanreceipt(), object: payload, _delete: false});
}

export default mutateReceipt