/**
 *
 */
export function LandingProblemSolution() {
  return (
    <section className="bg-surface-primary border-t border-b border-border py-24 px-8">
      <div className="landing-ps-grid max-w-300 mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-center relative">
        <div>
          <span className="font-mono text-xs font-semibold text-accent uppercase tracking-widest block mb-4">
            The Problem
          </span>
          <h3 className="font-sans text-xl font-semibold text-text-primary uppercase tracking-wide mb-4">
            Fragmented Toolchains
          </h3>
          <p className="font-sans text-sm text-text-secondary leading-relaxed">
            Monitoring robot fleets means juggling terminal windows, RViz
            instances, and custom scripts. Each robot needs its own connection,
            its own visualization tools. There is no unified view of fleet
            health. When something goes wrong, you are already behind.
          </p>
        </div>
        <div>
          <span className="font-mono text-xs font-semibold text-accent uppercase tracking-widest block mb-4">
            The Solution
          </span>
          <h3 className="font-sans text-xl font-semibold text-text-primary uppercase tracking-wide mb-4">
            One Tab. Full Control.
          </h3>
          <p className="font-sans text-sm text-text-secondary leading-relaxed">
            A single browser tab replaces the entire toolchain. Connect to any
            ROS2 robot via rosbridge WebSocket, stream live telemetry, and send
            commands. Fleet-first navigation shows every robot in one view with
            drill-down to individual telemetry workspaces.
          </p>
        </div>
      </div>
    </section>
  );
}
