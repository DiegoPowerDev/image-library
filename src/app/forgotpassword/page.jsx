"use client";
import { useState } from "react";
import { resetPassword } from "@/firebase/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function Page() {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const handleSubmit = (e) => {
    e.preventDefault();

    resetPassword(email, (res) => {
      if (res.success) {
        toast.success(
          "Correo de restablecimiento enviado, revista tu bandeja de entrada o spam"
        );
        return;
      }
      toast.error(
        "Error enviando correo de restablecimiento, contacta al soporte"
      );
      console.error(res);
    });
    console.log(email);
  };

  return (
    <div className="flex flex-col gap-4 flex-1 w-full  justify-center items-center mx-auto">
      <form
        onSubmit={handleSubmit}
        className="sm:w-2/6 w-full h-96 bg-black/80 text-white border-white border-2 p-4 gap-2 rounded-xl justify-center items-center flex flex-col"
      >
        <div className="w-full flex  justify-start items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.replace("/")}
          >
            <ArrowLeft size={20} /> Atras
          </Button>
        </div>
        <div className="w-3/4 h-full flex flex-col pt-12 gap-8 ">
          <label className="font-bold text-center text-xl">
            Ingresa tu correo
          </label>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button className="w-full">Enviar correo de restablecimiento</Button>
        </div>
      </form>
    </div>
  );
}
