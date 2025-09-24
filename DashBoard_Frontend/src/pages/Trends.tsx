import React from 'react';
import { Line } from 'react-chartjs-2';
import '../App.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Trends: React.FC = () => {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Water Quality Index',
        data: [65, 59, 80, 81, 56, 55, 90],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.3,
      },
      {
        label: 'Contaminant Levels',
        data: [28, 48, 40, 19, 86, 27, 30],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Water Quality Trends',
      },
    },
  };

  return (
    <div className="page-content">
      <h1>Water Quality Trends</h1>
      <div className="chart-container">
        <Line options={options} data={data} />
      </div>
    </div>
  );
};

export default Trends;
