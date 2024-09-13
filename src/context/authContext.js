import React, { createContext, useState, useContext, useEffect } from "react";
import { GoogleAuthProvider, signOut, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { auth } from "../config/firebase-config";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const googleSignIn = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider);
    };

    const googleSignOut = () => {
        signOut(auth);
    };

    useEffect(() => {
        const unSubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unSubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ googleSignIn, googleSignOut, user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

// Export UserAuth as useAuth
export const UserAuth = useAuth;
