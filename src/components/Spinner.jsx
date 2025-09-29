import { useEffect, useState } from "react";

export default function Spinner() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      id="spinner"
      className={`${
        isLoading ? "show" : ""
      } bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center`}
    >
      <div
        className="spinner-border text-primary"
        style={{ width: "3rem", height: "3rem" }}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
