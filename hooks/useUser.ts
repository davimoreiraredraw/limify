import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface User {
  id: string;
  name: string;
  email: string;
  profession: string;
  country: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fetchUser = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session?.user) {
          setUser(null);
          return;
        }

        const { user: authUser } = session;
        const metadata = authUser.user_metadata;

        setUser({
          id: authUser.id,
          name: metadata.name || "",
          email: authUser.email || "",
          profession: metadata.profession || "",
          country: metadata.country || "",
        });
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Escutar mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const metadata = session.user.user_metadata;
        setUser({
          id: session.user.id,
          name: metadata.name || "",
          email: session.user.email || "",
          profession: metadata.profession || "",
          country: metadata.country || "",
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
