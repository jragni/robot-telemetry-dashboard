import { useRosContext } from '@/features/ros/RosContext';
import { useTopics } from '@/features/ros/useTopics';

function TopicsList() {
  const { connectionState } = useRosContext();
  const { topics, loading } = useTopics();

  const isConnected = connectionState === 'connected';

  return (
    <div className="bg-card border border-border rounded-sm p-4 h-full flex flex-col min-h-0">
      <h3 className="text-sm font-mono font-semibold text-foreground tracking-wider mb-3 flex-shrink-0">
        TOPICS
      </h3>

      {!isConnected ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs font-mono text-muted-foreground text-center">
            Not connected to robot
          </p>
        </div>
      ) : loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs font-mono text-muted-foreground">
            Loading topics...
          </p>
        </div>
      ) : topics.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs font-mono text-muted-foreground">
            No topics found
          </p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="space-y-1">
              {topics.map((topic) => (
                <div
                  key={topic.name}
                  className="flex items-center justify-between py-1.5 px-2 rounded-sm hover:bg-secondary/50 transition-colors cursor-pointer group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-foreground truncate">
                      {topic.name}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      {topic.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
              <span>TOTAL TOPICS</span>
              <span>{topics.length}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default TopicsList;
