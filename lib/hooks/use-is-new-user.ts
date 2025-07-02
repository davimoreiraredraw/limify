"use client";

import { useState, useEffect } from "react";

export function useIsNewUser() {
  const [isNewUser, setIsNewUser] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        const data = await response.json();

        // Se não tem despesas cadastradas, considera usuário novo
        setIsNewUser(data.gastosFixos?.value === 0);
      } catch (error) {
        console.error("Erro ao verificar status do usuário:", error);
        setIsNewUser(true); // Em caso de erro, assume que é novo usuário
      } finally {
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, []);

  return { isNewUser, isLoading };
}
