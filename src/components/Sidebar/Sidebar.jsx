import React, { useEffect, useState } from "react";
import { useAuth } from "../../store/auth";
import { useMutation } from "@tanstack/react-query";
import "./style.css"; // Your CSS file
import { Link, useNavigate } from "react-router-dom";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, children }) => {
  const toggleSidebar = () => {
    setIsSidebarOpen((prevIsSidebarOpen) => !prevIsSidebarOpen);
  };
  const { auth } = useAuth();
  const [subscribedChannels, setSubscribedChannels] = useState([]);
  const navigate = useNavigate();
  //To get subscribers list
  const getUserMutation = useMutation({
    mutationFn: async () => {
      return (
        await fetch(
          `${import.meta.env.VITE_API_URL}/user/${auth.user?.id}`,

          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
      ).json();
    },
    onSuccess: (data, variables, context) => {
      // console.log("Inside User mutation: ", data, variables);
      if (data?.user?.subscribedUsers)
        setSubscribedChannels(() => data.user.subscribedUsers);
    },
    onError: (error, variables, context) => {
      console.log("error: ", error.message);
      //toast.error('Some Error has been occurred')
    },
  });

  useEffect(() => {
    if (auth.token) getUserMutation.mutate();
  }, [auth.token]);

  return (
    <>
      <div>
        {console.log(getUserMutation)}
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          style={{ display: !isSidebarOpen ? "block" : "none" }}
        >
          Sidebar
        </button>
      </div>
      <aside
        className={`App-sidebar ${isSidebarOpen ? "open" : ""}`}
        style={{ display: isSidebarOpen ? "block" : "none" }}
      >
        <div>
          <button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            style={{ display: isSidebarOpen ? "block" : "none" }}
          >
            Sidebar
          </button>
        </div>
        <h2>Filters</h2>
        <ul>
          <li>
            <a href="/?filter=trend">Trends</a>
          </li>
          {auth.token && (
            <li>
              <a href="/?filter=sub">Subscribed videos</a>
            </li>
          )}
        </ul>
        <hr />
        {auth.token ? (
          <>
            <h2>Subscriptions</h2>
            <div className="App-subscriptions-list">
              {/* Add scroller here */}
              {
                  getUserMutation.isPending ? "Loading..." : ""
                }
                {
                  getUserMutation.isError ? "Server Error." : ""
                }
                
              {
              getUserMutation.isSuccess?
              subscribedChannels.length > 0 ?
              subscribedChannels.map((e, index) => (
                <div
                  className="App-subscription"
                  key={e._id}
                  onClick={() => navigate(`/user/${e._id}`)}
                >
                  <img src={e.image} alt="Channel" />
                  <div className="App-subscription-info">
                    <h4>{e.name}</h4>
                    <p className="faint-text">Subscribers: {e.subscribers}</p>
                  </div>
                </div>
              ))
              : "No Subscriber."
              : null
              }
            </div>
          </>
        ) : (
          ""
        )}
        <hr />
        {auth.token && (
          <>
            <h2>You</h2>
            <ul>
              <li>
                <Link to="/user/history">History</Link>
              </li>

              <li>
                <Link to="/user/liked-videos">Liked Videos</Link>
              </li>
            </ul>
          </>
        )}
      </aside>
      {children}
    </>
  );
};

export default Sidebar;
