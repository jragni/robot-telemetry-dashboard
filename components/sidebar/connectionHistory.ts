interface ConnectionHistory {
  connectionName: string;
  webSocketUrl: string;
  lastUsed: string;
}

const STORAGE_KEY = 'robot-dashboard-connection-history';
const MAX_HISTORY_ITEMS = 10;

export const getConnectionHistory = (): ConnectionHistory[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const history = JSON.parse(stored) as ConnectionHistory[];
    // Sort by most recently used
    return history.sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime());
  } catch {
    return [];
  }
};

export const addConnectionToHistory = (connectionName: string, webSocketUrl: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getConnectionHistory();
    
    // Remove existing entry if it exists (to avoid duplicates)
    const filteredHistory = history.filter(
      item => !(item.connectionName === connectionName && item.webSocketUrl === webSocketUrl)
    );
    
    // Add new entry at the beginning
    const newEntry: ConnectionHistory = {
      connectionName,
      webSocketUrl,
      lastUsed: new Date().toISOString(),
    };
    
    const updatedHistory = [newEntry, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch {
    // Silently fail if localStorage is not available
  }
};

export const removeConnectionFromHistory = (connectionName: string, webSocketUrl: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getConnectionHistory();
    const filteredHistory = history.filter(
      item => !(item.connectionName === connectionName && item.webSocketUrl === webSocketUrl)
    );
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredHistory));
  } catch {
    // Silently fail if localStorage is not available
  }
};