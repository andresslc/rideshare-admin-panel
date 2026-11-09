import React, { useEffect, useMemo } from "react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { useForm } from "react-hook-form";
import { useApp } from "../contexts/AppContext";
import useAppConfigsActions from "../hooks/app-configs/useAppConfigsActions";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

const Configurations = () => {
  const { appConfigs } = useApp();
  const { loading, updateAppConfigs } = useAppConfigsActions();

  const defaultValues = useMemo(() => {
    return {
      pickupAddress: appConfigs?.pickupAddress || "",
      shippingCost: appConfigs?.shippingCost || 0,
    };
  }, [appConfigs]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({ defaultValues });

  useEffect(() => {
    if (appConfigs) {
      reset({
        pickupAddress: appConfigs?.pickupAddress || "",
        shippingCost: appConfigs?.shippingCost || 0,
      });
    }
  }, [appConfigs, reset]);

  const onSubmit = (data) => {
    // if (data.shippingCost < 0) {
    //   toast.error("Shipping cost cannot be negative");
    //   return;
    // }

    if (
      // data.shippingCost === appConfigs.shippingCost &&
      data.pickupAddress === appConfigs.pickupAddress
    ) {
      setError(
        "pickupAddress",
        { message: "No Change in Pickup Address" },
        {
          shouldFocus: true,
        }
      );
      return;
    }

    updateAppConfigs(data);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Configurations
      </h1>

      <Card className="mt-6">
        <Card.Header>
          <p className="text-gray-700 dark:text-gray-300">
            Skylaboo Configurations
          </p>
        </Card.Header>

        <Card.Content>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Pickup Address"
                {...register("pickupAddress", {
                  required: "Pickup address is required",
                })}
                disabled={loading}
                error={errors.pickupAddress?.message}
              />

              {/* <Input
                label="Shipping Cost"
                type="number"
                {...register("shippingCost", {
                  required: "Shipping cost is required",
                })}
                disabled={loading}
                error={errors.shippingCost?.message}
              /> */}
            </div>

            <div className="w-full flex justify-end">
              <Button
                type="submit"
                className="h-10 flex items-center gap-2"
                disabled={loading}
              >
                {loading
                  ? "Updating Configurations..."
                  : "Update Configurations"}
              </Button>
            </div>
          </form>

          <Card.Footer>
            These configurations will affect the entire application and the
            end-user.
          </Card.Footer>
        </Card.Content>
      </Card>
    </div>
  );
};

export default Configurations;
