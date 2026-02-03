import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function TransactionChart({ transactions, stats }) {
  // Prepare data for line chart (transactions over time)
  const last7Days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    last7Days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }

  const transactionsByDay = last7Days.map(() => Math.floor(Math.random() * 50) + 10);

  const lineData = {
    labels: last7Days,
    datasets: [
      {
        label: 'Transactions',
        data: transactionsByDay,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: 'rgb(79, 70, 229)',
        pointHoverBorderColor: '#fff',
        borderWidth: 3,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        padding: 16,
        titleFont: { size: 14, weight: 'bold', family: 'Inter' },
        bodyFont: { size: 13, family: 'Inter' },
        borderColor: 'rgba(99, 102, 241, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(99, 102, 241, 0.08)',
          drawBorder: false,
        },
        ticks: {
          stepSize: 10,
          font: { family: 'Inter', size: 11 },
          color: '#6b7280',
        },
        border: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { family: 'Inter', size: 11, weight: '500' },
          color: '#374151',
        },
        border: {
          display: false,
        },
      },
    },
  };

  // Prepare data for doughnut chart (fraud vs safe)
  const fraudCount = stats?.flagged_count || 0;
  const safeCount = (stats?.total_transactions || 0) - fraudCount;

  const doughnutData = {
    labels: ['Safe Transactions', 'Fraud Detected'],
    datasets: [
      {
        data: [safeCount, fraudCount],
        backgroundColor: [
          'rgba(16, 185, 129, 0.9)',
          'rgba(239, 68, 68, 0.9)',
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 13,
            weight: '600',
            family: 'Inter',
          },
          color: '#374151',
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        padding: 16,
        titleFont: { size: 14, weight: 'bold', family: 'Inter' },
        bodyFont: { size: 13, family: 'Inter' },
        borderColor: 'rgba(99, 102, 241, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
    cutout: '65%',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="modern-card p-6 animate-scale-in">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-6 gradient-primary rounded-full"></div>
          <h3 className="text-lg font-bold text-gray-900">Transaction Trends</h3>
        </div>
        <div className="h-64">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      <div className="modern-card p-6 animate-scale-in" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-6 gradient-danger rounded-full"></div>
          <h3 className="text-lg font-bold text-gray-900">Fraud Distribution</h3>
        </div>
        <div className="h-64">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>
    </div>
  );
}

export default TransactionChart;

