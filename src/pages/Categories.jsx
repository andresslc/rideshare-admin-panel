import { useMemo, useState } from "react";
import Select from "../components/ui/Select";
import {
  Edit,
  Trash2,
  Eye,
  Package,
  ShieldX,
  ShieldCheck,
  X,
  Loader2,
  Truck,
  MapPin,
  LayoutTemplate,
} from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import TextArea from "../components/ui/TextArea";
import { useForm, Controller } from "react-hook-form";
import { formatCurrency, formatDate, formatNumber } from "../utils/helpers";
import Card from "../components/ui/Card";
import useGetAllProducts from "../hooks/products/useGetAllProducts";
import { API_CONFIG, PAGINATION_CONFIG } from "../config/constants";
import FilterBar from "../components/ui/FilterBar";
import useDebounce from "../hooks/global/useDebounce";
import useGetAllCategories from "../hooks/categories/useGetAllCategories";
import TagInput from "../components/ui/TagInput";
import useProductActions from "../hooks/products/useProductActions";
import useCreateProduct from "../hooks/products/useCreateProduct";
import ImageUploader from "../components/ui/ImageUploader";
import ImagesGallery from "../components/ui/ImagesGallery";
import useCategoryActions from "../hooks/categories/useCategoryActions";
import useCreateCategory from "../hooks/categories/useCreateCategory";
import StatsCard from "../components/common/StatsCard";
import { usePersistentState } from "../hooks/global/usePersistentState";

const Categories = () => {
  const [currentPage, setCurrentPage] = usePersistentState("categories_currentPage", 1);
  const [pageSize, setPageSize] = usePersistentState("categories_pageSize", PAGINATION_CONFIG.defaultPageSize);
  const [status, setStatus] = usePersistentState("categories_status", "");

  // Product hooks
  const {
    loading,
    stats,
    totalPages,
    totalData,
    categories,
    getAllCategories,
  } = useGetAllCategories(status, currentPage, pageSize);
  const { loading: loadingCreateCategory, createCategory } =
    useCreateCategory();
  const {
    loading: loadingCategoryActions,
    deleteCategory,
    updateCategory,
  } = useCategoryActions();

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Define default values
  const defaultValues = {
    name: "",
    isActive: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    clearErrors, // Add this
    formState: { errors },
  } = useForm({ defaultValues });

  const categoryStats = useMemo(
    () => [
      {
        title: "Total Categories",
        value: formatNumber(stats?.totalCategories || 0),
        icon: LayoutTemplate,
        color: "text-primary-600",
        bgColor: "bg-primary-600/20",
      },
      {
        title: "Active Categories",
        value: formatNumber(stats?.totalActiveCategories || 0),
        icon: ShieldCheck,
        color: "text-green-600",
        bgColor: "bg-green-600/20",
      },
      {
        title: "Inactive Categories",
        value: formatNumber(stats?.totalInactiveCategories || 0),
        icon: ShieldX,
        color: "text-orange-600",
        bgColor: "bg-orange-600/20",
      },
    ],
    [stats]
  );

  const columns = [
    {
      key: "_id",
      label: "ID",
    },
    {
      key: "name",
      label: "Category Name",
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
      key: "createdAt",
      label: "Created",
      render: (value) => formatDate(value),
    },
    {
      key: "actions",
      label: "Actions",

      render: (_, product) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(product)}
            icon={<Edit className="w-4 h-4" />}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(product._id)}
            disabled={loadingCategoryActions}
            icon={<Trash2 className="w-4 h-4" />}
          />
        </div>
      ),
    },
  ];

  const handlePageChange = (page) => {
    if (page) setCurrentPage(page);
  };

  const handlePageSizeChange = (pageSize) => {
    if (pageSize) {
      setCurrentPage(1);
      setPageSize(pageSize);
    }
  };

  const handleAdd = () => {
    reset(defaultValues);
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEdit = (category) => {
    const formattedCategory = {
      ...category,
      isActive: JSON.stringify(category.isActive), // Convert boolean to string
    };

    setEditingCategory(formattedCategory);
    reset(formattedCategory);
    setShowModal(true);
  };

  const handleDelete = async (categoryId) => {
    // console.log(categoryId);
    const success = await deleteCategory(categoryId);
    if (success) {
      getAllCategories();
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    reset(defaultValues);
  };

  const handleExportCategories = (data) => {
    return data.map((category) => ({
      Title: category?.name,
      Status: category?.isActive ? "Active" : "Inactive",
      Created: formatDate(category?.createdAt),
    }));
  };

  const onSubmit = async (data) => {
    try {
      if (editingCategory) {
        const categoryId = editingCategory._id;

        const {
          _id,
          createdAt,
          updatedAt,
          __v,
          isDeleted,
          ...editCategoryPayload
        } = data;

        const success = await updateCategory(categoryId, editCategoryPayload);
        if (success) {
          reset(defaultValues);
          setShowModal(false);
          getAllCategories();
        }
      } else {
        const success = await createCategory(data);
        if (success) {
          reset(defaultValues);
          setShowModal(false);
          getAllCategories();
        }
      }
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {categoryStats?.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon ? <stat.icon /> : null}
            colored
            index={index}
          />
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <FilterBar
          filters={[
            {
              key: "status",
              label: "Status",
              type: "select",
              value: status,
              onChange: setStatus,
              options: [
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ],
            },
          ]}
          onClear={() => setStatus("")}
        />
      </Card>

      <div>
        <DataTable
          title="Categories Management"
          loading={loading}
          data={categories}
          columns={columns}
          onExport={handleExportCategories}
          onAdd={handleAdd}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalPages={totalPages}
          totalData={totalData}
          exportable
        />

        <Modal
          isOpen={showModal}
          onClose={handleModalClose}
          title={editingCategory ? "Edit Category" : "Add New Category"}
          size="lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <Input
                label="Category Name"
                {...register("name", { required: "Category name is required" })}
                disabled={loadingCreateCategory}
                error={errors.name?.message}
              />

              <Controller
                name="isActive"
                control={control}
                disabled={loadingCreateCategory}
                defaultValue=""
                rules={{ required: "Status is required" }}
                render={({ field, fieldState }) => (
                  <Select
                    label="Status"
                    options={[
                      { value: "", label: "Select Status" },
                      { value: "true", label: "Active" },
                      { value: "false", label: "Inactive" },
                    ]}
                    value={field.value || ""}
                    onChange={(value) => {
                      field.onChange(value);
                      // Clear the error when a value is selected
                      if (value) {
                        clearErrors("isActive");
                      }
                    }}
                    disabled={loadingCreateCategory}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={loadingCreateCategory}
                onClick={handleModalClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-10 flex items-center gap-2"
                disabled={loadingCreateCategory}
              >
                {loadingCreateCategory ? (
                  <div className="flex items-center justify-center py-12 gap-2">
                    <Loader2 className={`animate-spin text-white`} />{" "}
                    <span className="text-white">Creating...</span>
                  </div>
                ) : loadingCategoryActions ? (
                  <div className="flex items-center justify-center py-12 gap-2">
                    <Loader2 className={`animate-spin text-white`} />{" "}
                    <span className="text-white">Updating...</span>
                  </div>
                ) : editingCategory ? (
                  "Update Category"
                ) : (
                  "Create Category"
                )}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default Categories;
