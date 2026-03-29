import { Metadata } from "next";

export const metadata:Metadata={
  title: "Hini | Admin Panel"
}

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default AuthLayout;
