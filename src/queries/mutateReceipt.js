const { API_URL } = require("../constants");
const { default: mutateObjectWithPath } = require("./genericMutation");

const mutateReceipt = async ({imgBase64}) => {
    const payload = {
        "base64image": imgBase64,
    };
    return mutateObjectWithPath({basepath: API_URL, path: "scan-receipt", object: payload, _delete: false});
}

export default mutateReceipt