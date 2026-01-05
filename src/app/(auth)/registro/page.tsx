import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrarse",
  description: "Crea una cuenta en el sistema de gestión de medicamentos",
};

export default function SignUp() {
  return <SignUpForm />;
}
