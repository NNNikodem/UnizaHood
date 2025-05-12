import { useAuthContext } from "./useAuthContext";
import { useState } from "react";
import HttpError from "../utils/HttpError";

const BASE_URL = "http://localhost:5000/api/upload";

export const useUpload = () => {
  const { user } = useAuthContext();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const authHeaders = {
    ...(user?.token && { Authorization: `Bearer ${user.token}` }),
  };

  // POST: Upload image
  const postImages = async (endpoint, file) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: authHeaders,
        body: formData,
      });
      const responseData = await res.json();

      if (!res.ok) {
        throw new HttpError(res.status, responseData.error);
      }

      setLoading(false);
      return { success: true, data: responseData };
    } catch (err) {
      setLoading(false);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // GET: Fetch uploaded files or metadata
  const getImages = async (endpoint) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "GET",
        headers: authHeaders,
      });

      if (!res.ok) {
        const responseData = await res.json();
        throw new HttpError(res.status, responseData.error);
      }

      const data = await res.json();
      setLoading(false);
      return { success: true, data };
    } catch (err) {
      setLoading(false);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return { postImages, getImages, error, loading };
};
