"use client";

import { useEffect, useState } from "react";
import { isAdmin } from "@/actions/ai-credit";

export function useAdminCheck() {
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      const result = await isAdmin();
      setIsAdminUser(result);
      setLoading(false);
    }
    checkAdmin();
  }, []);

  return { isAdminUser, loading };
}
