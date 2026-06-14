"use client";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center h-full bg-broker-bg">
      <div className="text-center max-w-md px-8">
        <div className="text-7xl font-bold text-broker-yellow mb-4 font-mono">404</div>
        <h1 className="text-xl font-semibold text-broker-text-primary mb-2">Page Not Found</h1>
        <p className="text-broker-text-secondary text-sm mb-8">
          This page does not exist or has been moved.
        </p>
        <button
          onClick={() => router.push("/trade")}
          className="btn-primary px-8 py-3 text-base font-semibold"
        >
          Back to Trade
        </button>
      </div>
    </div>
  );
}
