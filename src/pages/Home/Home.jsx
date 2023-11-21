import React, { useEffect, useState } from "react";
import "./style.css";
import Card from "../../components/Card/Card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "../../store/auth";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useHelmetHook } from "../../custom/useHelmetHook";

const App = () => {
  const helmetTitle = useHelmetHook("Home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { auth } = useAuth();
  const [videoHeader, seVideoHeader] = useState("Videos");
  const navigate = useNavigate();

  const getVideoQueryApiUrl = () => {
    const query =
    window.location.search.split("=").length > 1
        ? window.location.search.split("=")
        : false;
      //console.log("query: ", window.location)
    if (!query) return `${import.meta.env.VITE_API_URL}/video/?random`;
    if (query[0] === "?filter" && query[1] === "sub") {
      seVideoHeader(() => "Subscribed Channels' Videos");
      return `${import.meta.env.VITE_API_URL}/video/subscribed`;
    }
    if (query[0] === "?tags") {
      seVideoHeader(() => `Videos with tags: ${query[1]}`);
      return `${import.meta.env.VITE_API_URL}/video/?tags=${query[1]}`;
    }
    if (query[0] === "?filter") {
      if (query[1] === "trend") seVideoHeader(() => "Trending Videos");
      return `${import.meta.env.VITE_API_URL}/video/?${query[1]}`;
    }
    if (query[0] === "?q") {
      seVideoHeader(() => `Videos for search "${query[1]}"`);
      return `${import.meta.env.VITE_API_URL}/video/?search=${query[1]}`;
    }
  };

  let {
    data: getVideosData,
    isLoading: videosIsLoading,
    isError: videosIsError,
    refetch: getVideosRefetch,
  } = useQuery({
    queryKey: ["videosData"],
    queryFn: async () => {
      let resp = await fetch(getVideoQueryApiUrl(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: auth.token,
        },
      });

      return resp.json();
    },
  });

  useEffect(() => {
    console.log(
      "Videos data: ",
      getVideosData,
       `${getVideoQueryApiUrl()}`
    );
  }, [getVideosData]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prevIsSidebarOpen) => !prevIsSidebarOpen);
  };

  return (
    <>
      <div className="App">
        <main className="App-main">
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          >
            <section className="App-videos">
              <h2>{videoHeader}</h2>

              {/* <div className="App-videos-filters">
            <select>
              <option value="all">All</option>
              <option value="music">Music</option>
              <option value="gaming">Gaming</option>
              <option value="comedy">Comedy</option>
            </select>

            <select>
              <option value="all">Sort by</option>
              <option value="upload_date">Upload Date</option>
              <option value="view_count">View Count</option>
            </select>
          </div> */}

              <div className="App-videos-gridy">
                {
                  videosIsLoading ? "Loading..." : ""
                }
                {
                  videosIsError ? "Server Error." : ""
                }

                {getVideosData?.videos
                  ? getVideosData.videos?.length > 0
                    ? getVideosData.videos?.map((e) => (
                        <Card key={e._id} data={e} />
                     ))
                     :
                     "No video found."
                    
                  : ""}
              </div>
            </section>
          </Sidebar>
        </main>
      </div>
    </>
  );
};

export default App;
