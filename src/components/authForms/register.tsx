import { ReactEventHandler, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import toast from "react-hot-toast";
import { register } from "@/firebase/auth";
import { NotebookPen } from "lucide-react";

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const reset = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return setLoading(false);
    }

    const result = await register(email, password);
    if (!result.success) {
      if (result.error?.code === "auth/email-already-in-use") {
        setLoading(false);
        return toast.error("Este correo ya se encuentra en uso");
      }
    }

    reset();
    toast.success("Te hemos enviado un correo de confirmación.");
    setLoading(false);
  };

  return (
    <div className="flex w-full h-full">
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center justify-center gap-8"
      >
        <h1 className="font-bold text-2xl">REGISTRO</h1>
        <div className="w-full">
          <label className="font-bold">Correo</label>
          <div className="flex items-center">
            <Input
              required
              type="text"
              onChange={(e) => setEmail(e.currentTarget.value)}
              value={email}
            />
          </div>
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
        <div className="w-full">
          <label className="font-bold">Confirmar contraseña</label>
          <Input
            required
            type="password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            value={confirmPassword}
          />
        </div>
        <div className="w-full flex justify-center items-center">
          <Button
            disabled={loading}
            className=" font-bold w-3/4 hover:opacity-60 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
            ) : (
              <span className="flex items-center justify-center gap-2">
                REGISTRARSE <NotebookPen />
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
