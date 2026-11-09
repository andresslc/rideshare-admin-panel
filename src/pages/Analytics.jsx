import { useState } from "react";
import {
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Calendar,
  Download,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { formatCurrency, formatPercent } from "../utils/helpers";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Select from "../components/ui/Select";
import { CHART_COLORS } from "../config/constants";

const Analytics = () => {
  const [dateRange, setDateRange] = useState("7d");

  // Sample data - in real app, this would come from API
  const [userGrowthData] = useState([
    { date: "2024-01-01", users: 1200, newUsers: 45, activeUsers: 890 },
    { date: "2024-01-02", users: 1245, newUsers: 52, activeUsers: 920 },
    { date: "2024-01-03", users: 1297, newUsers: 38, activeUsers: 950 },
    { date: "2024-01-04", users: 1335, newUsers: 67, activeUsers: 980 },
    { date: "2024-01-05", users: 1402, newUsers: 58, activeUsers: 1020 },
    { date: "2024-01-06", users: 1460, newUsers: 49, activeUsers: 1050 },
    { date: "2024-01-07", users: 1509, newUsers: 71, activeUsers: 1100 },
  ]);

  const [revenueData] = useState([
    { month: "Jan", revenue: 45000, subscriptions: 320, oneTime: 12000 },
    { month: "Feb", revenue: 52000, subscriptions: 380, oneTime: 15000 },
    { month: "Mar", revenue: 48000, subscriptions: 350, oneTime: 13500 },
    { month: "Apr", revenue: 61000, subscriptions: 420, oneTime: 18000 },
    { month: "May", revenue: 55000, subscriptions: 390, oneTime: 16500 },
    { month: "Jun", revenue: 67000, subscriptions: 450, oneTime: 21000 },
  ]);

  const [deviceData] = useState([
    { name: "Desktop", value: 45, color: CHART_COLORS.primary },
    { name: "Mobile", value: 35, color: CHART_COLORS.secondary },
    { name: "Tablet", value: 20, color: CHART_COLORS.info },
  ]);

  const [trafficSources] = useState([
    { source: "Direct", visitors: 3200, percentage: 35 },
    { source: "Google", visitors: 2800, percentage: 30 },
    { source: "Social Media", visitors: 1800, percentage: 20 },
    { source: "Email", visitors: 900, percentage: 10 },
    { source: "Referral", visitors: 450, percentage: 5 },
  ]);

  const [topPages] = useState([
    { page: "/dashboard", views: 12500, uniqueViews: 8900, bounceRate: 25 },
    { page: "/profile", views: 8900, uniqueViews: 6700, bounceRate: 30 },
    { page: "/settings", views: 6700, uniqueViews: 5200, bounceRate: 35 },
    { page: "/billing", views: 4500, uniqueViews: 3800, bounceRate: 20 },
    { page: "/support", views: 3200, uniqueViews: 2900, bounceRate: 40 },
  ]);

  const handleExport = () => {
    // Generate CSV export
    const csvData = [
      ["Date", "Total Users", "New Users", "Active Users"],
      ...userGrowthData.map((row) => [
        row.date,
        row.users,
        row.newUsers,
        row.activeUsers,
      ]),
    ];

    const csv = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analytics-report.csv";
    a.click();
  };

  // Calculate key metrics
  const totalUsers = userGrowthData[userGrowthData.length - 1]?.users || 0;
  const newUsersToday =
    userGrowthData[userGrowthData.length - 1]?.newUsers || 0;
  const activeUsersToday =
    userGrowthData[userGrowthData.length - 1]?.activeUsers || 0;
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const avgRevenue = totalRevenue / revenueData.length;

  const rawGrowthRate =
    userGrowthData.length > 1
      ? ((userGrowthData[userGrowthData.length - 1].users -
          userGrowthData[0].users) /
          userGrowthData[0].users) *
        100
      : 0;
  const userGrowthRate = formatPercent(rawGrowthRate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your application's performance and user engagement
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            options={[
              { value: "7d", label: "Last 7 days" },
              { value: "30d", label: "Last 30 days" },
              { value: "90d", label: "Last 90 days" },
              { value: "1y", label: "Last year" },
            ]}
            className="px-3 py-2 text-sm"
          />
          <Button
            variant="outline"
            onClick={handleExport}
            icon={<Download className="w-4 h-4" />}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Users
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {totalUsers.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 mt-1">
                +{userGrowthRate} growth
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                New Users Today
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {newUsersToday}
              </p>
              <p className="text-sm text-green-600 mt-1">+12% from yesterday</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Users
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {activeUsersToday.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 mt-1">+8% from last week</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg Monthly Revenue
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(avgRevenue)}
              </p>
              <p className="text-sm text-green-600 mt-1">
                +15% from last month
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <DollarSign className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <Card.Header>
            <Card.Title>User Growth Over Time</Card.Title>
          </Card.Header>
          <Card.Content>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString()
                  }
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString()
                  }
                  formatter={(value, name) => [value.toLocaleString(), name]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="users"
                  stackId="1"
                  stroke={CHART_COLORS.primary}
                  fill={CHART_COLORS.primary}
                  fillOpacity={0.6}
                  name="Total Users"
                />
                <Area
                  type="monotone"
                  dataKey="activeUsers"
                  stackId="2"
                  stroke={CHART_COLORS.secondary}
                  fill={CHART_COLORS.secondary}
                  fillOpacity={0.6}
                  name="Active Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card.Content>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <Card.Header>
            <Card.Title>Monthly Revenue</Card.Title>
          </Card.Header>
          <Card.Content>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar
                  dataKey="subscriptions"
                  stackId="a"
                  fill={CHART_COLORS.primary}
                  name="Subscriptions"
                />
                <Bar
                  dataKey="oneTime"
                  stackId="a"
                  fill={CHART_COLORS.secondary}
                  name="One-time Payments"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card.Content>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Usage */}
        <Card>
          <Card.Header>
            <Card.Title>Device Usage</Card.Title>
          </Card.Header>
          <Card.Content>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card.Content>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <Card.Header>
            <Card.Title>Traffic Sources</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {trafficSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {source.source}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {source.visitors.toLocaleString()}
                    </span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full"
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                      {source.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Top Pages Table */}
      <Card>
        <Card.Header>
          <Card.Title>Top Pages</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3">Page</th>
                  <th className="px-6 py-3">Page Views</th>
                  <th className="px-6 py-3">Unique Views</th>
                  <th className="px-6 py-3">Bounce Rate</th>
                </tr>
              </thead>
              <tbody>
                {topPages.map((page, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    <td
                      className="px-6 py-4 font-medium text-gray-900 dark:text-white max-w-[200px] truncate"
                      title={page.page}
                    >
                      {page.page}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {page.views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {page.uniqueViews.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          page.bounceRate < 30
                            ? "bg-green-100 text-green-800"
                            : page.bounceRate < 40
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {page.bounceRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default Analytics;
