// GrowthChart.jsx
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const UserGrowthChart = () => {
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

  const barData = {
    labels,
    datasets: [
      {
        label: "New Users",
        data: [300, 450, 400, 600, 700, 850, 900],
        backgroundColor: "rgba(97, 203, 8, 0.4)",
        borderRadius: 8,
      },
    ],
  };

  const lineData = {
    labels,
    datasets: [
      {
        label: "Growth Trend",
        data: [200, 350, 320, 500, 600, 750, 800],
        borderColor: "#4F46E5",
        backgroundColor: "rgba(16,185,129,0.1)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111",
        padding: 10,
        titleColor: "#fff",
      },
    },
    scales: {
      y: {
        grid: { color: "#eee" },
        ticks: { color: "#666" },
      },
      x: {
        ticks: { color: "#666" },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Bar Chart */}
      <div className="bg-white rounded-xl shadow p-6 w-full">
        <h3 className="font-semibold mb-3">User Growth Trend</h3>
        <Bar data={barData} options={options} />
      </div>

      {/* Line Chart */}
      <div className="bg-white rounded-xl shadow p-6 w-full">
        <h3 className="font-semibold mb-3">Revenue Trend</h3>
        <Line data={lineData} options={options} />
      </div>
    </div>
  );
};

export default UserGrowthChart;
