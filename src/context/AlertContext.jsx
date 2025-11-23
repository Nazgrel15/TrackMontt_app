"use client";
import { createContext, useContext, useState, useEffect } from "react";

const AlertContext = createContext();

export function AlertProvider({ children }) {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadAlerts = async () => {
        try {
            // Fetch alerts from the API
            const res = await fetch("/api/alerts");
            if (res.ok) {
                const data = await res.json();
                setAlerts(data);
            }
        } catch (e) {
            console.error("Error loading alerts:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAlerts();

        // Optional: Polling every 60 seconds to keep badge updated
        const interval = setInterval(loadAlerts, 60000);
        return () => clearInterval(interval);
    }, []);

    // Derived state
    const unreadCount = alerts.length; // Assuming all fetched alerts are "active/unread" for now

    return (
        <AlertContext.Provider value={{ alerts, loading, unreadCount, refreshAlerts: loadAlerts }}>
            {children}
        </AlertContext.Provider>
    );
}

export function useAlerts() {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error("useAlerts must be used within an AlertProvider");
    }
    return context;
}
