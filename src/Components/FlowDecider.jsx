import React from "react";
import { UserAuth } from '../context/authContext';
import HomePage from "../Components/HomePage";
import LogIn from "../Components/LogIn";
import { HashRouter, Route, Routes } from "react-router-dom";
import CompareEfforts from "../Components/CompareEfforts";
import ViewEfforts from "../Components/ViewEfforts";
import NavigationBar from "../Components/NavigaitonBar";

export default function flowDecider(){
    const {user} = UserAuth();
    return(
        <div className="continer">
            <HashRouter>
                {user &&<NavigationBar/>}
                <Routes>
                    <Route path="/" element={user?<HomePage/>:<LogIn/>}/>
                    <Route path="/view" element={user?<ViewEfforts/>:<LogIn/>}/>
                    <Route path="/compare" element={user?<CompareEfforts/>:<LogIn/>}/>
                </Routes>
            </HashRouter>
        </div>
    );
}