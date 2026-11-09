import { useState } from "react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const ContentManagement = () => {
  const [pricing, setPricing] = useState({
    baseFare: 50,
    perMileRate: 10,
    perMinuteRate: 2,
    surgeMultiplier: 1,
    cancellationFee: 5,
    instantWithdrawalFee: 1,
  });

  const handleChange = (key, value) => {
    setPricing((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const handleSave = () => {
    // console.log("Updated Pricing Settings:", pricing);
    
    // TODO: Call API to save settings in backend
  };

  return (
    <div className="space-y-6   mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
        Content Management - Pricing
      </h2>

      <Card className="space-y-6 p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <p className="text-gray-600 dark:text-gray-300">
          Update your platform's fare settings and fees. All changes will be
          applied immediately after saving.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Base Fare"
            type="number"
            value={pricing.baseFare}
            onChange={(e) => handleChange("baseFare", e.target.value)}
            className="bg-gray-50 dark:bg-gray-700"
          />
          <Input
            label="Per Mile Rate"
            type="number"
            value={pricing.perMileRate}
            onChange={(e) => handleChange("perMileRate", e.target.value)}
            className="bg-gray-50 dark:bg-gray-700"
          />
          <Input
            label="Per Minute Rate"
            type="number"
            value={pricing.perMinuteRate}
            onChange={(e) => handleChange("perMinuteRate", e.target.value)}
            className="bg-gray-50 dark:bg-gray-700"
          />
          <Input
            label="Surge Multiplier"
            type="number"
            step="0.1"
            value={pricing.surgeMultiplier}
            onChange={(e) => handleChange("surgeMultiplier", e.target.value)}
            className="bg-gray-50 dark:bg-gray-700"
          />
          <Input
            label="Cancellation Fee"
            type="number"
            value={pricing.cancellationFee}
            onChange={(e) => handleChange("cancellationFee", e.target.value)}
            className="bg-gray-50 dark:bg-gray-700"
          />
          <Input
            label="Instant Withdrawal Fee (%)"
            type="number"
            value={pricing.instantWithdrawalFee}
            onChange={(e) =>
              handleChange("instantWithdrawalFee", e.target.value)
            }
            className="bg-gray-50 dark:bg-gray-700"
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            variant="primary"
            className="px-6 py-2 text-lg"
          >
            Save Settings
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ContentManagement;
