"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import { useConnection } from "@/components/dashboard/ConnectionProvider";

import AddControlModal from "./AddControlModal"

const ControlPanel = dynamic(() => import("./ControlPanel"), { ssr: false });

/**
 * ControlSection
 */
export default function ControlSection() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const { selectedConnection } = useConnection();

  return (
    <section className="w-max-screen m-2 p-4 w-100">
      <h2 className="font-bold my-2">Controls</h2>
      <ControlPanel />
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