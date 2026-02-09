"use client";
import { Button } from "@/components/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 text-white">
      <h1 className="text-3xl font-bold">
        <img src="/404.avif" alt="" className="max-w-96" />
      </h1>
      <Button
        onClick={() => router.replace("/")}
        variant="ghost"
        className="border border-white flex gap-2"
      >
        <IconArrowLeft />
        Volver
      </Button>
    </main>
  );
}
