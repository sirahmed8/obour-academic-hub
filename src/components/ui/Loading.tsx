import { Loader2 } from "lucide-react";

export function LoadingSpinner({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className="animate-spin text-primary" size={size} />
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-[50vh] w-full flex items-center justify-center">
      <LoadingSpinner size={40} />
    </div>
  );
}
