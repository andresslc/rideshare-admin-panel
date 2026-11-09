import { useState } from "react";
import { handleError, handleSuccess } from "../../utils/helpers";
import { api } from "../../lib/services";

const useCategoryActions = () => {
  const [loading, setLoading] = useState(false);

  const updateCategory = async (id, categoryData) => {
    setLoading(true);
    try {
      const response = await api.updateCategory(id, categoryData);

      setLoading(false);
      handleSuccess(response.message, "Category updated successfully");
      return response.success;
    } catch (error) {
      handleError(error);
      setLoading(false);
      return false;
    }
  };

  const deleteCategory = async (id) => {
    setLoading(true);
    try {
      const response = await api.deleteCategory(id);

      setLoading(false);
      handleSuccess(response.message, "Category deleted successfully");
      return response.success;
    } catch (error) {
      handleError(error);
      setLoading(false);
      return false;
    }
  };

  const getCategoryById = async (id) => {
    setLoading(true);
    try {
      return await api.getCategoryById(id);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, updateCategory, deleteCategory, getCategoryById };
};

export default useCategoryActions;
