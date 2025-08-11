"use client";

import { useState } from "react";

import { useConnection } from "@/components/dashboard/ConnectionProvider";

import AddControlModal from "./AddControlModal"

/**
 * ControlSection
 */
export default function ControlSection() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const { selectedConnection } = useConnection();

  return (
    <section className="w-full m-2 p-4">
      <h2 className="font-bold">Controls</h2>
      <div className="py-2">
        <AddControlModal
          isDialogOpen={isDialogOpen}
          selectedConnection={selectedConnection}
          setIsDialogOpen={setIsDialogOpen}
        />
      </div>
    </section>
  );
}