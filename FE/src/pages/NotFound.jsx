import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4 text-center">
      {/* Icon hoặc hình ảnh minh họa */}
      <div className="rounded-full bg-orange-100 p-6 mb-6">
        <span className="text-6xl">⚠️</span>
      </div>

      <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
        404
      </h1>

      <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
        Oops! Page not found
      </h2>

      <p className="text-muted-foreground max-w-md mb-8">
        The page you are looking for may have been deleted, renamed, or
        temporarily unavailable.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Nút quay lại trang trước */}
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
    </div>
  );
}
