"use client";
import { useState } from "react";
import { IconDatabase, IconUsers } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import UserAdminPanel from "@/components/panelAdmin/userAdminPanel";
import BackupPanel from "./backupPanel";

export default function PanelAdmin() {
  const [tab, setTab] = useState("users");
  return (
    <div className="w-full h-full p-6 space-y-6 flex flex-col bg-black text-white 2xl:px-40">
      <div className="grid w-full grid-cols-2 max-w-md gap-4">
        <Button
          variant="ghost"
          onClick={() => setTab("users")}
          className={cn(
            tab === "users" && "bg-white text-black",
            "gap-2 border border-white",
          )}
        >
          <IconUsers size={18} />
          Usuarios
        </Button>
        <Button
          variant="ghost"
          onClick={() => setTab("backup")}
          value="backup"
          className={cn(
            tab === "backup" && "bg-white text-black",
            "gap-2 border border-white",
          )}
        >
          <IconDatabase size={18} />
          Backups
        </Button>
      </div>

      {tab === "users" ? <UserAdminPanel /> : <BackupPanel />}
    </div>
  );
}
