// Static LIDAR grid visualization

function LidarGrid() {
  return (
    <>
      {/* Grid circles */}
      {[25, 50, 75, 100].map((r) => (
        <circle
          key={r}
          cx="0"
          cy="0"
          r={r}
          fill="none"
          stroke="rgb(100 116 139)"
          strokeWidth="0.7"
          opacity="0.6"
        />
      ))}

      {/* Grid lines */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <line
            key={angle}
            x1="0"
            y1="0"
            x2={Math.cos(rad) * 100}
            y2={Math.sin(rad) * 100}
            stroke="rgb(100 116 139)"
            strokeWidth="0.7"
            opacity="0.6"
          />
        );
      })}

      {/* Robot center */}
      <circle cx="0" cy="0" r="3" fill="rgb(239 68 68)" />
    </>
  );
}

export default LidarGrid;
