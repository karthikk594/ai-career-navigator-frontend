import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import Profile from "./pages/Profile";
import Resume from "./pages/Resume";
import CareerRoadmap from "./pages/CareerRoadmap";
function App(){

    return(

        <BrowserRouter>

            <Routes>

                <Route path="/" element={<Landing/>}/>

                <Route path="/login" element={<Login/>}/>

                <Route path="/register" element={<Register/>}/>

                <Route path="/dashboard" element={<UserDashboard/>}/>

                <Route path="/profile" element={<Profile />}/>
                
                <Route
path="/resume"
element={<Resume/>}
/>
                <Route
  path="/roadmap"
  element={<CareerRoadmap />}
/>
            </Routes>


        </BrowserRouter>

    );

}


export default App;