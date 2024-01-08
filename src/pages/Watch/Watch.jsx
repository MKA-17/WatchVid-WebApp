import React, { useEffect, useState } from "react";
import "./style.css"; // Make sure to adjust the path based on your file structure
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { formatViews, formatDate } from "../../utils/formatingFuncs";
import Comment from "../../components/Comment/Comment";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { useHelmetHook } from "../../custom/useHelmetHook";

const Watch = () => {
  const helmetTitle = useHelmetHook("Watch");
  const location = useLocation();
  const { auth, subscription } = useAuth();
  const { videoId } = useParams();
  const [videoURL, setVideoURL] = useState("");
  const [seeMore, setSeeMore] = useState(false);
  const navigate = useNavigate();

  const viewVideoMutation = useMutation({
    mutationFn: async () => {
      return (
        await fetch(
          `${import.meta.env.VITE_API_URL}/video/add-view/${videoId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
      ).json();
    },
    onSuccess: (data, variables, context) => {
      // console.log("Inside viewVideo mutation: ", data, variables);
      // console.log(data.message)
    },
    onError: (error, variables, context) => {
      console.log("error: ", error.message);
      //toast.error('Some Error has been occurred')
    },
  });

  const historyVideoMutation = useMutation({
    mutationFn: async () => {
      return (
        await fetch(
          `${import.meta.env.VITE_API_URL}/user/add-history/${videoId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              authorization: auth.token,
            },
          }
        )
      ).json();
    },
    onSuccess: (data, variables, context) => {
      // console.log("Inside historyVideo mutation: ", data, variables);
      // console.log(data.message)
    },
    onError: (error, variables, context) => {
      console.log("error: ", error.message);
      //toast.error('Some Error has been occurred')
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: async (variables) => {
      return (
        await fetch(
          `${import.meta.env.VITE_API_URL}/user/subscribe/${variables}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              authorization: auth.token,
            },
          }
        )
      ).json();
    },
    onSuccess: (data, variables, context) => {
      // console.log("Inside Subscribe mutation: ", data, variables);
      alert(data.message);
    },
    onError: (error, variables, context) => {
      console.log("error: ", error.message);
      //toast.error('Some Error has been occurred')
    },
  });

  const reactVideoMutation = useMutation({
    mutationFn: async (variables) => {
      return (
        await fetch(
          variables.reactionType === "Like"
            ? `${import.meta.env.VITE_API_URL}/user/like/${variables.videoId}`
            : `${import.meta.env.VITE_API_URL}/user/dislike/${
                variables.videoId
              }`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              authorization: auth.token,
            },
          }
        )
      ).json();
    },
    onSuccess: (data, variables, context) => {
      // console.log("Inside Like/Dislike mutation: ", data, variables);
      if (data.success) getVideoRefetch();
    },
    onError: (error, variables, context) => {
      console.log("error: ", error.message);
      //toast.error('Some Error has been occurred')
    },
  });

  const postCommentMutation = useMutation({
    mutationFn: async (variables) => {
      return (
        await fetch(`${import.meta.env.VITE_API_URL}/comment/${videoId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: auth.token, // Setting the Content-Type header to JSON
          },
          body: JSON.stringify(variables),
        })
      ).json();
    },
    onSuccess: (data, variables, context) => {
      // console.log("Inside Comment mutation: ", data, variables);

      if (!data.success) alert(data.message);
      else getCommentRefetch();
    },
    onError: (error, variables, context) => {
      console.log("error: ", error.message);
      //toast.error('Some Error has been occurred')
    },
  });

  let {
    data: getVideoData,
    isLoading: videoIsLoading,
    isError: videoIsError,
    refetch: getVideoRefetch,
  } = useQuery({
    queryKey: ["videoData"],
    queryFn: async () => {
      let resp = await fetch(
        `${import.meta.env.VITE_API_URL}/video/find/${videoId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return resp.json();
    },
  });

  let {
    data: getCommentData,
    isLoading: commentIsLoading,
    isError: commentIsError,
    refetch: getCommentRefetch,
  } = useQuery({
    queryKey: ["commentData"],
    queryFn: async () => {
      let resp = await fetch(
        `${import.meta.env.VITE_API_URL}/comment/${videoId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return resp.json();
    },
  });

  const HandleSubscribe = (userId) => {
    if (!auth.token) return alert("Please Login first to Subscribe");
    subscribeMutation.mutate(userId);
    subscription(userId);
  };

  const HandleReaction = (videoId, reactionType) => {
    if (!auth.token) return alert("Please Login first to React");
    reactVideoMutation.mutate({ videoId, reactionType });
  };

  const HandleComment = (e, commentTxt) => {
    if (e.key === "Enter" && commentTxt.trim()){
    if (!auth.token) return alert("Please Login first to Comment");
      postCommentMutation.mutate({ text: commentTxt });
    }
  };

  const HandleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: getVideoData?.video?.title,
          text: getVideoData?.video?.title,
          url: window.location.href, // URL of the content to be shared
        });
      } else {
        throw new Error("Web Share API is not supported in this browser.");
      }
    } catch (error) {
      console.error("Share failed:", error);
      // Handle the error, fallback, or display a custom sharing component
    }
  };

  useEffect(() => {
    if (getVideoData) setVideoURL(() => getVideoData?.video?.videoURL);
    // console.log("location: ", location, "ID: ", videoId, getVideoData, isError, getVideoData&& formatDate(getVideoData?.video?.createdAt, ))
    // console.log("comments: ",  getCommentData)
  }, [videoIsLoading, getVideoData, videoURL, getCommentData]);

  useEffect(() => {
    if (getVideoData?.video)
      setTimeout(() => {
        viewVideoMutation.mutate();
        if (auth.token) historyVideoMutation.mutate();
      }, 1000);
  }, [getVideoData?.video]);

  return (
    <>
      {videoIsLoading ? "Loading..." : ""}
      {videoIsError ? "Server Error." : ""}

      {getVideoData?.video ? (
        <div className="container">
          <div className="video-container border mb-4">
            <div className="video-frame">
              <video controls className="video-player">
                <source src={getVideoData.video?.videoURL} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div>
              <div className="video-title mb-2">
                <h2>{getVideoData.video.title}</h2>
                <span className="faint">
                  Date: {formatDate(getVideoData.video?.createdAt)}
                </span>
              </div>
              <div className="stats mb-3">
                <span className="faint">Views: {getVideoData.video.views}</span>
              </div>
            </div>
          </div>

          <div className="video-details border p-3">
            <div className="channel-info border-bottom p-3 d-flex flex-column flex-sm-row align-items-center justify-content-between">
              <div
                className="d-flex align-items-center mb-3 mb-sm-0"
                onClick={() =>
                  navigate(`/user/${getVideoData.video.userId._id}`)
                }
              >
                <img
                  src={getVideoData.video.userId.image}
                  alt="Channel Avatar"
                  className="channel-avatar mr-3"
                />
                <h2 className="mb-0">{getVideoData.video.userId.name}</h2>
              </div>
              {
                // console.log("subscribers: ", auth.user?.subscribedUsers)
              }

              {getVideoData.video.userId._id !== auth?.user?.id && (
                <button
                  className="btn btn-danger subscribe-button mt-3 mt-sm-0"
                  onClick={() => HandleSubscribe(getVideoData.video.userId._id)}
                >
                  {auth.user?.subscribedUsers?.includes(
                    getVideoData.video.userId._id
                  )
                    ? "Subscribed"
                    : "Subscribe"}
                </button>
              )}
            </div>

            <div className="interactions">
              <div className="reaction-buttons d-flex flex-column flex-sm-row">
                {
                  <button
                    className="btn btn-secondary mb-2 mb-sm-0 mr-sm-3"
                    onClick={() =>
                      HandleReaction(getVideoData.video?._id, "Like")
                    }
                  >
                    <span className="reaction-text">
                      {getVideoData.video?.likes?.includes(auth?.user?.id)
                        ? "Liked"
                        : "Like"}
                    </span>
                    <span className="count">
                      {getVideoData.video?.likes.length}
                    </span>
                  </button>
                }
                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    HandleReaction(getVideoData.video?._id, "Dislike")
                  }
                >
                  <span className="reaction-text">
                    {getVideoData.video?.dislikes?.includes(auth?.user?.id)
                      ? "Disliked"
                      : "Dislike"}
                  </span>
                  <span className="count">
                    {getVideoData.video?.dislikes.length}
                  </span>
                </button>
                <br />
                <button className="btn btn-secondary">
                  <span className="reaction-text" onClick={HandleShare}>
                    Share
                  </span>
                </button>
              </div>
            </div>

            <div className="video-description border-bottom p-3">
              <div className="tags-container">
                {getVideoData.video?.tags.map((e, i) => (
                  <Link to={`/?tags=${e}`} className="tags-link" key={i}>
                    {e}
                  </Link>
                ))}
              </div>
              <br />
              <h3>Description</h3>
              {getVideoData.video?.desc.length > 20 ? (
                seeMore ? (
                  <>
                    <p>
                      {getVideoData.video?.desc}
                      <span onClick={() => setSeeMore((prev) => !prev)}>
                        {" "}
                        See less
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      {getVideoData.video?.desc?.slice(0, 20)}...
                      <span onClick={() => setSeeMore((prev) => !prev)}>
                        See More
                      </span>
                    </p>
                  </>
                )
              ) : (
                getVideoData.video?.desc
              )}
            </div>
            <div className="comments border p-3">
              <div className="new-comment mt-3">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="form-control mr-2"
                  onKeyDown={(event) =>
                    HandleComment(event, event.target.value)
                  }
                />
              </div>
              <hr />
              <h3>Comments</h3>
              {commentIsLoading ? "Loading..." : ""}
              {commentIsError ? "Server Error." : ""}
              {getCommentData?.comments
                ? getCommentData.comments?.length > 0
                  ? getCommentData.comments?.map((e, i) => (
                      <Comment
                        key={i}
                        getCommentRefetch={getCommentRefetch}
                        commentData={e}
                      />
                    ))
                  : "No Comments."
                : ""}
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default Watch;
