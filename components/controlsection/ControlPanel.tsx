'use client';

import { useEffect, useState } from 'react';

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Square,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import PilotModeToggle from '@/components/pilot/PilotModeToggle';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useConnection } from '@/components/dashboard/ConnectionProvider';
import useMounted from '@/hooks/useMounted';

/**
 * ControlPanel
 * NOTE: due to the roslib dependency, this component needs to be lazy loaded
 */
export default function ControlPanel(): React.ReactNode {
  const [linearVelocity, setLinearVelocity] = useState<number>(0.15);
  const [angularVelocity, setAngularVelocity] = useState<number>(
    Math.floor((Math.PI / 8) * 100) / 100,
  );
  const [direction, setDirection] = useState<string>('stop');
  const [selectedTopic, setSelectedTopic] = useState<string>('/cmd_vel');
  const [twistTopics, setTwistTopics] = useState<string[]>(['/cmd_vel']);

  const isMounted = useMounted();
  const { selectedConnection } = useConnection();

  // Fetch available Twist topics when connection changes
  useEffect(() => {
    const fetchTopics = async () => {
      if (!selectedConnection?.rosInstance) {
        setTwistTopics(['/cmd_vel']);
        return;
      }

      const { rosInstance } = selectedConnection;
      const ROSLIB = (await import('roslib')).default;

      const getTopics = new ROSLIB.Service({
        ros: rosInstance,
        name: '/rosapi/topics_for_type',
        serviceType: 'rosapi/TopicsForType',
      });

      const request = new ROSLIB.ServiceRequest({
        type: 'geometry_msgs/Twist',
      });

      getTopics.callService(request, (result: { topics?: string[] }) => {
        if (result?.topics && result.topics.length > 0) {
          setTwistTopics(result.topics);
          // If current selected topic is not in the list, reset to /cmd_vel or first available
          if (!result.topics.includes(selectedTopic)) {
            setSelectedTopic(result.topics.includes('/cmd_vel') ? '/cmd_vel' : result.topics[0]);
          }
        } else {
          // Fallback to default
          setTwistTopics(['/cmd_vel']);
          setSelectedTopic('/cmd_vel');
        }
      });
    };

    fetchTopics();
  }, [selectedConnection, selectedTopic]);

  useEffect(() => {
    const handleMove = async () => {
      if (!selectedConnection?.rosInstance) return;

      const { rosInstance } = selectedConnection;
      const ROSLIB = (await import('roslib')).default;

      // Priority control topic
      const twist = new ROSLIB.Topic({
        ros: rosInstance,
        name: selectedTopic,
        messageType: 'geometry_msgs/Twist',
      });

      const message = {
        linear: { x: 0, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: 0 },
      };

      switch (direction) {
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

      // Immediate publish with priority
      twist.publish(rosMessage);
    };
    handleMove();
  }, [
    angularVelocity,
    direction,
    linearVelocity,
    selectedConnection,
    selectedTopic,
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
    <div className="bg-gray-800 border border-gray-600 rounded p-3 h-fit">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs sm:text-sm font-medium text-gray-100 uppercase tracking-wide">Controls</h3>
        <Select onValueChange={setSelectedTopic} value={selectedTopic}>
          <SelectTrigger className="w-32 h-6 text-xs bg-gray-700 border-gray-500 text-gray-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {twistTopics.map((topic) => (
              <SelectItem key={topic} value={topic}>
                {topic}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Speed Controls - Horizontal for space efficiency */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-gray-300 w-12 shrink-0">Linear:</Label>
          <Slider
            className="flex-1"
            max={2}
            min={0}
            onValueChange={(val) => setLinearVelocity(val[0])}
            step={0.02}
            value={[linearVelocity]}
          />
          <span className="text-xs text-gray-400 font-mono w-12 text-right">{linearVelocity.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-gray-300 w-12 shrink-0">Angular:</Label>
          <Slider
            className="flex-1"
            max={2}
            min={0}
            onValueChange={(val) => setAngularVelocity(val[0])}
            step={0.02}
            value={[angularVelocity]}
          />
          <span className="text-xs text-gray-400 font-mono w-12 text-right">{angularVelocity.toFixed(2)}</span>
        </div>
      </div>

      {/* Movement Grid - Compact for all screens */}
      <div className="grid grid-cols-3 gap-1 mb-3 max-w-32 mx-auto">
        <div></div>
        <Button
          className="w-8 h-8 p-0 bg-gray-700 border-gray-500 hover:bg-gray-600"
          onClick={() => setDirection('forward')}
          size="sm"
          variant="outline"
        >
          <ArrowUp className="w-4 h-4 text-gray-200" />
        </Button>
        <div></div>

        <Button
          className="w-8 h-8 p-0 bg-gray-700 border-gray-500 hover:bg-gray-600"
          onClick={() => setDirection('ccw')}
          size="sm"
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 text-gray-200" />
        </Button>
        <Button
          className="w-8 h-8 p-0 bg-red-700 border-red-600 hover:bg-red-600"
          onClick={() => setDirection('stop')}
          size="sm"
          variant="destructive"
        >
          <Square className="w-4 h-4" />
        </Button>
        <Button
          className="w-8 h-8 p-0 bg-gray-700 border-gray-500 hover:bg-gray-600"
          onClick={() => setDirection('cw')}
          size="sm"
          variant="outline"
        >
          <ArrowRight className="w-4 h-4 text-gray-200" />
        </Button>

        <div></div>
        <Button
          className="w-8 h-8 p-0 bg-gray-700 border-gray-500 hover:bg-gray-600"
          onClick={() => setDirection('backward')}
          size="sm"
          variant="outline"
        >
          <ArrowDown className="w-4 h-4 text-gray-200" />
        </Button>
        <div></div>
      </div>

      <PilotModeToggle />
    </div>
  );
}