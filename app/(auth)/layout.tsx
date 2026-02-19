"use client";

import { AuthProvider } from "@/providers/auth-provider";


const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        {children}
      </div>
    </AuthProvider>
  );
};

export default AuthLayout;
