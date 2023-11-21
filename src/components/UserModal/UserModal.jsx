import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useAuth } from "../../store/auth";
import { Link, useNavigate } from "react-router-dom";

export default function UserModal({ show, setShow, handleUploadModal }) {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const handleClose = () => setShow(false);

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="channel-info border-bottom p-3 d-flex flex-column flex-sm-row align-items-center justify-content-between">
            <div
              className="d-flex align-items-center mb-3 mb-sm-0"
              onClick={() => auth.token && navigate(`/user/${auth.user.id}`)}
            >
              <img
                src={
                  auth.user.image ||
                  "https://firebasestorage.googleapis.com/v0/b/video-41ea3.appspot.com/o/1699998646936profile.png?alt=media&token=f28c2c44-1099-4dd3-b95b-283bf13df0a1"
                }
                alt="Channel Avatar"
                className="channel-avatar mr-3"
              />
              <h2 className="mb-0">{auth.user.name || "Guest"}</h2>
            </div>
          </div>
          <div className="container mt-4">
            <ul className="list-unstyled">
              {auth.token ? (
                <>
                  <li>
                    <button className="btn  " onClick={logout}>
                      Logout
                    </button>
                  </li>

                  <li>
                    <button
                      className="btn  "
                      onClick={() => {
                        setShow(() => false);
                        navigate(`/user/${auth.user.id}`);
                      }}
                    >
                      Profile
                    </button>
                  </li>
                  {!auth.user.fromGoogle ? (
                    <li>
                      <button
                        className="btn  "
                        onClick={() => {
                          setShow(() => false);
                          navigate(`/user/edit`);
                        }}
                      >
                        Edit Profile
                      </button>
                    </li>
                  ) : (
                    ""
                  )}
                  <li>
                    <button className="btn " onClick={handleUploadModal}>
                      Create Video
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <button
                      className="btn  "
                      onClick={() => {
                        setShow(() => false);
                        navigate(`/login`);
                      }}
                    >
                      Login
                    </button>
                  </li>
                  <li>
                    <button
                      className="btn  "
                      onClick={() => {
                        setShow(() => false);
                        navigate(`/register`);
                      }}
                    >
                      Register
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
