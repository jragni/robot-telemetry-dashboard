/** AllMinimizedMessage
 * @description Displays a message when all workspace panels are minimized.
 */
export function AllMinimizedMessage() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <p className="font-mono text-xs text-text-muted">
        All panels minimized — click a tab below to restore
      </p>
    </div>
  );
}
