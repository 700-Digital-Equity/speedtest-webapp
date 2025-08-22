import React from 'react';
import { Line } from 'react-chartjs-2';

export default function LatencyJitterLineGraph({ results }) {
  // Sort by timestamp ascending
  const sorted = [...results].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const labels = sorted.map(r => new Date(r.timestamp).toLocaleString());
  const latency = sorted.map(r => Number(r.latency) || 0);
  const jitter = sorted.map(r => Number(r.jitter) || 0);
  const data = {
    labels,
    datasets: [
      {
        label: 'Latency (ms)',
        data: latency,
        borderColor: '#e15759',
        backgroundColor: 'rgba(225,87,89,0.1)',
        tension: 0.2,
      },
      {
        label: 'Jitter (ms)',
        data: jitter,
        borderColor: '#76b7b2',
        backgroundColor: 'rgba(118,183,178,0.1)',
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
