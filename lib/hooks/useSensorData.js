import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export const useSensorData = (startDate, endDate) => {
  const apiUrl = `/api/zentra/fetch-makwana?start_date=${encodeURIComponent(
    `${startDate} 00:00`
  )}&end_date=${encodeURIComponent(`${endDate} 23:59`)}`;

  const { data, error } = useSWR(apiUrl, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000,
    errorRetryCount: 0,
  });

  return {
    data: data?.data || [],
    isLoading: !data && !error,
    isError: !!error,
  };
};