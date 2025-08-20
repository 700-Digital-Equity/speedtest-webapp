import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

export default function LiveGraph({ downloadHistory, uploadHistory }) {
  // Fixed x-axis: 0 to 25 seconds, 0.5s intervals
  const maxTime = 25; // seconds
  const interval = 0.5; // seconds
  const numPoints = Math.ceil(maxTime / interval) + 1;
  const labels = Array.from({ length: numPoints }, (_, i) => i * interval);

  // Helper to get value at each interval (last known value or null)
  function getSeries(history) {
    const arr = Array(numPoints).fill(null);
    let last = null;
    let j = 0;
    let lastIdx = -1;
    for (let i = 0; i < numPoints; i++) {
      const t = i * interval * 1000;
      while (j < history.length && history[j].time <= t) {
        last = history[j].value;
        lastIdx = i;
        j++;
      }
      if (lastIdx !== -1 && i <= lastIdx) {
        arr[i] = last;
      } else {
        arr[i] = null;
      }
    }
    return arr;
  }

  const downloadSeries = getSeries(downloadHistory);
  const uploadSeries = getSeries(uploadHistory);

  const data = {
    labels,
    datasets: [
      {
        label: 'Download (Mbps)',
        data: downloadSeries,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.2,
        pointRadius: 0,
        spanGaps: true,
      },
      {
        label: 'Upload (Mbps)',
        data: uploadSeries,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.2,
        pointRadius: 0,
        spanGaps: true,
      },
    ],
  };

  const options = {
    responsive: true,
    animation: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Live Speed (Mbps)' },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Mbps' } },
      x: {
        type: 'linear',
        title: { display: true, text: 'Time (s)' },
        min: 0,
        max: maxTime,
        ticks: {
          stepSize: 2,
          callback: function(val, idx) {
            // Only show every 2s label for clarity
            return val % 2 === 0 ? val : '';
          }
        }
      },
    },
  };

  return (
    <div style={{ maxWidth: 700, minWidth: 350, height: 340, margin: '0 auto', background: 'none' }}>
      <Line
        data={data}
        options={{
          ...options,
          maintainAspectRatio: false,
          scales: {
            ...options.scales,
            y: {
              ...options.scales.y,
              // Optionally, set a higher max for y-axis for more zoom
              // max: 1000,
            },
          },
        }}
        height={320}
      />
    </div>
  );
}
