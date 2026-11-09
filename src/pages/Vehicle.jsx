import { useState, useEffect } from "react";
import Select from "../components/ui/Select";
import { Edit, Trash2, Eye, UserPlus } from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import { useForm } from "react-hook-form";
import { formatDate } from "../utils/helpers";

const Vehicle = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "admin",
      status: "active",
      createdAt: "2024-01-15",
      lastLogin: "2024-01-20",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "user",
      status: "active",
      createdAt: "2024-01-10",
      lastLogin: "2024-01-19",
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob@example.com",
      role: "manager",
      status: "inactive",
      createdAt: "2024-01-05",
      lastLogin: "2024-01-18",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const columns = [
    {
      key: "id",
      label: "ID",
    },
    {
      key: "name",
      label: "Name",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "role",
      label: "Role",
      render: (value) => (
        <Badge
          variant={
            value === "admin"
              ? "danger"
              : value === "manager"
                ? "warning"
                : "default"
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge variant={value === "active" ? "success" : "default"}>
          {value}
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
      render: (_, user) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(user)}
            icon={<Eye className="w-4 h-4" />}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(user)}
            icon={<Edit className="w-4 h-4" />}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(user)}
            icon={<Trash2 className="w-4 h-4" />}
          />
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingUser(null);
    reset();
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    reset(user);
    setShowModal(true);
  };

  const handleView = (user) => {
    alert(`Viewing user: ${user.name}`);
  };

  const handleDelete = (user) => {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      setUsers(users.filter((u) => u.id !== user.id));
    }
  };

  const onSubmit = (data) => {
    if (editingUser) {
      setUsers(
        users.map((u) => (u.id === editingUser.id ? { ...u, ...data } : u)),
      );
    } else {
      const newUser = {
        ...data,
        id: Math.max(...users.map((u) => u.id)) + 1,
        createdAt: new Date().toISOString().split("T")[0],
        lastLogin: null,
      };
      setUsers([...users, newUser]);
    }
    setShowModal(false);
  };

  return (
    <div>
      <DataTable
        title="Users Management"
        data={users}
        columns={columns}
        onAdd={handleAdd}
        searchable={true}
        filterable={true}
        exportable={true}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? "Edit User" : "Add New User"}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Name"
            {...register("name", { required: "Name is required" })}
            error={errors.name?.message}
          />

          <Input
            label="Email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            })}
            error={errors.email?.message}
          />

          <Select
            label="Role"
            options={[
              { value: "", label: "Select Role" },
              { value: "user", label: "User" },
              { value: "manager", label: "Manager" },
              { value: "admin", label: "Admin" },
            ]}
            {...register("role", { required: "Role is required" })}
            error={errors.role?.message}
          />

          <Select
            label="Status"
            options={[
              { value: "", label: "Select Status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "suspended", label: "Suspended" },
            ]}
            {...register("status", { required: "Status is required" })}
            error={errors.status?.message}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingUser ? "Update User" : "Create User"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Vehicle;
