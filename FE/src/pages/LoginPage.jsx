import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import LoginHeader from "../components/login/LoginHeader";
import LoginForm from "../components/login/LoginForm";

export default function Login() {
  const [accountId, setAccountId] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    document.title = `Login`;
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ev-blue/10 via-background to-ev-green/10 p-4">
      <Card className="w-full max-w-md">
        <LoginHeader />
        <LoginForm
          accountId={accountId}
          setAccountId={setAccountId}
          password={password}
          setPassword={setPassword}
        />
      </Card>
    </div>
  );
}
