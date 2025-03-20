// app/page.js

"use client"; // This page is a client component

import useSWR from 'swr';

const fetcher = (url) => fetch(url).then(res => res.json());

export default function HomePage() {
  const { data, error } = useSWR(
    '/api/zentra/get-readings?sn=z6-21087&start_time=2023-06-01T00:00:00&end_time=2023-06-14T23:59:00',
    fetcher
  );

  if (error) return <div>Error loading data.</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Zentra Cloud Readings</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
