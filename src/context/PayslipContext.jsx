import { createContext, useContext, useState, useMemo, useCallback } from "react";

const PayslipContext = createContext(undefined);

export const usePayslip = () => {
    const context = useContext(PayslipContext);

    if (context === undefined) {
        throw new Error("usePayslip must be used within a PayslipProvider");
    }

    return context;
};

export const PayslipProvider = ({ children }) => {
    const [payslipData, setPayslipData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const resetData = useCallback(() => {
        setPayslipData(null);
        setError(null);
    }, []);

    const value = useMemo(
        () => ({ 
            payslipData, 
            setPayslipData, 
            loading, 
            setLoading,
            error,
            setError,
            resetData 
        }),
        [payslipData, loading, error, resetData]
    );

    return (
        <PayslipContext.Provider value={value}>
            {children}
        </PayslipContext.Provider>
    );
};

