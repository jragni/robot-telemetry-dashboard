import type { IMUData } from './definitions';

export function DigitalView({ data }: { data: IMUData }) {
  return (
    <div className="space-y-3 text-xs font-mono flex-1 flex flex-col justify-center">
      {/* Angular Velocity */}
      <div>
        <span className="text-muted-foreground">ANGULAR VELOCITY (rad/s)</span>
        <div className="grid grid-cols-3 gap-2 mt-1">
          <div className="bg-secondary p-2 rounded-sm">
            <span className="text-muted-foreground">X</span>
            <p className="text-foreground font-bold">
              {data.angularVelocity.x.toFixed(3)}
            </p>
          </div>
          <div className="bg-secondary p-2 rounded-sm">
            <span className="text-muted-foreground">Y</span>
            <p className="text-foreground font-bold">
              {data.angularVelocity.y.toFixed(3)}
            </p>
          </div>
          <div className="bg-secondary p-2 rounded-sm">
            <span className="text-muted-foreground">Z</span>
            <p className="text-foreground font-bold">
              {data.angularVelocity.z.toFixed(3)}
            </p>
          </div>
        </div>
      </div>

      {/* Linear Acceleration */}
      <div>
        <span className="text-muted-foreground">
          LINEAR ACCELERATION (m/s²)
        </span>
        <div className="grid grid-cols-3 gap-2 mt-1">
          <div className="bg-secondary p-2 rounded-sm">
            <span className="text-muted-foreground">X</span>
            <p className="text-foreground font-bold">
              {data.linearAcceleration.x.toFixed(2)}
            </p>
          </div>
          <div className="bg-secondary p-2 rounded-sm">
            <span className="text-muted-foreground">Y</span>
            <p className="text-foreground font-bold">
              {data.linearAcceleration.y.toFixed(2)}
            </p>
          </div>
          <div className="bg-secondary p-2 rounded-sm">
            <span className="text-muted-foreground">Z</span>
            <p className="text-foreground font-bold">
              {data.linearAcceleration.z.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
