"use client";

import { useState } from "react";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Square,
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export default function ControlPanel() {
  const [linearVelocity, setLinearVelocity] = useState<number>(0.05);
  const [angularVelocity, setAngularVelocity] = useState<number>(0.05);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Control Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label
            className="mb-4"
            htmlFor="linear-vel-slider"
          >
            Linear Velocity: {linearVelocity} {`m/s`}
          </Label>
          <Slider
            id="linear-vel-slider"
            min={-2}
            max={2}
            onValueChange={(val) => setLinearVelocity(val[0])}
            step={0.02}
            value={[linearVelocity]}
          >
          </Slider>
        </div>
        <div className="mb-4">
          <Label
            className="mb-4"
            htmlFor="angular-vel-slider"
          >
            Angular Velocity: {angularVelocity} {`rad/s`}
          </Label>
          <Slider
            id="angular-vel-slider"
            min={-2}
            max={2}
            onValueChange={(val) => setAngularVelocity(val[0])}
            step={0.02}
            value={[angularVelocity]}
          >
          </Slider>
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