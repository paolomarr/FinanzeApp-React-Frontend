import { API_ENDPOINTS } from "../constants";
import authenticatedFetch from "./authenticatedFetch";

const mutateVoice = async ({ audioBlob }) => {
    const url = API_ENDPOINTS.voice();
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const response = await authenticatedFetch(url, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.error || 'Voice processing failed');
        error.cause = errorData;
        throw error;
    }

    return response.json();
};

export default mutateVoice;