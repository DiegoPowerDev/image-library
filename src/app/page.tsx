"use client";
import Login from "@/components/authForms/login";
import Register from "@/components/authForms/register";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import FirebaseAuthWatcher from "@/components/FirebaseAuthWatcher";

export default function Home() {
  const [page, setPage] = useState("login");

  return (
    <>
      <div className="flex-1 w-full flex flex-col items-center justify-center text-white">
        <div className="flex">
          <Button
            variant={page === "login" ? "secondary" : "default"}
            className={cn("rounded-b-none")}
            onClick={() => setPage("login")}
          >
            Ingreso
          </Button>
          <Button
            variant={page === "register" ? "secondary" : "default"}
            className={cn("rounded-b-none")}
            onClick={() => setPage("register")}
          >
            Registro
          </Button>
        </div>
        <div className="max-w-1/3 ">
          <div className="border-2 rounded-xl border-white p-4 px-20 h-[500px]">
            {page === "login" && <Login />}
            {page === "register" && <Register />}
          </div>
        </div>

        <Toaster />

        <FirebaseAuthWatcher />
      </div>
    </>
  );
}
