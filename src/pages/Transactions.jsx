import { useState } from "react";
import {
  Eye,
  Download,
  RefreshCw,
  CreditCard,
  TrendingUp,
  DollarSign,
  Calendar,
  Clock,
} from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import FilterBar from "../components/ui/FilterBar";
import Popup from "../components/ui/Popup";
import { formatCurrency, formatDateTime } from "../utils/helpers";
import { CHART_COLORS, TRANSACTION_STATUS } from "../config/constants";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { usePersistentState } from "../hooks/global/usePersistentState";

const Transactions = () => {
  const [transactions, setTransactions] = useState([
    {
      id: "TXN001",
      userId: 1,
      userName: "John Doe",
      userEmail: "john@example.com",
      amount: 299.99,
      currency: "USD",
      status: "completed",
      type: "payment",
      description: "Premium subscription",
      stripeTransactionId: "pi_1234567890",
      createdAt: "2024-01-20T14:30:00Z",
      completedAt: "2024-01-20T14:31:00Z",
      fees: 8.99,
      netAmount: 291.0,
    },
    {
      id: "TXN002",
      userId: 2,
      userName: "Jane Smith",
      userEmail: "jane@example.com",
      amount: 149.99,
      currency: "USD",
      status: "pending",
      type: "payment",
      description: "Basic subscription",
      stripeTransactionId: "pi_0987654321",
      createdAt: "2024-01-20T13:15:00Z",
      completedAt: null,
      fees: 4.5,
      netAmount: 145.49,
    },
    {
      id: "TXN003",
      userId: 3,
      userName: "Bob Johnson",
      userEmail: "bob@example.com",
      amount: 99.99,
      currency: "USD",
      status: "failed",
      type: "payment",
      description: "One-time purchase",
      stripeTransactionId: "pi_1122334455",
      createdAt: "2024-01-20T12:00:00Z",
      completedAt: null,
      fees: 0,
      netAmount: 0,
    },
    {
      id: "TXN004",
      userId: 1,
      userName: "John Doe",
      userEmail: "john@example.com",
      amount: -50.0,
      currency: "USD",
      status: "completed",
      type: "refund",
      description: "Partial refund",
      stripeTransactionId: "re_1234567890",
      createdAt: "2024-01-19T16:45:00Z",
      completedAt: "2024-01-19T16:46:00Z",
      fees: -1.5,
      netAmount: -48.5,
    },
  ]);

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = usePersistentState("transactions_filters", {
    status: "",
    type: "",
    dateRange: { start: "", end: "" },
  });

  const [showRefundPopup, setShowRefundPopup] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundTransaction, setRefundTransaction] = useState(null);

  // Revenue analytics data
  const [revenueData] = useState([
    { date: "2024-01-01", revenue: 12500, transactions: 45 },
    { date: "2024-01-02", revenue: 15200, transactions: 52 },
    { date: "2024-01-03", revenue: 11800, transactions: 38 },
    { date: "2024-01-04", revenue: 18900, transactions: 67 },
    { date: "2024-01-05", revenue: 16400, transactions: 58 },
    { date: "2024-01-06", revenue: 14300, transactions: 49 },
    { date: "2024-01-07", revenue: 19800, transactions: 71 },
  ]);

  const columns = [
    {
      key: "id",
      label: "Transaction ID",

      render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: "userName",
      label: "Customer",

      render: (value, transaction) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500">{transaction.userEmail}</p>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",

      render: (value, transaction) => (
        <div className="text-right">
          <p
            className={`font-semibold ${
              value < 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {formatCurrency(Math.abs(value))}
          </p>
          <p className="text-xs text-gray-500">
            Net: {formatCurrency(Math.abs(transaction.netAmount))}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (value) => (
        <Badge variant={value === "refund" ? "warning" : "info"}>{value}</Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        const s = (value || "").toLowerCase();
        let variant = "default";
        if (s === "completed" || s === "paid" || s === "succeeded" || s === "success") {
          variant = "success";
        } else if (s === "pending" || s === "processing" || s === "hold" || s === "in_escrow") {
          variant = "warning";
        } else if (s === "failed" || s === "declined" || s === "cancelled" || s === "canceled") {
          variant = "danger";
        } else if (s === "refunded" || s === "refund" || s === "reversed") {
          variant = "info";
        }
        return (
          <Badge variant={variant} className="capitalize">
            {value}
          </Badge>
        );
      },
    },
    {
      key: "createdAt",
      label: "Date",
      render: (value) => (
        <div>
          <p className="text-sm">{new Date(value).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">
            {new Date(value).toLocaleTimeString()}
          </p>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, transaction) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(transaction)}
            icon={<Eye className="w-4 h-4" />}
            title="View Details"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownloadReceipt(transaction)}
            icon={<Download className="w-4 h-4" />}
            title="Download Receipt"
          />
          {transaction.status === "completed" &&
            transaction.type === "payment" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRefund(transaction)}
                icon={<RefreshCw className="w-4 h-4" />}
                title="Process Refund"
              />
            )}
        </div>
      ),
    },
  ];

  const handleView = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleDownloadReceipt = (transaction) => {
    // Generate and download receipt
    alert(`Downloading receipt for ${transaction.id}`);
  };

  const handleRefund = (transaction) => {
    setRefundTransaction(transaction);
    setShowRefundPopup(true);
  };

  const processRefund = async () => {
    setRefundLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefundLoading(false);
    setShowRefundPopup(false);
    setRefundTransaction(null);
  };

  // Calculate stats
  const totalRevenue = transactions
    .filter((t) => t.status === "completed" && t.type === "payment")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRefunds = Math.abs(
    transactions
      .filter((t) => t.status === "completed" && t.type === "refund")
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const pendingAmount = transactions
    .filter((t) => t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFees = transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.fees), 0);

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    if (filters.status && transaction.status !== filters.status) return false;
    if (filters.type && transaction.type !== filters.type) return false;
    if (
      filters.dateRange.start &&
      new Date(transaction.createdAt) < new Date(filters.dateRange.start)
    )
      return false;
    if (
      filters.dateRange.end &&
      new Date(transaction.createdAt) > new Date(filters.dateRange.end)
    )
      return false;
    return true;
  });

  return (
    <>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending Amount
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(pendingAmount)}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Refunds
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalRefunds)}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <RefreshCw className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Processing Fees
                </p>
                <p className="text-2xl font-bold text-gray-600">
                  {formatCurrency(totalFees)}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Revenue Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <Card.Header>
              <Card.Title>Daily Revenue</Card.Title>
            </Card.Header>
            <Card.Content>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), "Revenue"]}
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    fill={CHART_COLORS.secondary}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.secondary, strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Daily Transactions</Card.Title>
            </Card.Header>
            <Card.Content>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [value, "Transactions"]}
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                  />
                  <Bar dataKey="transactions" fill={CHART_COLORS.primary} />
                </BarChart>
              </ResponsiveContainer>
            </Card.Content>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <FilterBar
            filters={[
              {
                key: "status",
                label: "Status",
                type: "select",
                value: filters.status,
                onChange: (value) =>
                  setFilters((prev) => ({ ...prev, status: value })),
                options: [
                  { value: "completed", label: "Completed" },
                  { value: "pending", label: "Pending" },
                  { value: "failed", label: "Failed" },
                ],
              },
              {
                key: "type",
                label: "Type",
                type: "select",
                value: filters.type,
                onChange: (value) =>
                  setFilters((prev) => ({ ...prev, type: value })),
                options: [
                  { value: "payment", label: "Payment" },
                  { value: "refund", label: "Refund" },
                ],
              },
              {
                key: "startDate",
                label: "Start Date",
                type: "date",
                value: filters.dateRange.start,
                onChange: (value) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: value },
                  })),
              },
              {
                key: "endDate",
                label: "End Date",
                type: "date",
                value: filters.dateRange.end,
                onChange: (value) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: value },
                  })),
              },
            ]}
            onClear={() =>
              setFilters({
                status: "",
                type: "",
                dateRange: { start: "", end: "" },
              })
            }
          />
        </Card>

        {/* Transactions Table */}
        <DataTable
          title="Transaction History"
          data={filteredTransactions}
          columns={columns}
          searchable={true}
          filterable={false}
          exportable={true}
          addButton={false}
        />

        {/* Transaction Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Transaction Details"
          size="lg"
        >
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Transaction Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedTransaction.id}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedTransaction.description}
                  </p>
                </div>
                <Badge
                  variant={
                    selectedTransaction.status === "completed"
                      ? "success"
                      : selectedTransaction.status === "pending"
                      ? "warning"
                      : selectedTransaction.status === "failed"
                      ? "danger"
                      : "default"
                  }
                >
                  {selectedTransaction.status}
                </Badge>
              </div>

              {/* Transaction Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Customer Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Name
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedTransaction.userName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Email
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedTransaction.userEmail}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        User ID
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedTransaction.userId}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Payment Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Amount
                      </label>
                      <p
                        className={`text-lg font-semibold ${
                          selectedTransaction.amount < 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {formatCurrency(Math.abs(selectedTransaction.amount))}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Processing Fee
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {formatCurrency(Math.abs(selectedTransaction.fees))}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Net Amount
                      </label>
                      <p className="text-gray-900 dark:text-white font-semibold">
                        {formatCurrency(
                          Math.abs(selectedTransaction.netAmount)
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Stripe Transaction ID
                      </label>
                      <p className="text-gray-900 dark:text-white font-mono text-sm">
                        {selectedTransaction.stripeTransactionId}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Timeline
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Transaction Created</p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(selectedTransaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  {selectedTransaction.completedAt && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">
                          Transaction Completed
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(selectedTransaction.completedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleDownloadReceipt(selectedTransaction)}
                  icon={<Download className="w-4 h-4" />}
                >
                  Download Receipt
                </Button>
                {selectedTransaction.status === "completed" &&
                  selectedTransaction.type === "payment" && (
                    <Button
                      variant="danger"
                      onClick={() => {
                        handleRefund(selectedTransaction);
                        setShowDetailModal(false);
                      }}
                      icon={<RefreshCw className="w-4 h-4" />}
                    >
                      Process Refund
                    </Button>
                  )}
              </div>
            </div>
          )}
        </Modal>
      </div>

      <Popup
        open={showRefundPopup}
        onClose={() => {
          if (!refundLoading) {
            setShowRefundPopup(false);
            setRefundTransaction(null);
          }
        }}
        type="confirm"
        title="Confirm Refund"
        message={
          refundTransaction
            ? `Are you sure you want to process a refund for ${refundTransaction.id}?`
            : "Are you sure you want to process a refund?"
        }
        confirmText="Yes, Refund"
        cancelText="No"
        onConfirm={processRefund}
        showCloseButton={!refundLoading}
      />
    </>
  );
};

export default Transactions;
