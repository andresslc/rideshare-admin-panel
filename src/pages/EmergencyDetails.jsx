import { useState } from "react";
import TextArea from "../components/ui/TextArea";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { getStatusVariant, formatPhoneNumber } from "../utils/helpers";

export default function EmergencyDetails({ data, onClose }) {
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-0 bg-black/40 flex  items-center justify-center p-6 z-50">
      <div className="bg-white w-full max-w-3xl h-[600px] overflow-auto rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Emergency Details</h3>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Header */}
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-5">
          <h4 className="text-lg font-semibold text-red-700 mb-2">
            Alert ID: {data.alertId}
          </h4>
          <p className="text-sm text-gray-700">
            Time: {new Date(data.timestamp).toLocaleString()}
          </p>
          <Badge variant={getStatusVariant(data.status)}>{data.status}</Badge>
        </div>

        {/* Rider & Driver */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded">
            <h4 className="font-bold mb-1">Rider Info</h4>
            <p>{data.rider.name}</p>
            <p className="text-sm text-gray-600">{formatPhoneNumber(data.rider.phone)}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded">
            <h4 className="font-bold mb-1">Driver Info</h4>
            <p>{data.driver.name}</p>
            <p className="text-sm text-gray-600">{formatPhoneNumber(data.driver.phone)}</p>
          </div>
        </div>

        {/* Map View */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2">Location</h4>
          <div className="w-full h-64 bg-gray-300 rounded-lg flex items-center justify-center">
            <span>
              Map View (Lat: {data.location.lat}, Lng: {data.location.lng})
            </span>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <h4 className="font-semibold mb-1">Admin Notes</h4>
          <TextArea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add note about incident..."
          />
          <Button className="mt-2">Save Note</Button>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
        
          <Button variant="danger">Suspend Driver</Button>
        </div>
      </div>
    </div>
  );
}
