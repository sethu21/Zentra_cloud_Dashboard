import axios from "axios";

// Retry Zentra API fetch in case of rate limiting
export const retryZentraFetch = async (url, token, retries = 5, delay = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await axios.get(url, {
        headers: { Authorization: `Token ${token}` },
      });
      return res;
    } catch (err) {
      if (err.response?.status === 429 && attempt < retries) {
        console.warn(`429 Too Many Requests – retrying in ${delay / 1000}s...`);
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
      } else {
        throw err;
      }
    }
  }
  throw new Error("Zentra API failed after multiple retries.");
};