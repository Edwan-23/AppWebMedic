import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "sistema de gestión de medicamentos",
};

export default function SignIn() {
  return <SignInForm />;
}
