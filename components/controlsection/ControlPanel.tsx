"use client";

import { useEffect, useState } from "react";

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

import { useConnection } from "@/components/dashboard/ConnectionProvider";
import useMounted from '@/hooks/useMounted';

export default function ControlPanel(): React.ReactNode {
  const [linearVelocity, setLinearVelocity] = useState<number>(0.05);
  const [angularVelocity, setAngularVelocity] = useState<number>(0.5);
  const [direction, setDirection] = useState<string>("stop");

  const isMounted = useMounted();
  const { selectedConnection } = useConnection();

  useEffect(() => {
    const handleMove = async () => {
      const ROSLIB = (await import('roslib')).default

        if (!selectedConnection || !selectedConnection.rosInstance) return;

        const { rosInstance } = selectedConnection;

        const twist = new ROSLIB.Topic({
          ros: rosInstance,
          name: '/cmd_vel',
          messageType: 'geometry_msgs/Twist'
        });

        const message = {
          linear: { x: 0, y: 0, z: 0 },
          angular: { x: 0, y: 0, z: 0 }
        };

        switch(direction) {
          case 'forward':
            message.linear.x = linearVelocity;
            break;
          case 'backward':
            message.linear.x = -linearVelocity;
            break;
          case 'stop':
            // Values are already 0 from the initialization above
            break;
          case 'cw':
            message.angular.z = -angularVelocity;
            break;
          case 'ccw':
            message.angular.z = angularVelocity;
            break;
          default:
            // Values are already 0 from the initialization above
            break;
        }

        const rosMessage = new ROSLIB.Message(message);
        twist.publish(rosMessage);
    };
    handleMove();
  }, [
    angularVelocity,
    direction,
    linearVelocity,
    selectedConnection,
    setDirection
  ]);

  if (!isMounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Control Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Control Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2 text-md">Publishing to <code className="bg-accent">/cmd_vel</code></p>
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
            <Button
              onClick={() => setDirection('forward')}
              size="icon"
              variant="outline"
            >
              <ArrowUp />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setDirection('ccw')}
              size="icon"
              variant="outline"
            >
              <ArrowLeft/>
            </Button>
            <Button
              onClick={() => setDirection('stop')}
              size="icon"
              variant="outline"
            >
              <Square color="red" fill="red" />
            </Button>
            <Button
              onClick={() => setDirection('cw')}
              size="icon"
              variant="outline"
            >
              <ArrowRight/>
            </Button>
          </div>
          <div>
            <Button
              onClick={() => setDirection('backward')}
              size="icon"
              variant="outline"
            >
              <ArrowDown/>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}