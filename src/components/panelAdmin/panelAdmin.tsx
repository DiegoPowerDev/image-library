"use client";
import styles from "@/components/styles.module.css";
import { CSSProperties, useState } from "react";
import { IconDatabase, IconUsers } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import UserAdminPanel from "@/components/panelAdmin/userAdminPanel";
import BackupPanel from "./backupPanel";

export default function PanelAdmin() {
  const [tab, setTab] = useState("users");
  return (
    <div className="w-full h-full  flex flex-col bg-black text-white 2xl:px-40">
      <div className="flex w-full h-16 items-center p-6 gap-4 bg-gray-900">
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
      <div
        style={{ "--theme": "gray" } as CSSProperties}
        className={cn(
          styles.scrollContainer,
          "flex-1 w-full overflow-y-auto p-8",
        )}
      >
        {tab === "users" ? <UserAdminPanel /> : <BackupPanel />}
      </div>
    </div>
  );
}
