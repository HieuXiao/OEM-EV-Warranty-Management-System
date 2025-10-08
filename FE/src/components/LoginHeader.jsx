import { CardHeader, CardTitle, CardDescription } from "./ui/card";

export default function LoginHeader() {
  return (
    <CardHeader className="space-y-1">
      <div className="flex items-center gap-2 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">EV Warranty</h1>
          <p className="text-sm text-muted-foreground">Management System</p>
        </div>
      </div>
      <CardTitle className="text-2xl">Welcome back</CardTitle>
      <CardDescription>
        Enter your credentials to access the system
      </CardDescription>
    </CardHeader>
  );
}
