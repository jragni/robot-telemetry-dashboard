'use client';

import { useEffect, useState } from 'react';
import ROSLIB from 'roslib';

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
  const [angularVelocity, setAngularVelocity] = useState<number>(Math.floor(Math.PI/8*100) / 100);
  const [direction, setDirection] = useState<string>('stop');
  const [selectedTopic, setSelectedTopic] = useState<string>('/cmd_vel');
  const [twistTopics, setTwistTopics] = useState<string[]>(['/cmd_vel']);

  const isMounted = useMounted();
  const { selectedConnection } = useConnection();

  // Fetch available Twist topics when connection changes
  useEffect(() => {
    if (!selectedConnection?.rosInstance) {
      setTwistTopics(['/cmd_vel']);
      return;
    }

    const { rosInstance } = selectedConnection;

    const getTopics = new ROSLIB.Service({
      ros: rosInstance,
      name: '/rosapi/topics_for_type',
      serviceType: 'rosapi/TopicsForType',
    });

    const request = new ROSLIB.ServiceRequest({
      type: 'geometry_msgs/Twist',
    });

    getTopics.callService(request, (result: any) => {
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
  }, [selectedConnection, selectedTopic]);

  useEffect(() => {
    const handleMove = () => {

      if (!selectedConnection?.rosInstance) return;

      const { rosInstance } = selectedConnection;

      const twist = new ROSLIB.Topic({
        ros: rosInstance,
        name: selectedTopic,
        messageType: 'geometry_msgs/Twist',
      });

      const message = {
        linear: { x: 0, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: 0 },
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
    <Card>
      <CardHeader>
        <CardTitle>Control Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label htmlFor="topic-select">Publishing Topic:</Label>
          <Select onValueChange={setSelectedTopic} value={selectedTopic}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select topic..." />
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
        <div className="mb-4">
          <Label
            className="mb-4"
            htmlFor="linear-vel-slider"
          >
            Linear Velocity: {linearVelocity} {'m/s'}
          </Label>
          <Slider
            id="linear-vel-slider"
            max={2}
            min={0}
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
            Angular Velocity: {angularVelocity} {'rad/s'}
          </Label>
          <Slider
            id="angular-vel-slider"
            max={2}
            min={0}
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