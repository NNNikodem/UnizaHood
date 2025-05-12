import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import HttpError from "../utils/HttpError";

export const useLogin = () => {
  const { dispatch } = useAuthContext();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new HttpError(res.status, data.error);
      }

      // Save the user to local storage
      localStorage.setItem("user", JSON.stringify(data));

      // Update the auth context
      dispatch({ type: "LOGIN", payload: data });

      setLoading(false);
      return { success: true, data }; // Return success status
    } catch (err) {
      setLoading(false);
      setError(err.message);
      return { success: false }; // Return failure status
    }
  };

  return { login, error, loading };
};
