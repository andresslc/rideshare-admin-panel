import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { formatDate, formatDateTime, maskPhone, formatPhoneNumber } from "../utils/helpers";
import { useAuth } from "../contexts/AuthContext";

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { hasPermission } = useAuth();

  const user = state?.user;
  if (!user || user.id !== Number(id)) return <p>User not found</p>;

  const [userData, setUserData] = useState({ ...user });
  const [isSuspended, setIsSuspended] = useState(user.isBlocked);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tripFilter, setTripFilter] = useState("all"); // all/completed/cancelled/ongoing

  const handleSuspendToggle = () => setIsSuspended(!isSuspended);

  const handleFieldChange = (field, value) =>
    setUserData({ ...userData, [field]: value });

  const handleDocumentChange = (index, field, value) => {
    const newDocs = [...userData.documents];
    newDocs[index][field] = value;
    setUserData({ ...userData, documents: newDocs });
  };

  const handleDocumentImageChange = (index, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        handleDocumentChange(index, "image", ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between py-1">
      <span className="text-gray-600 font-medium">{label}</span>
      <span className="text-gray-800">{value}</span>
    </div>
  );

  const TripStatusBadge = ({ status }) => {
    let variant = "default";
    if (status === "completed") variant = "success";
    else if (status === "cancelled") variant = "danger";
    else if (status === "ongoing") variant = "warning";
    return <Badge variant={variant}>{status.toUpperCase()}</Badge>;
  };

  const filteredTrips =
    tripFilter === "all"
      ? userData.trips
      : userData.trips.filter((t) => t.status === tripFilter);

  return (
    <div>
      <Card className="p-8 rounded-2xl shadow-xl space-y-8">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="w-fit text-gray-700 hover:bg-gray-100"
        >
          ← Back
        </Button>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 border-b pb-6">
          <div className="flex items-center gap-6">
            <div className="w-28 h-28 rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center">
              {userData.profilePicture ? (
                <img
                  src={userData.profilePicture}
                  alt={userData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-gray-500">
                  {userData.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">
                {userData.name}
              </h2>
              <span className="text-gray-600">{userData.email}</span>
            </div>
          </div>

          <div className="flex gap-2 mt-4 md:mt-0">
            <Button
              variant="default"
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-1"
            >
              Edit
            </Button>
            <Button
              variant={isSuspended ? "success" : "danger"}
              onClick={handleSuspendToggle}
              className="px-4 py-1"
            >
              {isSuspended ? "Unsuspend" : "Suspend"}
            </Button>
            <Badge
              variant={
                isSuspended
                  ? "danger"
                  : userData.status === "active"
                  ? "success"
                  : "warning"
              }
            >
              {isSuspended ? "Suspended" : userData.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Contact + Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 rounded-xl border bg-gray-50 space-y-3">
            <h3 className="text-xl font-semibold border-b pb-2">
              Contact Information
            </h3>
            <InfoRow label="Phone" value={hasPermission('seeSensitiveData') ? (formatPhoneNumber(userData.phone || userData.phoneNumber) || "—") : maskPhone(userData.phone || userData.phoneNumber || "—")} />
            <InfoRow label="Address" value={userData.address || "-"} />
            <InfoRow label="City" value={userData.city || "-"} />
            <InfoRow label="State" value={userData.state || "-"} />
            <InfoRow
              label="Registered"
              value={formatDate(userData.createdAt)}
            />
          </Card>

          <Card className="p-6 rounded-xl border bg-gray-50 space-y-3">
            <h3 className="text-xl font-semibold border-b pb-2">
              Account Stats
            </h3>
            <InfoRow label="Total Trips" value={userData.trips?.length || 0} />
            <InfoRow
              label="Last Login"
              value={
                userData.lastLogin ? formatDateTime(userData.lastLogin) : "-"
              }
            />
          </Card>
        </div>

        {/* Payment Methods */}
        <Card className="p-6 rounded-xl border bg-gray-50 space-y-3">
          <h3 className="text-xl font-semibold border-b pb-2">
            Payment Methods
          </h3>
          {userData.paymentMethods?.length ? (
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              {userData.paymentMethods.map((pm, i) => (
                <li key={i}>
                  {pm.type} • **** **** **** {pm.last4}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No payment methods</p>
          )}
        </Card>

        {/* Driver Documents + Ratings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {user.role === "driver" && (
            <Card className="p-6 rounded-xl border bg-gray-50 space-y-4">
              <h3 className="text-xl font-semibold border-b pb-2">
                Driver Documents
              </h3>
              {userData.documents?.length ? (
                <div className="grid grid-cols-1 gap-4">
                  {userData.documents.map((doc, i) => (
                    <div
                      key={i}
                      className="border rounded-lg p-3 bg-white space-y-2"
                    >
                      <div className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                        {doc.image ? (
                          <img
                            src={doc.image}
                            alt={doc.type}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-500">No Image</span>
                        )}
                      </div>
                      <InfoRow label="Type" value={doc.type} />
                      <InfoRow label="Expiry" value={formatDate(doc.expiry)} />
                      <InfoRow label="Vehicle" value={doc.vehicle} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No documents uploaded</p>
              )}
            </Card>
          )}

          {/* Ratings */}
          <Card className="p-6 rounded-xl border bg-gray-50 space-y-3 max-h-96 overflow-y-auto">
            <h3 className="text-xl font-semibold border-b pb-2">
              Ratings & Feedback
            </h3>
            {userData.ratings ? (
              <>
                <InfoRow
                  label="Average"
                  value={`${Number(userData.ratings.average || 0).toFixed(2)} ⭐ (${userData.ratings.count})`}
                />
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                  {userData.ratings.comments.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-gray-500">No feedback</p>
            )}
          </Card>
        </div>

        {/* Trip History with Filter */}
        <Card className="p-6 rounded-xl border bg-gray-50 space-y-3 overflow-x-auto">
          <h3 className="text-xl font-semibold border-b pb-2">Last 10 Trips</h3>

          {/* Trip Filter */}
          <div className="flex gap-2 mb-2">
            {["all", "completed", "cancelled", "ongoing"].map((status) => (
              <Button
                key={status}
                variant={tripFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setTripFilter(status)}
              >
                {status.toUpperCase()}
              </Button>
            ))}
          </div>

          {filteredTrips?.length ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="border-b px-4 py-2">Date</th>
                  <th className="border-b px-4 py-2">Amount</th>
                  <th className="border-b px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrips.slice(0, 10).map((trip, i) => (
                  <tr key={i} className="hover:bg-gray-100">
                    <td className="border-b px-4 py-2">
                      {formatDate(trip.date)}
                    </td>
                    <td className="border-b px-4 py-2">${trip.amount}</td>
                    <td className="border-b px-4 py-2">
                      <TripStatusBadge status={trip.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No trips found</p>
          )}
        </Card>

        {/* Recent Payments */}
        {console.log(userData, "userData")}
        <Card className="p-6 rounded-xl border bg-gray-50 space-y-3 overflow-x-auto">
          <h3 className="text-xl font-semibold border-b pb-2">
            Recent Payments
          </h3>
          {userData?.recentPayments?.length ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="border-b px-4 py-2">Date</th>
                  <th className="border-b px-4 py-2">Amount</th>
                  <th className="border-b px-4 py-2">Type</th>
                </tr>
              </thead>
              <tbody>
                {userData?.recentPayments?.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-100">
                    <td className="border-b px-4 py-2">{formatDate(p.date)}</td>
                    <td className="border-b px-4 py-2">${p.amount}</td>
                    <td className="border-b px-4 py-2">
                      <Badge
                        variant={p.type === "wallet" ? "warning" : "success"}
                      >
                        {p.type.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No recent payments</p>
          )}
        </Card>

        {/* Reported Issues */}
       {/* Reported Issues Table */}
<Card className="p-6 rounded-xl border bg-gray-50 space-y-3 overflow-x-auto">
  <h3 className="text-xl font-semibold border-b pb-2">Reported Issues</h3>
  {userData.reportedIssues?.length ? (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr>
          <th className="border-b px-4 py-2">Date</th>
          <th className="border-b px-4 py-2">Issue</th>
        </tr>
      </thead>
      <tbody>
        {userData.reportedIssues.map((issue, i) => {
          // Extract date from string (assuming your format includes date at end)
          const dateMatch = issue.match(/\d{4}-\d{2}-\d{2}/);
          const date = dateMatch ? dateMatch[0] : "-";
          const text = issue.replace(date, "").replace(/[\-:]/g, "").trim();
          return (
            <tr key={i} className="hover:bg-gray-100">
              <td className="border-b px-4 py-2">{formatDate(date)}</td>
              <td className="border-b px-4 py-2 max-w-[300px] truncate" title={text}>
                {text}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  ) : (
    <p className="text-gray-500">No reported issues</p>
  )}
</Card>

      </Card>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Edit User Details</h2>

            {/* Name & Contact */}
            <div className="space-y-3 mb-4">
              {["name", "phone", "address", "city", "state"].map((f) => (
                <div key={f}>
                  <label className="block font-medium text-gray-700">
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </label>
                  <input
                    type="text"
                    value={userData[f]}
                    onChange={(e) => handleFieldChange(f, e.target.value)}
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>
              ))}

              {/* Profile Picture */}
              <label className="block font-medium text-gray-700">
                Profile Picture
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) =>
                      handleFieldChange("profilePicture", ev.target.result);
                    reader.readAsDataURL(file);
                  }
                }}
                className="border rounded px-2 py-1 w-full"
              />
            </div>

            {/* Driver Documents */}
            {user.role === "driver" && (
              <div className="space-y-4 mb-4">
                <h3 className="text-lg font-semibold">Driver Documents</h3>
                {userData.documents.map((doc, i) => (
                  <div
                    key={i}
                    className="border rounded-lg p-3 bg-gray-50 space-y-2"
                  >
                    {["type", "vehicle"].map((f) => (
                      <div key={f}>
                        <label className="block font-medium text-gray-700">
                          {f.charAt(0).toUpperCase() + f.slice(1)}
                        </label>
                        <input
                          type="text"
                          value={doc[f]}
                          onChange={(e) =>
                            handleDocumentChange(i, f, e.target.value)
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                      </div>
                    ))}
                    <label className="block font-medium text-gray-700">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={doc.expiry}
                      onChange={(e) =>
                        handleDocumentChange(i, "expiry", e.target.value)
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                    <label className="block font-medium text-gray-700">
                      Upload Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleDocumentImageChange(i, e.target.files[0])
                      }
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Modal Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={() => setIsEditModalOpen(false)}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetailPage;
