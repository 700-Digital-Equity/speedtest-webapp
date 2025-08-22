import React from 'react';
import { Bar } from 'react-chartjs-2';

export default function MetricBarChart({ data, label, color }) {
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        label,
        data: data.map(d => d.value),
        backgroundColor: color || '#4e79a7',
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: { grid: { color: '#333' }, ticks: { color: '#fff' } },
      y: { grid: { color: '#333' }, ticks: { color: '#fff' } },
    },
  };
  return <Bar data={chartData} options={options} />;
}
