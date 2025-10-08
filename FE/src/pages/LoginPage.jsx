import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import LoginHeader from "../components/LoginHeader";
import LoginForm from "../components/login/LoginForm";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    document.title = `Login`;
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ev-blue/10 via-background to-ev-green/10 p-4">
      <Card className="w-full max-w-md">
        <LoginHeader />
        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
        />
      </Card>
    </div>
  );
}
