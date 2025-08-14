"use client"

import axios from "axios";
import { useEffect, useState } from "react";
import LoginNavbar from "./PublicNavbar";
import PublicNavbar from "./PublicNavbar";

export function NavbarWrapper(){
    const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

    useEffect(()=>{
        async function checkLoginStatus() {
            try{
                const response=await axios.get("/api/auth/me");
                setLoggedIn(true);
            }catch(error){
                setLoggedIn(false);
            }
        }

        checkLoginStatus();
    },[]);

    if(loggedIn === null) return null; 
    

    if(loggedIn){
        return <LoginNavbar />;
    } 
    return <PublicNavbar />;
}