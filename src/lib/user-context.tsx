"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

interface UserSession {
  id?: string;
  name: string;
  role: string;
  email: string;
  flatNumber?: string;
  societyId?: string;
  societyName?: string;
  societyAddress?: string;
  societyUpiId?: string;
  joinCode?: string;
}

interface UserContextValue {
  user: UserSession;
  loaded: boolean;
  refetch: () => void;
}

const defaultUser: UserSession = {
  name: "",
  role: "",
  email: "",
};

const UserContext = createContext<UserContextValue>({
  user: defaultUser,
  loaded: false,
  refetch: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession>(defaultUser);
  const [loaded, setLoaded] = useState(false);
  const fetchedRef = useRef(false);

  const fetchUser = useCallback(() => {
    // Single fetch for the entire app — no duplicates
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser({
            id: data.user.id,
            name: data.user.name,
            role: data.user.role,
            email: data.user.email || "",
            societyId: data.user.societyId,
            societyName: data.user.society?.name,
            societyAddress: data.user.society?.city,
            societyUpiId: data.user.society?.upiId,
            joinCode: data.user.joinCode,
            flatNumber: data.user.flatNumber,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    // Prevent double-mount in StrictMode
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchUser();
  }, [fetchUser]);

  return (
    <UserContext.Provider value={{ user, loaded, refetch: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
