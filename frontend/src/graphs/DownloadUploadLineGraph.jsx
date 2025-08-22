import React from 'react';
import { Line } from 'react-chartjs-2';

export default function DownloadUploadLineGraph({ results }) {
  // Sort by timestamp ascending
  const sorted = [...results].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const labels = sorted.map(r => new Date(r.timestamp).toLocaleString());
  const download = sorted.map(r => Number(r.download) || 0);
  const upload = sorted.map(r => Number(r.upload) || 0);
  const data = {
    labels,
    datasets: [
      {
        label: 'Download (Mbps)',
        data: download,
        borderColor: '#4e79a7',
        backgroundColor: 'rgba(78,121,167,0.1)',
        tension: 0.2,
      },
      {
        label: 'Upload (Mbps)',
        data: upload,
        borderColor: '#f28e2b',
        backgroundColor: 'rgba(242,142,43,0.1)',
        tension: 0.2,
      },
    ],
  };
  // Detect light/dark mode
  const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const axisColor = isDark ? '#fff' : '#222';
  const gridColor = isDark ? '#333' : '#ccc';
  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: axisColor } },
      title: { display: false },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { ticks: { color: axisColor, maxTicksLimit: 8 }, grid: { color: gridColor } },
      y: { ticks: { color: axisColor }, grid: { color: gridColor } },
    },
  };
  return <Line data={data} options={options} />;
}
