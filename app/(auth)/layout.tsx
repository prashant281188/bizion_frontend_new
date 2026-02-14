"use client";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {

  return <div className="w-full mx-auto">{children}</div>;
};

export default AuthLayout;
