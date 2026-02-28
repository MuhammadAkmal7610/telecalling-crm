import { createContext, useContext, useEffect, useState } from 'react';

const HealthCheckContext = createContext({});

export const useHealthCheck = () => useContext(HealthCheckContext);

export const HealthCheckProvider = ({ children }) => {
    const [isBackendAvailable, setIsBackendAvailable] = useState(true);

    useEffect(() => {
        let timeoutId;
        let pollDelay = 2000; // Start with 2s
        const maxDelay = 30000; // Cap at 30s

        const checkHealth = async () => {
            // MOCKED HEALTH CHECK: Ignore actual network and backend status
            setIsBackendAvailable(true);
            return;

            /* -- COMMENTED OUT BACKEND HEALTH POLLING --
            // Don't poll if browser knows it's offline
            if (!navigator.onLine) {
                setIsBackendAvailable(false);
                return;
            }

            try {
                // Use relative path since Vite proxies /api to backend
                const response = await fetch('/api/health');
                if (response.ok) {
                    setIsBackendAvailable(true);
                    pollDelay = 5000; // Reset to stable 5s when healthy
                } else {
                    setIsBackendAvailable(false);
                    // Exponential backoff when down, but cap at maxDelay
                    pollDelay = Math.min(pollDelay * 1.5, maxDelay);
                }
            } catch (error) {
                console.error("Backend health check failed:", error);
                setIsBackendAvailable(false);
                pollDelay = Math.min(pollDelay * 1.5, maxDelay);
            }

            // Schedule next poll
            timeoutId = setTimeout(checkHealth, pollDelay);
            ------------------------------------------ */
        };

        // Network event listeners for immediate reaction
        const handleOnline = () => {
            pollDelay = 2000; // Reset delay on reconnect
            checkHealth();
        };
        const handleOffline = () => setIsBackendAvailable(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check
        checkHealth();

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const value = {
        isBackendAvailable,
    };

    return (
        <HealthCheckContext.Provider value={value}>
            {children}
            {!isBackendAvailable && (
                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: '#FF5252',
                    color: 'white',
                    padding: '10px',
                    textAlign: 'center',
                    zIndex: 9999,
                    fontWeight: 'bold',
                    boxShadow: '0px -2px 10px rgba(0,0,0,0.2)'
                }}>
                    ⚠️ Backend Connection Lost. Reconnecting...
                </div>
            )}
        </HealthCheckContext.Provider>
    );
};
