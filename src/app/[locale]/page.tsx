import { DropZone } from "@/components/upload/DropZone";

export default function Home() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Drop Zone */}
        <DropZone />
      </div>
    </div>
  );
}
