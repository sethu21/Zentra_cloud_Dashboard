import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json()); // this help to convert the data to json 



 
export const useSensorData = (startDate, endDate) => {
  const apiUrl = `/api/zentra/fetch-makwana?start_date=${encodeURIComponent(
    `${startDate} 00:00`
  )}&end_date=${encodeURIComponent(`${endDate} 23:59`)}`; 

  
  const { data, error } = useSWR(apiUrl, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000, // fetch data for every 5 min(this is best to reduce the api load)
    errorRetryCount: 0, // this disable automatic try if gets error 
  });


  return {
    data: data?.data || [], // use the fetched data or empty array as fallback
    isLoading: !data && !error, 
    isError: !!error,
  };
};