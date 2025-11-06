import { MOCK_IMU } from './constants';

// TODO

function IMUCard() {
  return (
    <div className="bg-card border border-border rounded-sm p-4 h-full flex flex-col">
      <h3 className="text-sm font-mono font-semibold text-foreground tracking-wider mb-3">
        IMU
      </h3>

      <div className="space-y-3 text-xs font-mono flex-1 flex flex-col justify-center">
        {/* Angular Velocity */}
        <div>
          <span className="text-muted-foreground">
            ANGULAR VELOCITY (rad/s)
          </span>
          <div className="grid grid-cols-3 gap-2 mt-1">
            <div className="bg-secondary p-2 rounded-sm">
              <span className="text-muted-foreground">X</span>
              <p className="text-foreground font-bold">
                {MOCK_IMU.angularVelocity.x.toFixed(3)}
              </p>
            </div>
            <div className="bg-secondary p-2 rounded-sm">
              <span className="text-muted-foreground">Y</span>
              <p className="text-foreground font-bold">
                {MOCK_IMU.angularVelocity.y.toFixed(3)}
              </p>
            </div>
            <div className="bg-secondary p-2 rounded-sm">
              <span className="text-muted-foreground">Z</span>
              <p className="text-foreground font-bold">
                {MOCK_IMU.angularVelocity.z.toFixed(3)}
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
                {MOCK_IMU.linearAcceleration.x.toFixed(2)}
              </p>
            </div>
            <div className="bg-secondary p-2 rounded-sm">
              <span className="text-muted-foreground">Y</span>
              <p className="text-foreground font-bold">
                {MOCK_IMU.linearAcceleration.y.toFixed(2)}
              </p>
            </div>
            <div className="bg-secondary p-2 rounded-sm">
              <span className="text-muted-foreground">Z</span>
              <p className="text-foreground font-bold">
                {MOCK_IMU.linearAcceleration.z.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IMUCard;
