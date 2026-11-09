import React, { useState } from "react";
import { handleError, handleSuccess } from "../../utils/helpers";
import { api } from "../../lib/services";

const useAuthActions = () => {
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.login({ email, password });
      setLoading(false);
      handleSuccess(response.message, "Login successful");
      return response.data;
    } catch (error) {
      handleError(error);
      setLoading(false);
      return null;
    }
  };

  const forgotPassword = async (email, role) => {
    setLoading(true);
    try {
      const response = await api.forgotPassword(email, role);
      setLoading(false);
      handleSuccess(response.message, "Password reset email sent");
      return response.success;
    } catch (error) {
      handleError(error);
      setLoading(false);
      return false;
    }
  };

  const verifyOTP = async (email, role, otp) => {
    setLoading(true);
    try {
      const response = await api.verifyOTP(email, role, otp);
      setLoading(false);
      handleSuccess(response.message, "OTP verified successfully");
      return response.success;
    } catch (error) {
      handleError(error);
      setLoading(false);
      return false;
    }
  };

  const updatePassword = async (newPassword) => {
    setLoading(true);
    try {
      const response = await api.updatePassword(newPassword);
      setLoading(false);
      handleSuccess(response.message, "Password updated successfully");
      return response.success;
    } catch (error) {
      handleError(error);
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const response = await api.logout();
      setLoading(false);
      handleSuccess(response.message, "Logout successful");
      return response.success;
    } catch (error) {
      handleError(error);
      setLoading(false);
      return false;
    }
  };

  return {
    loading,
    login,
    forgotPassword,
    verifyOTP,
    updatePassword,
    logout,
  };
};

export default useAuthActions;
