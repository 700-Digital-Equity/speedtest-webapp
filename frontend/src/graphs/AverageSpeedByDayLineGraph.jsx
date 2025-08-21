import React from 'react';
import { Line } from 'react-chartjs-2';

export default function AverageSpeedByDayLineGraph({ results }) {
  // Group by day
  const dayMap = {};
  results.forEach(r => {
    if (!r.timestamp) return;
    const day = new Date(r.timestamp).toISOString().slice(0, 10);
    if (!dayMap[day]) dayMap[day] = { download: [], upload: [] };
    if (r.download != null) dayMap[day].download.push(Number(r.download));
    if (r.upload != null) dayMap[day].upload.push(Number(r.upload));
  });
  const days = Object.keys(dayMap).sort();
  const avgDownload = days.map(day => {
    const arr = dayMap[day].download;
    return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  });
  const avgUpload = days.map(day => {
    const arr = dayMap[day].upload;
    return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  });
  const data = {
    labels: days,
    datasets: [
      {
        label: 'Avg Download (Mbps)',
        data: avgDownload,
        borderColor: '#4e79a7',
        backgroundColor: 'rgba(78,121,167,0.1)',
        tension: 0.2,
      },
      {
        label: 'Avg Upload (Mbps)',
        data: avgUpload,
        borderColor: '#f28e2b',
        backgroundColor: 'rgba(242,142,43,0.1)',
        tension: 0.2,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#fff' } },
      title: { display: false },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { ticks: { color: '#fff', maxTicksLimit: 8 }, grid: { color: '#333' } },
      y: { ticks: { color: '#fff' }, grid: { color: '#333' } },
    },
  };
  return <Line data={data} options={options} />;
}
