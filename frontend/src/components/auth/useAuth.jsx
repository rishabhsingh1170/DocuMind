import { useState, useEffect } from "react";

export default function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (role && token) {
      setUser({
        role,
        token,
        name: localStorage.getItem("name"),
        company: localStorage.getItem("company"),
      });
    }
  }, []);

  return { user, setUser };
}