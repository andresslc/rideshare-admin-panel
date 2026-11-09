import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

const CommissionTrendChart = ({ data: externalData }) => {
  // Use external data if provided, otherwise fallback to mock
  const labels = externalData?.labels || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const values = externalData?.values || [450, 620, 890, 750, 1100, 1400, 1600];

  const data = {
    labels,
    datasets: [
      {
        label: "Admin Commission ($)",
        data: values,
        borderColor: "#10b981", // Success green
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#10b981",
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: false 
      },
      tooltip: {
        backgroundColor: "#1f2937",
        padding: 12,
        titleColor: "#f3f4f6",
        bodyColor: "#f3f4f6",
        bodyFont: { size: 14, weight: "bold" },
        displayColors: false,
        callbacks: {
          label: (context) => `$${context.raw}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(243, 244, 246, 1)",
          drawBorder: false,
        },
        ticks: {
          callback: (value) => `$${value}`,
          color: "#9ca3af",
          font: { size: 12 },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#9ca3af",
          font: { size: 12 },
        },
      },
    },
  };

  return (
    <div className="h-[300px] w-full">
      <Line data={data} options={options} />
    </div>
  );
};

export default CommissionTrendChart;
