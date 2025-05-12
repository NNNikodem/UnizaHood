import HttpError from "../utils/HttpError";
import { useAuthContext } from "./useAuthContext";
import { useState } from "react";

const BASE_URL = "http://localhost:5000/api";

export const useApi = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getHeaders = () => {
    const headers = {
      "Content-Type": "application/json",
    };
    const localData = JSON.parse(localStorage.getItem("user"));

    if (localData && localData.token) {
      headers.Authorization = `Bearer ${localData.token}`;
    }
    return headers;
  };

  // Fetch GET method
  const get = async (endpoint) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "GET",
        headers: getHeaders(),
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

  // Fetch POST method
  const post = async (endpoint, data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const responseData = await res.json();
        throw new HttpError(res.status, responseData.error);
      }
      const dataResponse = await res.json();
      setLoading(false);
      return { success: true, data: dataResponse };
    } catch (err) {
      setLoading(false);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Fetch PUT method
  const put = async (endpoint, data, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const headers = getHeaders();

      // Ak sa posiela FormData, nebudeme nastavovať Content-Type
      // (automaticky sa nastaví správny boundary pre multipart/form-data)
      if (options.formData) {
        delete headers["Content-Type"];
      }

      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: headers,
        body: options.formData ? data : JSON.stringify(data),
      });
      if (!res.ok) {
        const responseData = await res.json();
        throw new HttpError(
          res.status,
          responseData.error || responseData.message
        );
      }

      const dataResponse = await res.json();
      console.log("Response data:", dataResponse);
      setLoading(false);
      return { success: true, data: dataResponse };
    } catch (err) {
      setLoading(false);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Fetch DELETE method
  const del = async (endpoint) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers: getHeaders(),
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
  const getUser = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      // Využívame existujúcu get metódu
      const response = await get(`/user/${userId}`);

      if (response.success) {
        // Vrátime priamo dáta používateľa
        return response.data.data;
      } else {
        // Nastavíme chybu, ale tú už nastavila get metóda
        return null;
      }
    } catch (err) {
      setLoading(false);
      setError(err.message);
      return null;
    }
  };
  return { get, post, put, del, getUser, error, loading };
};
