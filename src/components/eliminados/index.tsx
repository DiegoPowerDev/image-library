import Table from "../table";

export default function Eliminados() {
  return (
    <>
      <div className="w-full h-16 p-4 flex justify-center text-white text-2xl bg-gray-900">
        IMAGENES ELIMINADAS
      </div>
      <div className="flex w-full h-full p-6">
        <Table />
      </div>
    </>
  );
}
