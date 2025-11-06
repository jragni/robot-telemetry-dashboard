import { MOCK_TOPICS } from './constants';

function TopicsList() {
  return (
    <div className="bg-card border border-border rounded-sm p-4 h-full flex flex-col max-h-[300px]">
      <h3 className="text-sm font-mono font-semibold text-foreground tracking-wider mb-3">
        TOPICS
      </h3>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="space-y-1">
          {MOCK_TOPICS.map((topic) => (
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
                <span className="text-[10px] font-mono text-muted-foreground">
                  {topic.rate} Hz
                </span>
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    topic.active
                      ? 'bg-green-500 animate-pulse'
                      : 'bg-muted-foreground/30'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <span>TOTAL TOPICS</span>
          <span>{MOCK_TOPICS.length}</span>
        </div>
      </div>
    </div>
  );
}

export default TopicsList;
