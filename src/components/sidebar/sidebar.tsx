"use client";

import { logout } from "@/firebase/auth";
import { cn } from "@/lib/utils";
import { useFireStore } from "@/store/firestore";
import { useUserStore } from "@/store/userStore";
import {
  IconAdjustments,
  IconBooks,
  IconBrandFacebook,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconDeviceGamepad,
  IconDoor,
  IconFileLike,
  IconHome,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import { UserRoundX } from "lucide-react";

export default function Sidebar() {
  const user = useUserStore((s) => s.currentUser);
  const menu = useFireStore((s) => s.menu);
  const email = useFireStore((s) => s.email);
  const setMenu = useFireStore((s) => s.setMenu);
  const sideOption = useFireStore((s) => s.sideOption);
  const setSideOption = useFireStore((s) => s.setSideOption);
  const setUid = useFireStore((s) => s.setUid);

  return (
    <div
      className={cn(
        menu ? "w-52" : "w-16",
        "h-screen transition-all ease-out duration-200 z-20 left-0 top-0 fixed flex flex-col justify-between text-white bg-gray-900",
      )}
    >
      <div
        className={cn(
          !menu && "justify-center",
          "bg-gray-500 truncate  hover:bg-gray-700 text-white h-16 items-center p-4 w-full font-bold flex gap-2 duration-200 cursor-pointer",
        )}
      >
        <div
          onClick={() => {
            logout();
            setUid(null);
          }}
          className="hover:scale-125 duration-200"
        >
          <IconDoor size={30} />
        </div>
        {menu &&
          `Hola ${
            user?.displayName.toUpperCase() ||
            email?.slice(0, email.indexOf("@"))
          }`}
      </div>
      <div>
        <div className="flex flex-col items-center justify-center  overflow-hidden">
          <div
            onClick={() => setSideOption("Biblioteca")}
            className={cn(
              !menu && "justify-center",
              sideOption === "Biblioteca"
                ? "bg-black "
                : "bg-gray-500 hover:bg-gray-700",
              "text-white truncate max-h-16 items-center p-4 w-full font-bold flex gap-2 duration-200 cursor-pointer",
            )}
          >
            <IconBooks size={30} />
            {menu && "Biblioteca"}
          </div>

          <div
            onClick={() => setSideOption("Calendario")}
            className={cn(
              !menu && "justify-center",
              sideOption === "Calendario"
                ? "bg-black "
                : "bg-gray-500 hover:bg-gray-700",
              "text-white truncate max-h-16 items-center p-4 w-full font-bold flex gap-2 duration-200 cursor-pointer",
            )}
          >
            <IconCalendar size={30} />
            {menu && "Calendario"}
          </div>

          <div
            onClick={() => setSideOption("Eliminados")}
            className={cn(
              !menu && "justify-center",
              sideOption === "Eliminados"
                ? "bg-black "
                : "bg-gray-500 hover:bg-gray-700",
              "text-white truncate max-h-16 items-center p-4 w-full font-bold flex gap-2 duration-200 cursor-pointer",
            )}
          >
            <IconTrash size={30} />
            {menu && "Eliminados"}
          </div>
          {user?.role === "admin" && (
            <>
              <div
                onClick={() => setSideOption("Panel")}
                className={cn(
                  !menu && "justify-center",
                  sideOption === "Panel"
                    ? "bg-black "
                    : "bg-gray-500 hover:bg-gray-700",
                  "text-white truncate max-h-16 items-center p-4 w-full font-bold flex gap-2 duration-200 cursor-pointer",
                )}
              >
                <IconDeviceGamepad size={30} />
                {menu && "Panel de control"}
              </div>
            </>
          )}
        </div>
      </div>
      <div
        onClick={() => setMenu()}
        className="h-12 w-full bg-gray-500 hover:bg-gray-700 flex items-center duration-200 justify-end p-4 cursor-pointer"
      >
        {menu ? <IconChevronLeft /> : <IconChevronRight />}
      </div>
    </div>
  );
}
