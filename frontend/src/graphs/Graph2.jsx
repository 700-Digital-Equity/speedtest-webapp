import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register required Chart.js components
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

export default function Graph2({ results }) {
  // Group results by deviceType and calculate average speeds
  const deviceGroups = {};
  results.forEach(r => {
    // Normalize and filter deviceType
    const type = (r.deviceModel || '').trim();
    if (!type) return;
    if (!deviceGroups[type]) deviceGroups[type] = [];
    deviceGroups[type].push(r);
  });

  const deviceTypes = Object.keys(deviceGroups);
  const avgDownload = deviceTypes.map(type =>
    (
      deviceGroups[type].reduce((sum, r) => sum + (r.download || 0), 0) /
      deviceGroups[type].length
    ).toFixed(2)
  );
  const avgUpload = deviceTypes.map(type =>
    (
      deviceGroups[type].reduce((sum, r) => sum + (r.upload || 0), 0) /
      deviceGroups[type].length
    ).toFixed(2)
  );

  const data = {
    labels: deviceTypes,
    datasets: [
      {
        label: 'Avg Download (Mbps)',
        data: avgDownload,
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
      },
      {
        label: 'Avg Upload (Mbps)',
        data: avgUpload,
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: { display: true, text: 'Average Speeds by Device Type' },
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Mbps' } },
    },
  };

  // Show a message if there is no data to plot
  if (deviceTypes.length === 0) {
    return <div>No device type data available to plot.</div>;
  }

  return <Bar data={data} options={options} />;
}