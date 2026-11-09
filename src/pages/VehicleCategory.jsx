import { useMemo, useState } from "react";
import {
  Edit,
  Trash2,
  Car,
  ShieldCheck,
  ShieldX,
  Plus,
  Loader2,
} from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import TextArea from "../components/ui/TextArea";
import Select from "../components/ui/Select";
import { useForm, Controller } from "react-hook-form";
import { formatDate } from "../utils/helpers";
import Card from "../components/ui/Card";
import FilterBar from "../components/ui/FilterBar";
import { PAGINATION_CONFIG } from "../config/constants";
import useGetAllVehicleTypes from "../hooks/vehicle-types/useGetAllVehicleTypes";
import useCreateVehicleType from "../hooks/vehicle-types/useCreateVehicleType";
import useVehicleTypeActions from "../hooks/vehicle-types/useVehicleTypeActions";
import useDebounce from "../hooks/global/useDebounce";
import { useEffect } from "react";

const VehicleCategoryManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.defaultPageSize);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [rideType, setRideType] = useState("");

  const { loading, vehicleTypes, totalPages, totalData, getAllVehicleTypes } =
    useGetAllVehicleTypes(
      currentPage,
      pageSize,
      debouncedSearch,
      rideType?.target?.value,
    );

  // Reset page when search or rideType changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, rideType]);

  const { loading: loadingCreate, createVehicleType } = useCreateVehicleType();
  const {
    loading: loadingActions,
    updateVehicleType,
    deleteVehicleType,
  } = useVehicleTypeActions();

  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  const defaultValues = {
    model: "",
    rideType: "economy",
    notes: "",
    isActive: "true",
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({ defaultValues });

  const columns = [
    // {
    //   key: "make",
    //   label: "Make",
    //   render: (value) => <span className="capitalize">{value}</span>,
    // },
    {
      key: "model",
      label: "Model",
      render: (value) => <span className="capitalize">{value}</span>,
    },
    {
      key: "rideType",
      label: "Ride Type",
      render: (value) => (
        <Badge variant={ "secondary"}>
          <span className="capitalize">{value}</span>
        </Badge>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (isActive) => (
        <Badge variant={isActive ? "success" : "danger"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "notes",
      label: "Notes",
      render: (value) => (
        <span className="text-xs text-gray-500 max-w-[200px] truncate block">
          {value || "N/A"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (value) => formatDate(value),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, vehicle) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(vehicle)}
            icon={<Edit className="w-4 h-4" />}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setVehicleToDelete(vehicle);
              setShowDeleteModal(true);
            }}
            disabled={loadingActions}
            icon={<Trash2 className="w-4 h-4 text-red-500" />}
          />
        </div>
      ),
    },
  ];

  const handlePageChange = (page) => {
    if (page) setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    if (size) {
      setCurrentPage(1);
      setPageSize(size);
    }
  };

  const handleAdd = () => {
    reset(defaultValues);
    setEditingVehicle(null);
    setShowModal(true);
  };

  const handleEdit = (vehicle) => {
    const formattedVehicle = {
      ...vehicle,
      isActive: JSON.stringify(vehicle.isActive),
    };
    setEditingVehicle(formattedVehicle);
    reset(formattedVehicle);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!vehicleToDelete) return;
    const success = await deleteVehicleType(vehicleToDelete._id);
    if (success) {
      setShowDeleteModal(false);
      setVehicleToDelete(null);
      getAllVehicleTypes();
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    reset(defaultValues);
  };

  const onSubmit = async (data) => {
    try {
      // Check for duplicate model name on the frontend
      const isDuplicate = vehicleTypes?.some(
        (v) => v.model.toLowerCase().trim() === data.model.toLowerCase().trim() && v._id !== editingVehicle?._id
      );

      if (isDuplicate) {
        setError("model", {
          type: "manual",
          message: "This vehicle model already exists.",
        });
        return;
      }

      if (editingVehicle) {
        const payload = {
          rideType: data.rideType,
          isActive: data.isActive === "true",
          notes: data.notes,
          model:data.model
        };
        const success = await updateVehicleType(editingVehicle._id, payload);
        if (success) {
          handleModalClose();
          getAllVehicleTypes();
        }
      } else {
        const payload = {
          ...data,
          isActive: data.isActive === "true",
        };
        const success = await createVehicleType(payload);
        if (success) {
          handleModalClose();
          getAllVehicleTypes();
        }
      }
    } catch (error) {
      console.error("Error saving vehicle type:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Vehicle Category Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage vehicle types and mapping for your fleet
          </p>
        </div>
        <Button
          onClick={handleAdd}
          icon={<Plus className="w-4 h-4" />}
          className="bg-green-600 hover:bg-green-700"
        >
          Create Vehicle
        </Button>
      </div>

      <Card className="p-4">
        <FilterBar
          filters={[
            {
              key: "rideType",
              label: "Ride Type",
              type: "select",
              value: rideType?.target?.value,
              onChange: setRideType,
              options: [
                { value: "economy", label: "Economy" },
                { value: "luxury", label: "Luxury" },
                // { value: "carpool", label: "Car Pool" },
              ],
            },
          ]}
          onClear={() => {
            setSearch("");
            setRideType("");
          }}
          searchPlaceholder="Search by model..."
          searchable={true}
          searchValue={search}
          onSearchChange={setSearch}
        />
      </Card>

      <DataTable
        title="Vehicle Types"
        loading={loading}
        data={vehicleTypes}
        columns={columns}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        totalPages={totalPages}
        totalData={totalData}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={editingVehicle ? "Edit Vehicle" : "Create Vehicle"}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Model"
              placeholder="e.g. Camry"
              {...register("model", { required: "Model is required" })}
              disabled={loadingCreate || loadingActions }
              error={errors.model?.message}
            />

            <Controller
              name="rideType"
              control={control}
              rules={{ required: "Ride type is required" }}
              render={({ field, fieldState }) => (
                <Select
                  label="Ride Type"
                  options={[
                    { value: "luxury", label: "Luxury" },
                    { value: "economy", label: "Economy" },
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={loadingCreate || loadingActions}
                  error={fieldState.error?.message}
                />
              )}
            />

            {editingVehicle && (
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Status"
                    options={[
                      { value: "true", label: "Active" },
                      { value: "false", label: "Inactive" },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={loadingCreate || loadingActions}
                  />
                )}
              />
            )}
          </div>

          <TextArea
            label="Notes"
            placeholder="Add any notes here..."
            maxLength={200}
            {...register("notes", { maxLength: { value: 200, message: "Notes cannot exceed 200 characters" } })}
            disabled={loadingCreate || loadingActions}
            rows={3}
            error={errors.notes?.message}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={loadingCreate || loadingActions}
              onClick={handleModalClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loadingCreate || loadingActions}
              className="min-w-[120px]"
            >
              {loadingCreate || loadingActions ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : editingVehicle ? (
                "Update Vehicle"
              ) : (
                "Create Vehicle"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Vehicle"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this vehicle? This action cannot be
            undone.
          </p>
          {vehicleToDelete && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p className="text-sm font-medium text-gray-900 capitalize">
                {vehicleToDelete.model}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                Ride Type: {vehicleToDelete.rideType}
              </p>
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={loadingActions}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              disabled={loadingActions}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loadingActions ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VehicleCategoryManagement;
