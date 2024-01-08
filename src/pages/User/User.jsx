import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Image,
  Button,
  Card as BootstrapCard,
} from "react-bootstrap";
import Card from "../../components/Card/Card";
import "./style.css";
import { useAuth } from "../../store/auth";
import { useHelmetHook } from "../../custom/useHelmetHook";

export default function User() {
  const helmetTitle = useHelmetHook("Channel");
  const { userId } = useParams();
  const { auth, subscription } = useAuth();
  const navigate = useNavigate();

  let {
    data: getUserData,
    isLoading: userIsLoading,
    isError: userIsError,
    refetch: getUserRefetch,
  } = useQuery({
    queryKey: ["userData"],
    queryFn: async () => {
      let resp = await fetch(`${import.meta.env.VITE_API_URL}/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return resp.json();
    },
  });

  let {
    data: getVideosData,
    isLoading: videosIsLoading,
    isError: videosIsError,
    refetch: getVideosRefetch,
  } = useQuery({
    queryKey: ["videoData"],
    queryFn: async () => {
      let resp = await fetch(
        `${import.meta.env.VITE_API_URL}/user/videos/${userId}`,
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

  const deleteVideoMutation = useMutation({
    mutationFn: async (variables) => {
      return (
        await fetch(
          `${import.meta.env.VITE_API_URL}/video/${variables.videoId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              authorization: auth.token,
            },
          }
        )
      ).json();
    },
    onSuccess: (data, variables, context) => {
      // console.log("Inside Delete video mutation: ", data, variables);
      alert(data.message);
      getVideosRefetch();
    },
    onError: (error, variables, context) => {
      console.log("error: ", error.message);
      //toast.error('Some Error has been occurred')
    },
  });

  const HandleSubscribe = () => {
    if (!auth.token) return alert("Please Login first to Subscribe");
    subscribeMutation.mutate(userId);
    subscription(userId);
  };

  const handleDelete = (videoId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this Video?"
    );

    if (confirmed) deleteVideoMutation.mutate({ videoId });
  };

  useEffect(() => {
    // console.log(getUserData)
  }, [getUserData]);

  // useEffect(() => {
  //   if (!auth.token) {
  //     // If the user is already authenticated, redirect to the home page
  //     navigate("/login");
  //     // You can also return a loading indicator or a message
  //   }
  // }, [auth.token]);

  return (
    <>
    {userIsLoading ? "Loading..." : ""}
    {userIsError ? "Server Error." : ""}
    
      {
      getUserData?.user ? (
        <Container>
          {/* User Profile Section */}
          <Row className="mt-4">
            <Col xs={12} sm={6} md={4} lg={3} className="text-center mb-4">
              <div className="round-image-container">
                <Image
                  src={getUserData.user.image}
                  alt={getUserData.user.name}
                  className="round-image"
                />
              </div>
              <h3>{getUserData.user.name}</h3>
              <p className="text-muted">
                Subscribers: {getUserData.user.subscribers}
              </p>
              {auth.user?.id !== userId ? (
                <Button
                  variant="primary"
                  className="mb-3"
                  onClick={HandleSubscribe}
                >
                  {auth.user?.subscribedUsers?.includes(userId)
                    ? "Subscribed"
                    : "Subscribe"}
                </Button>
              ) : null}
            </Col>
          </Row>

          <hr />
          {/* Video List Section */}
          <h2>Videos</h2>
          <div className="App-videos-gridy">
          {videosIsLoading ? "Loading..." : ""}
        {videosIsError ? "Server Error." : ""}

            {
              getVideosData?.videos ?
            getVideosData.videos?.length > 0
              ? getVideosData.videos?.map((video, index) => (
                  <BootstrapCard key={video._id+index} className="mb-3">
                    <Card data={video} />
                     {
                      auth?.user?.id ===  video?.userId?._id && 
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(video._id)}
                          className="mt-2 float-end"
                        >
                          Delete
                        </Button>
                    }
                  </BootstrapCard>
                ))
              : "No Video Uploaded by this Channel Yet!"
            : ""
            }
          </div>
        </Container>
      ) : (
        ""
      )}
    </>
  );
}
