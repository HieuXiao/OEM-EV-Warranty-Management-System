import { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import LoginHeader from "../components/LoginHeader";
import LoginForm from "../components/LoginForm";

export default function Login() {
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="container-xxl position-relative bg-white d-flex p-0">
      <Spinner isLoading={isLoading} setIsLoading={setIsLoading} />
      <div className="container-fluid">
        <div
          className="row h-100 align-items-center justify-content-center"
          style={{ minHeight: "100vh" }}
        >
          <div className="col-12 col-sm-8 col-md-6 col-lg-5 col-xl-4">
            <div className="bg-light rounded p-4 p-sm-5 my-4 mx-3">
              <LoginHeader />
              <LoginForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
