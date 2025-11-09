// App.tsx - Main application entry point

import DashboardLayout from './features/dashboard/DashboardLayout';
import { RosProvider } from './features/ros/RosContext';

function App() {
  return (
    <RosProvider>
      <DashboardLayout />
    </RosProvider>
  );
}

export default App;
