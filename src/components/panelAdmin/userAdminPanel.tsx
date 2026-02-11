"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  IconSearch,
  IconUserEdit,
  IconTrash,
  IconUserOff,
  IconUserCheck,
  IconShield,
  IconFilter,
  IconX,
  IconDeviceFloppy,
  IconPlus,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useUserStore } from "@/store/userStore";

interface User {
  id: string;
  email: string;
  displayName: string;
  role: "admin" | "editor" | "viewer";
  status: "active" | "disabled";
  createdAt: Date;
  lastLogin?: Date;
}

const ROLES = {
  admin: {
    label: "Administrador",
    color: "bg-red-500",
    icon: IconShield,
  },
  editor: {
    label: "Editor",
    color: "bg-blue-500",
    icon: IconUserEdit,
  },
  viewer: {
    label: "Visualizador",
    color: "bg-green-500",
    icon: IconUserCheck,
  },
};

const STATUS = {
  active: {
    label: "Activo",
    color: "bg-green-500",
  },
  disabled: {
    label: "Deshabilitado",
    color: "bg-gray-500",
  },
};

export default function UserAdminPanel() {
  const [createDialog, setCreateDialog] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "viewer" | "editor">(
    "viewer",
  );
  const [newArea, setNewArea] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState<"admin" | "editor" | "viewer">("viewer");

  // Store de usuarios
  const users = useUserStore((s) => s.users);
  const loadUsers = useUserStore((s) => s.loadUsers);
  const updateUser = useUserStore((s) => s.updateUser);
  const toggleUserStatus = useUserStore((s) => s.toggleUserStatus);
  const createUser = useUserStore((s) => s.createUser);
  const deleteUser = useUserStore((s) => s.deleteUser);
  const currentUser = useUserStore((s) => s.currentUser);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Filtrado de usuarios
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const createNewUser = async () => {
    try {
      await createUser(newEmail, newPassword, newName, newRole);
      toast.success("Usuario creado");
      setCreateDialog(false);
    } catch (error) {
      toast.error("Error al crear usuario");
      console.error(error);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setNombre(user.displayName);
    setRol(user.role);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id);
      toast.success(`Usuario ${userToDelete.displayName} eliminado`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      toast.error("Error al eliminar usuario");
      console.error(error);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await toggleUserStatus(user.id);
      const newStatus =
        user.status === "active" ? "deshabilitado" : "habilitado";
      toast.success(`Usuario ${newStatus}`);
    } catch (error) {
      toast.error("Error al cambiar estado");
      console.error(error);
    }
  };

  const handleUpdateUser = async (userId: string) => {
    try {
      console.log(rol, nombre);
      await updateUser(userId, rol, nombre);
      toast.success("Perfil actualizado");
      setEditDialogOpen(false);
    } catch (error) {
      toast.error("Error al actualizar rol");
      console.error(error);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  const hasActiveFilters =
    searchTerm || roleFilter !== "all" || statusFilter !== "all";

  return (
    <div className="w-full h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            onClick={() => console.log(currentUser)}
            className="text-3xl font-bold text-white"
          >
            Administración de Usuarios
          </h1>
          <p className="text-gray-400 mt-1">
            {filteredUsers.length} de {users.length} usuarios
          </p>
        </div>
        <Button onClick={() => setCreateDialog(true)}>
          <IconPlus />
          Nuevo Usuario
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-gray-900 p-4 rounded-lg space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Búsqueda */}
          <div className="flex-1 min-w-[250px] relative">
            <IconSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtro por rol */}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="viewer">Visualizador</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro por estado */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="disabled">Deshabilitados</SelectItem>
            </SelectContent>
          </Select>

          {/* Limpiar filtros */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-2"
            >
              <IconX size={16} />
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-white">Usuario</TableHead>
              <TableHead className="text-white">Email</TableHead>
              <TableHead className="text-white">Rol</TableHead>
              <TableHead className="text-white">Estado</TableHead>
              <TableHead className="text-white">Último acceso</TableHead>
              <TableHead className="text-white text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center p-4 text-gray-400"
                >
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const RoleIcon = ROLES[user.role].icon;
                const isCurrentUser = user.id === currentUser?.id;

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-white">
                      <div className="flex items-center gap-2">
                        {user.displayName}
                        {isCurrentUser && <Badge className="text-xs">Tú</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "flex items-center gap-1 w-fit",
                          ROLES[user.role].color,
                        )}
                      >
                        <RoleIcon size={14} />
                        {ROLES[user.role].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("w-fit", STATUS[user.status].color)}>
                        {STATUS[user.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "Nunca"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {/* Editar rol */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditUser(user)}
                          title="Editar usuario"
                        >
                          <IconUserEdit size={18} />
                        </Button>

                        {/* Habilitar/Deshabilitar */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(user)}
                          disabled={isCurrentUser}
                          title={
                            user.status === "active"
                              ? "Deshabilitar"
                              : "Habilitar"
                          }
                        >
                          {user.status === "active" ? (
                            <IconUserOff
                              size={18}
                              className="text-orange-500"
                            />
                          ) : (
                            <IconUserCheck
                              size={18}
                              className="text-green-500"
                            />
                          )}
                        </Button>

                        {/* Eliminar */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(user)}
                          disabled={isCurrentUser}
                          title="Eliminar usuario"
                        >
                          <IconTrash size={18} className="text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* DIALOG DE CREACIÓN DE USUARIO*/}

      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="w-2/6">
          <DialogHeader>
            <DialogTitle>Nuevo Usuario</DialogTitle>
            <DialogDescription>Creación de Usuario</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Contraseña</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="flex gap-2 w-full justify-center">
              <div className="flex flex-col  gap-2">
                <label className="flex items-center">Rol</label>
                <Select
                  value={newRole}
                  onValueChange={(value: "admin" | "editor" | "viewer") => {
                    setNewRole(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <IconShield size={16} />
                        Administrador
                      </div>
                    </SelectItem>
                    <SelectItem value="editor">
                      <div className="flex items-center gap-2">
                        <IconUserEdit size={16} />
                        Editor
                      </div>
                    </SelectItem>
                    <SelectItem value="viewer">
                      <div className="flex items-center gap-2">
                        <IconUserCheck size={16} />
                        Visualizador
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="w-full flex justify-center">
            <Button
              className="gap-2 flex w-40"
              onClick={() => {
                createNewUser();
              }}
            >
              Guardar <IconDeviceFloppy />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de edición */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="w-2/6">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Cambiar datos de {selectedUser?.displayName.toUpperCase()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm  font-bold">EMAIL:</label>
              <span className=""> {selectedUser?.email || ""}</span>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre</label>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rol</label>
              <Select
                value={rol}
                onValueChange={(value: "admin" | "editor" | "viewer") => {
                  setRol(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <IconShield size={16} />
                      Administrador
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div className="flex items-center gap-2">
                      <IconUserEdit size={16} />
                      Editor
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <IconUserCheck size={16} />
                      Visualizador
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Permisos por rol:</strong>
                <ul className="mt-2 space-y-1 ml-4">
                  <li>
                    • <strong>Admin:</strong> Acceso total al sistema
                  </li>
                  <li>
                    • <strong>Editor:</strong> Crear y editar contenido
                  </li>
                  <li>
                    • <strong>Visualizador:</strong> Solo lectura
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="w-full flex justify-center">
            <Button
              className="gap-2 flex w-40"
              onClick={() => {
                if (selectedUser) {
                  handleUpdateUser(selectedUser.id);
                }
              }}
            >
              Guardar <IconDeviceFloppy />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-black border-2 border-red-500 text-red-500">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente al usuario{" "}
              <strong>{userToDelete?.displayName}</strong> (
              {userToDelete?.email}). Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 cursor-pointer"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
