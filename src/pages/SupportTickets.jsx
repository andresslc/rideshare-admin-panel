import { useState } from "react";
import DataTable from "../components/common/DataTable";
import Badge from "../components/ui/Badge";
import { useNavigate } from "react-router-dom";
import { formatPhoneNumber } from "../utils/helpers";

const SupportTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([
    {
      id: "REP-001",
      submittedBy: {
        id: 101,
        type: "user",
        name: "John Doe",
        contact: "john@example.com",
      },
      reportedAgainst: {
        id: 501,
        type: "driver",
        name: "Driver Zack",
      },
      datetime: "2024-01-20T10:30:00Z",
      rideReference: "RIDE-88421",
      description:
        "Driver arrived late and vehicle was not clean. Please check.",
      attachments: [
        "/uploads/ride_screenshot_1.png",
        "/uploads/ride_screenshot_2.png",
      ],
      status: "open",
      priority: "medium",
      category: "Safety Concern",
      responses: [],
    },

    {
      id: "REP-002",
      submittedBy: {
        id: 203,
        type: "driver",
        name: "Driver Ahmed",
        contact: "+923112223344",
      },
      reportedAgainst: {
        id: 301,
        type: "rider",
        name: "Ausitin",
      },
      datetime: "2024-01-21T14:10:00Z",
      rideReference: null,
      description: "Rider was rude and refused to pay cash.",
      attachments: [],
      status: "in_progress",
      priority: "high",
      category: "Payment / Transaction Issue",
      responses: [
        {
          id: 1,
          author: "Admin",
          isAdmin: true,
          message: "We are reviewing this case.",
          createdAt: "2024-01-21T15:00:00Z",
        },
      ],
    },
  ]);
  const categories = [
    "Safety Concern",
    "Payment / Transaction Issue",
    "Technical / App Bug",
    "Unprofessional Behavior",
    "Other",
  ];

  const [activeTab, setActiveTab] = useState("rider");

  const handleStatusMenu = (ticket) => {
    const status = prompt(
      "Enter new status: open | in_progress | resolved | closed"
    );

    if (!status) return;

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticket.id
          ? { ...t, status, updatedAt: new Date().toISOString() }
          : t
      )
    );
  };

  const columns = [
    {
      key: "id",
      label: "Report ID",
      render: (value) => <span className="font-mono">{value}</span>,
    },
    {
      key: "submittedBy",
      label: "Submitted By",
      render: (submittedBy) => (
        <div>
          <p className="font-medium">{submittedBy.name}</p>
          <p className="text-sm text-gray-500">
            {submittedBy.type.toUpperCase()} — {submittedBy.contact ? (!submittedBy.contact.includes("@") ? formatPhoneNumber(submittedBy.contact) : submittedBy.contact) : "—"}
          </p>
        </div>
      ),
    },
    {
      key: "reportedAgainst",
      label: "Reported Against",
      render: (reportedAgainst) =>
        reportedAgainst ? (
          <div>
            <p className="font-medium">{reportedAgainst.name}</p>
            <p className="text-sm text-gray-500">
              {reportedAgainst.type.toUpperCase()}
            </p>
          </div>
        ) : (
          <span className="text-gray-400">N/A</span>
        ),
    },
    {
      key: "rideReference",
      label: "Ride Ref",
      render: (value) => value || "—",
    },
    {
      key: "datetime",
      label: "Submitted",
      render: (value) => (
        <div>
          <p>{new Date(value).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">
            {new Date(value).toLocaleTimeString()}
          </p>
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (value) => (
        <p className="truncate max-w-xs text-gray-700">{value}</p>
      ),
    },
    {
      key: "attachments",
      label: "Attachments",
      render: (files) =>
        files?.length > 0 ? (
          <span className="text-blue-600 cursor-pointer">
            {files.length} file(s)
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => <Badge variant="success">{value}</Badge>,
    },
    {
      key: "category",
      label: "Category",
      render: (value) => (
        <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-600">
          {value}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      render: (_, ticket) => (
        <div className="flex space-x-2">
          <button
            onClick={() =>
              navigate(`/reports-detail/${ticket.id}`, { state: { ticket } })
            }
            className="text-green-600 hover:underline"
          >
            View
          </button>
        </div>
      ),
    },
  ];
  const filteredTickets = tickets.filter((t) => {
    if (activeTab === "driver") {
      return t.submittedBy.type === "driver";
    }
    if (activeTab === "rider" || activeTab === "user") {
      return t.submittedBy.type === "user";
    }
    return true; // default
  });

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b pb-2">
        {["rider", "driver"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 font-semibold ${
              activeTab === tab
                ? "border-b-4 border-green-600 text-green-600"
                : "text-gray-600"
            }`}
          >
            {tab === "driver" ? "Driver Reports" : "Rider Reports"}
          </button>
        ))}
      </div>

      {/* Tickets Table */}
      {(() => {
        var filteredTickets = tickets.filter((t) => {
          if (activeTab === "driver") return t.submittedBy.type === "driver";
          if (activeTab === "rider") return t.submittedBy.type === "user";
          return true;
        });

        return (
          <DataTable
            title="Reports Management"
            data={filteredTickets}
            columns={columns}
            searchable={false}
            filterable={false}
            exportable={true}
            addButton={false}
          />
        );
      })()}

      {/* Ticket Detail Modal */}

      {/* Reply Modal */}
    </div>
  );
};

export default SupportTickets;
