import React, { useState } from "react";
import { Plus, ShieldAlert, Edit, Trash2 } from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import FilterBar from "../components/ui/FilterBar";
import Badge from "../components/ui/Badge";
import useAdminUsers from "../hooks/admin/useAdminUsers";
import { api } from "../lib/services";
import { handleError } from "../utils/helpers";
import toast from "react-hot-toast";
import { USER_ROLES } from "../config/constants";
import AdminUserModal from "../components/admin/AdminUserModal";
import ConfirmModal from "../components/global/ConfirmModal";
import { formatDate } from "../utils/helpers";
import useDebounce from "../hooks/global/useDebounce";

const AdminUsers = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { admins, loading, pagination, refresh } = useAdminUsers(
    page,
    limit,
    debouncedSearch,
    "",
    "desc"
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageSizeChange = (size) => {
    setLimit(size);
    // Row 51 of 10-per-page doesn't exist at 100-per-page — go back to the start.
    setPage(1);
  };

  const handleFilterChange = (filterId, value) => {
    // Other filters can be handled here if needed in the future
  };

  const handleAddAdmin = () => {
    setEditingAdmin(null);
    setIsModalOpen(true);
  };

  const handleEditAdmin = (admin) => {
    setEditingAdmin(admin);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data) => {
    try {
      if (editingAdmin) {
        await api.updateAdminUser(editingAdmin._id || editingAdmin.id, data);
        toast.success("Admin user updated successfully");
      } else {
        await api.createAdminUser(data);
        toast.success("Admin user created successfully");
      }
      setIsModalOpen(false);
      refresh();
    } catch (error) {
      handleError(error);
    }
  };

  const confirmDelete = (admin) => {
    setAdminToDelete(admin);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!adminToDelete) return;
    try {
      await api.deleteAdminUser(adminToDelete._id || adminToDelete.id);
      toast.success("Admin user deleted successfully");
      setDeleteModalOpen(false);
      refresh();
    } catch (error) {
      handleError(error);
    }
  };

  const columns = [
    {
      label: "Name",
      key: "name",
      render: (value, row) => (
        <div className="flex items-center gap-3 min-w-0" title={value}>
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium shrink-0">
            {value?.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-gray-900 truncate">
            {value}
          </span>
        </div>
      ),
    },
    {
      label: "Email",
      key: "email",
    },
    {
      label: "Role",
      key: "role",
      render: (value) => {
        const roleColors = {
          super_admin: "danger",
          admin: "primary",
          general: "secondary",
        };
        return (
          <Badge
            variant={roleColors[value] || "gray"}
            className="capitalize"
          >
            {value?.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      label: "Status",
      key: "isActive",
      render: (value) => (
        <Badge variant={value !== false ? "success" : "danger"}>
          {value !== false ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      label: "Joined Date",
      key: "createdAt",
      render: (value) => formatDate(value),
    },
    {
      label: "Actions",
      key: "actions",
      render: (_, row) => {
        if (row.role === 'super_admin') return null;
        
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditAdmin(row)}
              className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => confirmDelete(row)}
              className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-primary-500" />
            Admin Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage system administrators and their roles
          </p>
        </div>
        <Button onClick={handleAddAdmin} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Admin
        </Button>
      </div>

      <FilterBar
        searchable
        searchValue={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search..."
        filters={[]}
        onFilterChange={handleFilterChange}
      />

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <DataTable
          columns={columns}
          data={admins}
          loading={loading}
          totalPages={pagination.totalPages}
          totalData={pagination.totalData}
          currentPage={page}
          pageSize={limit}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
          searchPlaceholder="Search admins..."
        />
      </div>

      <AdminUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        editingAdmin={editingAdmin}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Admin User"
        message={`Are you sure you want to delete ${adminToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default AdminUsers;
