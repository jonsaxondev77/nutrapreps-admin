import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nutrapreps Sign In ",
  description: "This is the Nutrapreps Signin page for the admin area",
};

export default function SignIn() {
  return <SignInForm />;
}
