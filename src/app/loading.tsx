import { IconCat, IconRocket } from "@tabler/icons-react";

export default function Loading() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-black">
      <div className="w-64 h-64 p-12 border-8 border-gray-800/20 border-t-gray-800 rounded-full animate-spin">
        <img src="/catLoading.svg" />
      </div>
    </div>
  );
}
