import { Metadata } from "next";

export const metadata:Metadata={
  title: "Hini | Admin Panel"
}

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {children}
    </div>
  );
};

export default AuthLayout;
