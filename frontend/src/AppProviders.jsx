import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { HealthCheckProvider } from './context/HealthCheckContext';
import { SocketProvider } from './contexts/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import { DialerProvider } from './context/DialerContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationContainer } from './components/ui/Notification';
import { useNotification } from './context/NotificationContext';
import { ModalProvider } from './context/ModalContext';
import GlobalModal from './components/GlobalModal';

function NotificationSystem() {
  const { notifications, removeNotification } = useNotification();
  return <NotificationContainer notifications={notifications} onRemove={removeNotification} />;
}

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <ModalProvider>
            <HealthCheckProvider>
              <NotificationProvider>
                <Toaster position="top-center" reverseOrder={false} />
                <NotificationSystem />
                <Router>
                  <SocketProvider>
                    <DialerProvider>
                      {children}
                      <GlobalModal />
                    </DialerProvider>
                  </SocketProvider>
                </Router>
              </NotificationProvider>
            </HealthCheckProvider>
          </ModalProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
