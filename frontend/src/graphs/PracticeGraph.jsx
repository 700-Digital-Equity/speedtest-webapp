import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register required Chart.js components
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

export default function PracticeGraph({ results }) {
  const data = {
    labels: results.map(r => new Date(r.timestamp).toLocaleString()),
    datasets: [
      {
        label: 'Download (Mbps)',
        data: results.map(r => r.download),
        borderColor: 'blue',
        fill: false,
      },
      {
        label: 'Upload (Mbps)',
        data: results.map(r => r.upload),
        borderColor: 'green',
        fill: false,
      },
      {
        label: 'Ping (ms)',
        data: results.map(r => r.ping),
        borderColor: 'orange',
        fill: false,
        yAxisID: 'y2',
      },
    ],
  };

  const options = {
    scales: {
      y: { title: { display: true, text: 'Speed (Mbps)' }, type: 'linear' },
      y2: {
        position: 'right',
        title: { display: true, text: 'Ping (ms)' },
        grid: { drawOnChartArea: false },
        type: 'linear',
      },
    },
  };

  return <Line data={data} options={options} />;
}