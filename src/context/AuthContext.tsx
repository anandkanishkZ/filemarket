import { createContext, useContext, useEffect, useState } from 'react';
import { signIn, signUp, signOut } from '../data/apiService';
import { Database } from '../types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, confirmPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Normalize admin status to is_admin boolean
      const normalizedUser = {
        ...parsedUser,
        is_admin: !!(parsedUser.is_admin || parsedUser.isAdmin)
      };
      setUser(normalizedUser);
    }
    setLoading(false);
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { data, error } = await signIn(email, password);
      if (error) throw error;
      if (data?.data?.user) {
        // Normalize admin status from response
        const userData = {
          ...data.data.user,
          is_admin: !!(data.data.user.is_admin || data.data.user.isAdmin)
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const handleSignUp = async (email: string, password: string, name: string, confirmPassword: string) => {
    try {
      const { data, error } = await signUp(email, password, name, confirmPassword);
      if (error) throw error;
      if (data?.user) {
        // Normalize admin status from response
        const userData = {
          ...data.user,
          is_admin: !!(data.user.is_admin || data.user.isAdmin)
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}