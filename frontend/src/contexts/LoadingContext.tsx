import React, { createContext, useContext, useState, type ReactNode } from "react";

interface LoadingContextType {
    isLoading: boolean;
    setLoading: (val: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);

    const setLoading = (val: boolean) => setIsLoading(val);

    return (
        <LoadingContext.Provider value={{ isLoading, setLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) throw new Error("useLoading must be used within a LoadingProvider");
    return context;
};
