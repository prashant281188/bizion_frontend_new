import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full mx-auto">
      {children}
    </div>
  );
};

export default AuthLayout;
