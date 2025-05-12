import { useState } from "react";
import { useAuthContext } from "./useAuthContext";

export const useRegister = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuthContext();

  const register = async (username, email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      console.log(data);
      if (!response.ok) {
        setError(data.error || "Registrácia zlyhala");
        setIsLoading(false);
        return { success: false };
      }

      // Ulož používateľské údaje do local storage
      localStorage.setItem("user", JSON.stringify(data));

      // Aktualizuj auth context
      dispatch({ type: "LOGIN", payload: data });

      setIsLoading(false);
      return { success: true, data };
    } catch (error) {
      setError("Neočakávaná chyba servera");
      setIsLoading(false);
      return { success: false };
    }
  };

  return { register, error, isLoading };
};
