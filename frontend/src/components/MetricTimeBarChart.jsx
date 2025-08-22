import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Helper to group results by day (or week/month if needed)
function groupByTime(results, metric, timeKey = 'day') {
  const groups = {};
  results.forEach(r => {
    const date = new Date(r.timestamp);
    let label;
    if (timeKey === 'day') {
      label = date.toISOString().slice(0, 10); // YYYY-MM-DD
    } else if (timeKey === 'month') {
      label = date.toISOString().slice(0, 7); // YYYY-MM
    } else {
      label = date.toISOString().slice(0, 10);
    }
    if (!groups[label]) groups[label] = [];
    groups[label].push(Number(r[metric]));
  });
  // Compute average for each group
  const labels = Object.keys(groups).sort();
  const data = labels.map(label => {
    const vals = groups[label].filter(v => !isNaN(v));
    if (!vals.length) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  });
  return { labels, data };
}

export default function MetricTimeBarChart({ results, metric, color = '#4e79a7', timeKey = 'day' }) {
  const { labels, data } = groupByTime(results, metric, timeKey);
  const chartData = {
    labels,
    datasets: [
      {
        label: metric.charAt(0).toUpperCase() + metric.slice(1),
        data,
        backgroundColor: color,
        borderRadius: 6,
        barPercentage: 0.7,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: { title: { display: true, text: 'Date' } },
      y: { title: { display: true, text: metric.charAt(0).toUpperCase() + metric.slice(1) } },
    },
  };
  return (
    <div style={{ width: '100%', minHeight: 320 }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
