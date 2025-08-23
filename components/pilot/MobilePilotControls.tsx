'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Square,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConnection } from '@/components/dashboard/ConnectionProvider';
import useMounted from '@/hooks/useMounted';

interface MobilePilotControlsProps {
  orientation: 'landscape' | 'portrait';
}

export default function MobilePilotControls({ orientation }: MobilePilotControlsProps) {
  const [linearVelocity] = useState<number>(0.15);
  const [angularVelocity] = useState<number>(Math.floor((Math.PI / 8) * 100) / 100);
  const [selectedTopic] = useState<string>('/cmd_vel');

  const isMounted = useMounted();
  const { selectedConnection } = useConnection();

  const publishSingleCommand = useCallback(async (commandDirection: string) => {
    if (!selectedConnection?.rosInstance || selectedConnection.status !== 'connected') {
      return;
    }

    try {
      const { rosInstance } = selectedConnection;
      const ROSLIB = (await import('roslib')).default;

      const twist = new ROSLIB.Topic({
        ros: rosInstance,
        name: selectedTopic,
        messageType: 'geometry_msgs/Twist',
      });

      const message = {
        linear: { x: 0, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: 0 },
      };

      switch (commandDirection) {
        case 'forward':
          message.linear.x = linearVelocity;
          break;
        case 'backward':
          message.linear.x = -linearVelocity;
          break;
        case 'stop':
          break;
        case 'cw':
          message.angular.z = -angularVelocity;
          break;
        case 'ccw':
          message.angular.z = angularVelocity;
          break;
      }

      const rosMessage = new ROSLIB.Message(message);
      twist.publish(rosMessage);
    } catch (error) {
      console.warn('Failed to publish command:', error);
    }
  }, [selectedConnection, selectedTopic, linearVelocity, angularVelocity]);

  if (!isMounted) {
    return null;
  }

  const isLandscape = orientation === 'landscape';

  return (
    <div
      data-testid="mobile-pilot-controls"
      className={`
        ${isLandscape ? 'p-2' : 'p-3'}
        ${isLandscape ? 'scale-90' : 'scale-100'}
      `}
    >
      {/* Compact movement grid */}
      <div className="grid grid-cols-3 gap-1 max-w-28 mx-auto">
        <div></div>
        <Button
          onClick={() => publishSingleCommand('forward')}
          size="sm"
          variant="outline"
          className={`
            ${isLandscape ? 'w-7 h-7' : 'w-8 h-8'}
            p-0 bg-gray-700/70 border-gray-500/50 hover:bg-gray-600/70 active:bg-gray-500/70
          `}
        >
          <ArrowUp className={`${isLandscape ? 'w-3 h-3' : 'w-4 h-4'} text-gray-200`} />
        </Button>
        <div></div>

        <Button
          onClick={() => publishSingleCommand('ccw')}
          size="sm"
          variant="outline"
          className={`
            ${isLandscape ? 'w-7 h-7' : 'w-8 h-8'}
            p-0 bg-gray-700/70 border-gray-500/50 hover:bg-gray-600/70 active:bg-gray-500/70
          `}
        >
          <ArrowLeft className={`${isLandscape ? 'w-3 h-3' : 'w-4 h-4'} text-gray-200`} />
        </Button>
        <Button
          onClick={() => publishSingleCommand('stop')}
          size="sm"
          variant="destructive"
          className={`
            ${isLandscape ? 'w-7 h-7' : 'w-8 h-8'}
            p-0 bg-red-700/70 border-red-600/50 hover:bg-red-600/70 active:bg-red-500/70`
          }
        >
          <Square className={`${isLandscape ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
        </Button>
        <Button
          onClick={() => publishSingleCommand('cw')}
          size="sm"
          variant="outline"
          className={` ${isLandscape ? 'w-7 h-7' : 'w-8 h-8'}
            p-0 bg-gray-700/70 border-gray-500/50 hover:bg-gray-600/70 active:bg-gray-500/70
          `}
        >
          <ArrowRight className={`${isLandscape ? 'w-3 h-3' : 'w-4 h-4'} text-gray-200`} />
        </Button>

        <div></div>
        <Button
          onClick={() => publishSingleCommand('backward')}
          size="sm"
          variant="outline"
          className={`
            ${isLandscape ? 'w-7 h-7' : 'w-8 h-8'}
            p-0 bg-gray-700/70 border-gray-500/50 hover:bg-gray-600/70 active:bg-gray-500/70
          `}
        >
          <ArrowDown className={`${isLandscape ? 'w-3 h-3' : 'w-4 h-4'} text-gray-200`} />
        </Button>
        <div></div>
      </div>

      {/* Speed display */}
      <div className="mt-2 text-center">
        <div className="text-[10px] text-white/70" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
          L: {linearVelocity.toFixed(2)} | A: {angularVelocity.toFixed(2)}
        </div>
      </div>
    </div>
  );
}