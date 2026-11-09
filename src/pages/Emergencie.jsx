import { useState } from "react";
import Button from "../components/ui/Button";
import EmergencyDetails from "./EmergencyDetails";
import Badge from "../components/ui/Badge";
import { getStatusVariant, formatPhoneNumber } from "../utils/helpers";

const emergencyData = [
  {
    alertId: "EMG-001",
    rider: { name: "Jhon", userId: "R234", phone: "1111-111111" },
    driver: {
      name: "Doe",
      driverId: "D882",
      vehicle: "Honda City",
      phone: "1111-111111",
    },
    location: { lat: 24.9200172, lng: 67.0612345 },
    rideStatus: "ongoing",
    timestamp: "2025-01-25T09:22:00Z",
    status: "Resolved",
  },
];

export default function Emergencies() {
  const [selectedCase, setSelectedCase] = useState(null);

  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-6">Emergency Cases</h2>

      <div className="bg-white shadow rounded-lg p-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Alert ID</th>
              <th className="p-3">Rider Info</th>
              <th className="p-3">Driver Info</th>
              <th className="p-3">Ride Status</th>
              <th className="p-3">Time</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {emergencyData.map((item) => (
              <tr key={item.alertId} className="border-b">
                <td className="p-3 font-semibold max-w-[150px] truncate" title={item.alertId}>{item.alertId}</td>

                <td className="p-3 max-w-[200px]" title={`${item.rider.name} - ${formatPhoneNumber(item.rider.phone)}`}>
                  <div className="truncate font-medium">{item.rider.name}</div>
                  <div className="text-sm text-gray-500 truncate">
                    {formatPhoneNumber(item.rider.phone)}
                  </div>
                </td>

                <td className="p-3 max-w-[200px]" title={`${item.driver.name} - ${formatPhoneNumber(item.driver.phone)}`}>
                  <div className="truncate font-medium">{item.driver.name}</div>
                  <div className="text-sm text-gray-500 truncate">
                    {formatPhoneNumber(item.driver.phone)}
                  </div>
                </td>

                <td className="p-3 capitalize">{item.rideStatus}</td>

                <td className="p-3">
                  {new Date(item.timestamp).toLocaleString()}
                </td>

                <td className="p-3">
                  <Badge variant={getStatusVariant(item.status)}>
                    {item.status}
                  </Badge>
                </td>

                <td className="p-3 text-center">
                  <Button onClick={() => setSelectedCase(item)}>View</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCase && (
        <EmergencyDetails
          data={selectedCase}
          onClose={() => setSelectedCase(null)}
        />
      )}
    </div>
  );
}
