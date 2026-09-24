import { useCallback, useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

const SESSION_KEY = "app_session_token";
const USER_EMAIL_KEY = "current_user_email";

export function usePasswordAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const meQuery = trpc.auth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const localLoginMutation = trpc.auth.localLogin.useMutation();
  const logoutMutation = trpc.auth.logout.useMutation();

  useEffect(() => {
    if (meQuery.isLoading) return;
    if (meQuery.data) {
      const user = { ...meQuery.data, isActive: true };
      setCurrentUser(user);
      setIsAuthenticated(true);
      sessionStorage.setItem(SESSION_KEY, "server-session");
      sessionStorage.setItem(USER_EMAIL_KEY, user.email ?? "");
    }
    setIsLoading(false);
  }, [meQuery.data, meQuery.isLoading]);

  const login = useCallback(async (email: string, password: string, turnstileToken: string) => {
    setError(null);
    if (!email || !password) {
      setError("Veuillez entrer votre email et votre mot de passe");
      return false;
    }
    if (!turnstileToken) {
      setError("Veuillez valider la protection anti-robot");
      return false;
    }
    try {
      const result = await localLoginMutation.mutateAsync({ email, password, turnstileToken });
      const user = { ...result.user, email, isActive: true };
      sessionStorage.setItem(SESSION_KEY, "server-session");
      sessionStorage.setItem(USER_EMAIL_KEY, email);
      setCurrentUser(user);
      setIsAuthenticated(true);
      await meQuery.refetch();
      return true;
    } catch (loginError: any) {
      setError(loginError?.message || "Email ou mot de passe incorrect");
      setIsAuthenticated(false);
      return false;
    }
  }, [localLoginMutation, meQuery]);

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(USER_EMAIL_KEY);
      setIsAuthenticated(false);
      setError(null);
      setCurrentUser(null);
      await meQuery.refetch();
    }
  }, [logoutMutation, meQuery]);

  return {
    isAuthenticated,
    isLoading: isLoading || localLoginMutation.isPending || logoutMutation.isPending,
    error,
    currentUser,
    login,
    logout,
  };
}
