import axios from "axios";

// just a helper to retry Zentra API calls when it yells at us for too many requests
export const retryZentraFetch = async (url, token, retries = 5, waitTime = 5000) => {
    for (let i = 1; i <= retries; i++) {
        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Token ${token}`,
                },
            });
            return response;
        } catch (error) {
            const isRateLimit = error.response?.status === 429;

            if (isRateLimit && i < retries) {
                const seconds = waitTime / 1000;
                console.warn(`Got 429 from Zentra, retrying in ${seconds}s (attempt ${i})`);
                await new Promise(res => setTimeout(res, waitTime));
                waitTime *= 2;  // double the delay for next round
            } else {
                console.error("API call gave up at attempt", i);
                throw error;
            }
        }
    }

    // if we hit this, all retries failed
    throw new Error("Gave up after hitting Zentra too many times.");
};
