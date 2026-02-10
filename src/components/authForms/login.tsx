import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";
import { login, resendEmailVerification } from "@/firebase/auth";
import toast from "react-hot-toast";
import { DoorOpen, Mails } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import Image from "next/image";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [verify, setVerify] = useState(false);
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    login(email, password, async (res) => {
      if (res.error?.code === "auth/invalid-credential") {
        toast.error("Correo o contraseña incorrecto");
        setLoading(false);
        return;
      }
      if (res.error?.code === "email-not-verified") {
        toast.error(
          "Aun no has confirmado tu correo con el link que se te envió",
        );
        setVerify(true);
        setLoading(false);
        return;
      }
      if (res.success) {
        toast.success("Bienvenido");
        router.replace("/dashboard");
      }
    });
  };

  return (
    <div className="flex w-full h-full flex-col  ">
      <div className=" flex items-center justify-center">
        <Image
          src="/logo.webp"
          alt="logo"
          width={200}
          height={200}
          className="object-contain max-w-full"
        />
      </div>
      {verify && (
        <div className="w-full flex justify-center items-center pb-2">
          <Button
            onClick={() => {
              setVerify(false);
              resendEmailVerification((e) => console.log(e));
            }}
            type="button"
            className="w-3/4 hover:opacity-60 font-bold border-2 border-yellow-400"
          >
            Re-enviar confirmación <Mails />
          </Button>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center justify-center gap-2"
      >
        <div className="w-full">
          <label className="font-bold">Correo</label>
          <Input
            required
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>
        <div className="w-full">
          <label className="font-bold">Contraseña</label>
          <Input
            required
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>
        <div className="flex flex-col gap-2 w-full justify-center items-center">
          <div className="w-full flex justify-center items-center pt-2">
            <Button
              disabled={loading}
              className=" font-bold w-3/4 hover:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Ingresar <DoorOpen />
                </span>
              )}
            </Button>
          </div>
          <div
            className="cursor-pointer"
            onClick={() => {
              router.replace("/forgotpassword");
            }}
          >
            ¿Olvidaste tu contraseña?
          </div>
        </div>
      </form>
    </div>
  );
}
