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
  Star,
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
import StatsCard from "../components/common/StatsCard";
import toast from "react-hot-toast";
import { usePersistentState } from "../hooks/global/usePersistentState";

const Products = () => {
  const [currentPage, setCurrentPage] = usePersistentState("products_currentPage", 1);
  const [pageSize, setPageSize] = usePersistentState("products_pageSize", PAGINATION_CONFIG.defaultPageSize);
  const [status, setStatus] = usePersistentState("products_status", "");
  const [search, setSearch] = usePersistentState("products_search", "");
  const searchDebounce = useDebounce(search);

  // Product hooks
  const { loading, products, stats, totalPages, totalData, getAllProducts } =
    useGetAllProducts(searchDebounce, status, currentPage, pageSize);
  const { loading: loadingCreateProduct, createProduct } = useCreateProduct();
  const {
    loading: loadingProductActions,
    updateProduct,
    deleteProduct,
  } = useProductActions();
  const { loading: loadingCategories, categories } = useGetAllCategories(
    "active",
    1,
    200
  );

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [showViewProductModal, setShowViewProductModal] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);

  const defaultValues = {
    title: "",
    subtitle: "",
    description: "",
    price: null,
    stock: null,
    category: null,
    images: [],
    isActive: "",
    isFeatured: false,
    colors: [],
    sizes: [],
    receivingOptions: "both",
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    clearErrors,
    getValues,
    formState: { errors },
  } = useForm({ defaultValues });

  const productStats = useMemo(
    () => [
      {
        title: "Total Products",
        value: formatNumber(stats?.totalProducts || 0),
        icon: Package,
        color: "text-primary-600",
        bgColor: "bg-primary-600/20",
      },
      {
        title: "Active Products",
        value: formatNumber(stats?.totalActiveProducts || 0),
        icon: ShieldCheck,
        color: "text-green-600",
        bgColor: "bg-green-600/20",
      },
      {
        title: "Inactive Products",
        value: formatNumber(stats?.totalInactiveProducts || 0),
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
      key: "title",
      label: "Product Name",
    },
    {
      key: "category",
      label: "Category",

      render: (value) => value.name,
    },
    {
      key: "price",
      label: "Price",

      render: (value) => formatCurrency(value),
    },
    {
      key: "shippingCost",
      label: "Shipping Cost",

      render: (value) => formatCurrency(value),
    },
    {
      key: "stock",
      label: "Stock",

      render: (value) => {
        return value ? formatNumber(value) : "N/A";
      },
    },
    {
      key: "sizes",
      label: "Sizes",
      render: (sizes) => (
        <div className="flex flex-wrap gap-1">
          {sizes?.slice(0, 3).map((size, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {size}
            </Badge>
          ))}
          {sizes?.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{sizes.length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "colors",
      label: "Colors",
      render: (colors) => (
        <div className="flex flex-wrap gap-1">
          {colors?.slice(0, 3).map((color, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {color}
            </Badge>
          ))}
          {colors?.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{colors.length - 3}
            </Badge>
          )}
        </div>
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
            onClick={() => handleView(product)}
            icon={<Eye className="w-4 h-4" />}
          />
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
            disabled={loadingProductActions}
            icon={<Trash2 className="w-4 h-4" />}
          />
        </div>
      ),
    },
  ];

  // For the FilterBar fix, update your formattedCategories to include the category ID:
  const formattedCategories = useMemo(() => {
    const formattedCategories = categories?.map((category) => {
      return {
        value: category._id, // Use _id instead of name for the value
        label: category.name,
      };
    });

    return [
      { value: "", label: `-- Select a Category --` },
      ...(formattedCategories || []),
    ];
  }, [categories]);

  const handlePageChange = (page) => {
    if (page) setCurrentPage(page);
  };

  const handlePageSizeChange = (pageSize) => {
    if (pageSize) {
      setCurrentPage(1);
      setPageSize(pageSize);
    }
  };

  const handleSearch = (search) => {
    setCurrentPage(1);
    setSearch(search);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    reset(defaultValues);
    setShowModal(true);
  };

  const handleEdit = (product) => {
    const receivingOptions =
      product?.receivingOptions == ["delivery"]
        ? "delivery"
        : product?.receivingOptions == ["pickup"]
        ? "pickup"
        : "both";

    const formattedProduct = {
      ...product,
      receivingOptions: receivingOptions,
      category: product.category._id,
      isActive: JSON.stringify(product.isActive), // Convert boolean to string
    };

    console.log("editing formattedProduct: ", formattedProduct);

    setEditingProduct(formattedProduct);

    reset(formattedProduct);
    setShowModal(true);
  };

  const handleView = (product) => {
    setViewingProduct(product);
    setShowViewProductModal(true);
  };

  const handleDelete = async (productId) => {
    console.log(productId);
    const success = await deleteProduct(productId);
    if (success) {
      getAllProducts();
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    reset(defaultValues);
  };

  const handleProductExport = (data) => {
    // Transform data to match your table display
    return data.map((product) => ({
      ID: product._id || "",
      "Product Name": product.title || "",
      Category: product.category?.name || "",
      Price: formatCurrency(product.price),
      "Shipping Cost": formatCurrency(product.shippingCost),
      Stock: product.stock ? formatNumber(product.stock) : "N/A",
      Sizes: product.sizes?.join(", ") || "",
      Colors: product.colors?.join(", ") || "",
      Status: product.isActive ? "Active" : "Inactive",
      Created: formatDate(product.createdAt),
    }));
  };

  const onSubmit = async (data) => {
    // Convert receivingOptions to array
    const receivingOptions =
      data.receivingOptions === "delivery"
        ? ["delivery"]
        : data.receivingOptions === "pickup"
        ? ["pickup"]
        : data.receivingOptions === "both"
        ? ["delivery", "pickup"]
        : [];

    try {
      if (editingProduct) {
        // Build plain JSON payload (no FormData)
        const productId = editingProduct._id;
        const payload = {
          title: data.title,
          subtitle: data.subtitle,
          description: data.description,
          price: data.price,
          shippingCost: data.shippingCost,
          stock: data.stock,
          category: data.category,
          isFeatured: data.isFeatured,
          isActive: data.isActive,
          isDeleted: false,
          colors: data.colors || [],
          sizes: data.sizes || [],
          receivingOptions,
        };

        const success = await updateProduct(productId, payload); // JSON
        if (success) {
          reset(defaultValues);
          setShowModal(false);
          getAllProducts();
        }
      } else {
        // For create, still need FormData because of images
        const formData = new FormData();

        // Append scalar fields
        formData.append("title", data.title);
        formData.append("subtitle", data.subtitle);
        formData.append("description", data.description);
        formData.append("price", data.price);
        formData.append("shippingCost", data.shippingCost);
        formData.append("stock", data.stock);
        formData.append("category", data.category);
        formData.append("isFeatured", data.isFeatured);
        formData.append("isActive", data.isActive);
        formData.append("isDeleted", false);

        // Append array fields as JSON string
        formData.append("colors", JSON.stringify(data.colors || []));
        formData.append("sizes", JSON.stringify(data.sizes || []));
        formData.append("receivingOptions", JSON.stringify(receivingOptions));

        // Append files (images)
        if (data.images && data.images.length > 0) {
          data.images.forEach((file) => {
            formData.append("images", file);
          });
        } else {
          toast.error("Please upload at least one image");
          return;
        }

        const success = await createProduct(formData);
        if (success) {
          reset(defaultValues);
          setShowModal(false);
          getAllProducts();
        }
      }
    } catch (error) {
      console.error("Error creating/updating product:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {productStats?.map((stat, index) => (
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
          onClear={() => {
            setStatus("");
            setSearch("");
          }}
        />
      </Card>

      <div>
        <DataTable
          title="Products Management"
          loading={loading}
          data={products}
          columns={columns}
          onExport={handleProductExport}
          onAdd={handleAdd}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalPages={totalPages}
          totalData={totalData}
          searchTerm={search}
          onSearch={(value) => handleSearch(value)}
          searchable
          exportable
        />

        {/* Create/Edit Product Modal */}
        <Modal
          isOpen={showModal}
          onClose={handleModalClose}
          title={editingProduct ? "Edit Product" : "Add New Product"}
          size="lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Product Name"
                {...register("title", { required: "Product name is required" })}
                disabled={loadingCreateProduct}
                error={errors.title?.message}
              />

              <Input
                label="Product Subtitle"
                {...register("subtitle", {
                  required: "Product subtitle is required",
                })}
                disabled={loadingCreateProduct}
                error={errors.subtitle?.message}
              />
            </div>

            <div
              className={`grid grid-cols-1 ${
                getValues("receivingOptions") !== "pickup"
                  ? "md:grid-cols-3"
                  : "md:grid-cols-2"
              } gap-4`}
            >
              <Input
                label="Price"
                type="number"
                step="0.01"
                min="0"
                {...register("price", {
                  required: "Price is required",
                  min: { value: 0, message: "Price must be positive" },
                })}
                disabled={loadingCreateProduct}
                error={errors.price?.message}
              />

              {getValues("receivingOptions") !== "pickup" && (
                <Input
                  label="Shipping Cost"
                  type="number"
                  step="0.01"
                  {...register("shippingCost", {
                    required: "Shipping Cost is required",
                    min: {
                      value: 0,
                      message: "Shipping Cost must be positive",
                    },
                  })}
                  disabled={loadingCreateProduct}
                  error={errors.shippingCost?.message}
                />
              )}

              <Input
                label="Stock"
                type="number"
                {...register("stock", {
                  required: "Stock is required",
                  min: { value: 0, message: "Stock must be positive" },
                })}
                disabled={loadingCreateProduct}
                error={errors.stock?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="category"
                control={control}
                disabled={loadingCreateProduct}
                defaultValue=""
                rules={{ required: "Category is required" }}
                render={({ field, fieldState }) => (
                  <Select
                    label="Category"
                    loading={loadingCategories}
                    searchable
                    options={formattedCategories}
                    value={field.value || ""}
                    onChange={(value) => {
                      field.onChange(value);
                      // Clear the error when a value is selected
                      if (value) {
                        clearErrors("category");
                      }
                    }}
                    disabled={loadingCreateProduct}
                    error={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="receivingOptions"
                control={control}
                disabled={loadingCreateProduct}
                defaultValue=""
                rules={{ required: "Receiving option is required" }}
                render={({ field, fieldState }) => (
                  <Select
                    label="Receiving Option"
                    options={[
                      { value: "both", label: "Both Pickup and Delivery" },
                      { value: "delivery", label: "Delivery" },
                      { value: "pickup", label: "Pickup" },
                    ]}
                    value={field.value || ""}
                    onChange={(value) => {
                      field.onChange(value);
                      // Clear the error when a value is selected
                      if (value) {
                        clearErrors("receivingOptions");
                      }
                    }}
                    disabled={loadingCreateProduct}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>

            {/* Sizes and Colors Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="sizes"
                control={control}
                disabled={loadingCreateProduct}
                defaultValue=""
                rules={{ required: "Size is required" }}
                render={({ field, fieldState }) => (
                  <TagInput
                    label="Sizes"
                    value={field.value || ""}
                    onChange={(value) => {
                      field.onChange(value);

                      // Clear the error when a value is selected
                      if (value) {
                        clearErrors("sizes");
                      }
                    }}
                    placeholder="Enter size (e.g., S, M, L, XL)"
                    error={fieldState.error?.message}
                    disabled={loadingCreateProduct}
                    required={true}
                  />
                )}
              />
              <Controller
                name="colors"
                control={control}
                disabled={loadingCreateProduct}
                defaultValue=""
                rules={{ required: "Color is required" }}
                render={({ field, fieldState }) => (
                  <TagInput
                    label="Colors"
                    value={field.value || ""}
                    onChange={(value) => {
                      field.onChange(value);

                      // Clear the error when a value is selected
                      if (value) {
                        clearErrors("colors");
                      }
                    }}
                    disabled={loadingCreateProduct}
                    placeholder="Enter color (e.g., Red, Blue, Green)"
                    error={fieldState.error?.message}
                    required={true}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="isFeatured"
                control={control}
                disabled={loadingCreateProduct}
                defaultValue={false}
                render={({ field, fieldState }) => (
                  <Select
                    label="Featured"
                    options={[
                      { value: false, label: "No" },
                      { value: true, label: "Yes" },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={loadingCreateProduct}
                    error={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="isActive"
                control={control}
                disabled={loadingCreateProduct}
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
                    disabled={loadingCreateProduct}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>

            <TextArea
              label="Description"
              {...register("description", {
                required: "Product description is required",
              })}
              rows={4}
              placeholder="Enter product description"
              error={errors.description?.message}
              disabled={loadingCreateProduct}
            />

            {/* Image Uploader */}
            <Controller
              name="images"
              control={control}
              defaultValue={[]}
              render={({ field: { onChange, value }, fieldState }) => (
                <ImageUploader
                  onChange={(files) => onChange(files)}
                  value={value}
                  label="Product Images"
                  multiple
                  error={fieldState.error?.message}
                  disabled={loadingCreateProduct}
                  allowUpload={editingProduct ? false : true}
                />
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={loadingCreateProduct}
                onClick={handleModalClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-10 flex items-center gap-2"
                disabled={loadingCreateProduct || loadingProductActions}
              >
                {loadingCreateProduct ? (
                  <div className="flex items-center justify-center py-12 gap-2">
                    <Loader2 className={`animate-spin text-white`} />{" "}
                    <span className="text-white">Creating...</span>
                  </div>
                ) : loadingProductActions ? (
                  <div className="flex items-center justify-center py-12 gap-2">
                    <Loader2 className={`animate-spin text-white`} />{" "}
                    <span className="text-white">Updating...</span>
                  </div>
                ) : editingProduct ? (
                  "Update Product"
                ) : (
                  "Create Product"
                )}
              </Button>
            </div>
          </form>
        </Modal>

        {/* View Product Modal */}
        <Modal
          isOpen={showViewProductModal}
          onClose={() => setShowViewProductModal(false)}
          title={
            viewingProduct?.title ? viewingProduct?.title : "Product Details"
          }
          size="xl"
        >
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Images */}
            <div>
              <ImagesGallery images={viewingProduct?.images} />
            </div>

            {/* Right Column - Product Details */}
            <div className="space-y-6">
              {/* Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {viewingProduct?.title}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                      {viewingProduct?.subtitle}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      viewingProduct?.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {viewingProduct?.isActive ? "Active" : "Inactive"}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {formatCurrency(viewingProduct?.price)}
                  </span>
                  {viewingProduct?.isFeatured && (
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="ml-1 text-sm font-medium">Featured</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-400">
                    Shipping Cost:{" "}
                    <span className="text-black dark:text-white">
                      {formatCurrency(viewingProduct?.shippingCost)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {viewingProduct?.description}
                </p>
              </div>

              {/* Product Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Category
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {viewingProduct?.category?.name}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Stock
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {viewingProduct?.stock} units
                  </p>
                </div>
              </div>

              {/* Colors */}
              {viewingProduct?.colors && viewingProduct.colors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Available Colors
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {viewingProduct.colors.map((color, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100/20 text-primary-600 rounded-full text-sm font-medium"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {viewingProduct?.sizes && viewingProduct.sizes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Available Sizes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {viewingProduct.sizes.map((size, index) => (
                      <Badge key={index} variant="default">
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Receiving Options */}
              {viewingProduct?.receivingOptions &&
                viewingProduct.receivingOptions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Receiving Options
                    </h3>
                    <div className="flex gap-3">
                      {viewingProduct.receivingOptions.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg"
                        >
                          {option === "delivery" ? (
                            <Truck className="w-4 h-4 text-primary-500" />
                          ) : (
                            <MapPin className="w-4 h-4 text-secondary-500" />
                          )}
                          <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                            {option}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Metadata */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <p>
                  <strong>Created:</strong>{" "}
                  {formatDate(viewingProduct?.createdAt)}
                </p>
                <p>
                  <strong>Last Updated:</strong>{" "}
                  {formatDate(viewingProduct?.updatedAt)}
                </p>
                <p>
                  <strong>Product ID:</strong> {viewingProduct?._id}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Products;
