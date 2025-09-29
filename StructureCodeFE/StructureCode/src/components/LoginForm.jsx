import { useNavigate } from "react-router-dom";

export default function LoginForm({ email, setEmail, password, setPassword }) {
  const navigator = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("submit", { email, password });
    navigator("/admin/accounts");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-floating mb-3">
        <input
          type="email"
          className="form-control"
          id="floatingInput"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="floatingInput">Email address</label>
      </div>

      <div className="form-floating mb-4">
        <input
          type="password"
          className="form-control"
          id="floatingPassword"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label htmlFor="floatingPassword">Password</label>
      </div>

      <button type="submit" className="btn btn-primary py-3 w-100 mb-4">
        Sign In
      </button>
    </form>
  );
}
