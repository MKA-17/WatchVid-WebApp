import { useEffect, useState } from "react";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home";
import { useAuth } from "./store/auth";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import Card from "./components/Card/Card";
import Watch from "./pages/Watch/Watch.Jsx";
import UnAuthorizedPage from "./pages/404/404";
import User from "./pages/User/User";
import HistoryVideos from "./pages/HistoryVideos/HistoryVideos";
import LikedVideos from "./pages/LikedVideos/LikedVideos";
import EditUser from "./pages/EditUser/EditUser";
import Layout from "./components/Layout/Layout";

function App() {
  const { auth, setAuth, logout } = useAuth();
  useEffect(() => {
    // console.log("auth: ", auth)
    if (auth.token) {
      let tokenExpiry = JSON.parse(atob(auth.token.split(".")[1]))?.exp * 1000;

      console.log(tokenExpiry - Date.now());
      let intervalId = setInterval(() => {
        logout();
        clearInterval(intervalId);
        console.log("Token expired.");
      }, tokenExpiry - Date.now());
    }
  }, [auth.token]);

  return (
    <>
      {/* <Sidebar> */}
      <Layout>
        {/* <Watch/> */}
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/watch/:videoId" exact element={<Watch />} />

          {auth.token && (
            <>
              <Route path="/user/edit" element={<EditUser />} />
              <Route path="/user/history" element={<HistoryVideos />} />
              <Route path="/user/liked-videos" element={<LikedVideos />} />
            </>
          )}
          <Route path="/user/:userId" element={<User />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<UnAuthorizedPage />} />
        </Routes>
      </Layout>
    </>
  );
}

export default App;
