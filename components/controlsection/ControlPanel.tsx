"use client";

import { Play, Square, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ControlPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Control Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <div>

        </div>
        {/* Buttons */}
        <h3>Movement</h3>
        <div className="flex flex-col items-center gap-2">
          <div>
            <Button size="icon" variant="outline">
              <ArrowUp />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button size="icon" variant="outline">
              <ArrowLeft/>
            </Button>
            <Button size="icon" variant="outline">
              <Square color="red" fill="red" />
            </Button>
            <Button size="icon" variant="outline">
              <ArrowRight/>
            </Button>
          </div>
          <div>
            <Button size="icon" variant="outline">
              <ArrowDown/>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}