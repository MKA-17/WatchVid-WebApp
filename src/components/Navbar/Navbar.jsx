import React, { useEffect, useState } from "react";
import UploadModal from "../UploadModal/UploadModal";
import { useAuth } from "../../store/auth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./style.css";
import UserModal from "../UserModal/UserModal";

export default function Navbar() {
  const { auth, logout } = useAuth();
  const [isUploadModal, setIsUploadModal] = useState(false);
  const [isUserModal, setIsUserModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleUploadModal = () => {
    setIsUploadModal(() => true);
    setIsUserModal(() => false);
  };

  const handleSearch = (e) => {
    const value = e.target.value.split(" ").join("+");
    if (e.key === "Enter" && value.trim()) {
      navigate(`/?q=${value}`);
      window.location.reload();
    }
    // console.log(value)
  };

  const handleUserModal = () => {
    setIsUserModal(() => true);
  };

  useEffect(() => {
    // console.log(navigate)
  }, []);

  return (
    <nav className="navbar">
      <UserModal
        show={isUserModal}
        setShow={setIsUserModal}
        handleUploadModal={handleUploadModal}
      />
      <UploadModal setShow={setIsUploadModal} show={isUploadModal} />

      <div className="navbar-left">
        <a href="/" className="youtube-logo">
          WatchVid
        </a>
      </div>
      <div className="navbar-center">
        <input
          type="text"
          className="search-bar"
          placeholder="Search"
          onKeyDown={handleSearch}
        />
      </div>

      <div onClick={handleUserModal}>
        <img
          src={
            auth.token
              ? auth.user.image
              : "https://firebasestorage.googleapis.com/v0/b/video-41ea3.appspot.com/o/1699998646936profile.png?alt=media&token=f28c2c44-1099-4dd3-b95b-283bf13df0a1"
          }
          alt="Avatar"
          className="channel-avatar"
        />
      </div>
    </nav>
  );
}
