import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Row, Col, Image, Button, Card as BootstrapCard } from 'react-bootstrap';
import Card from "../../components/Card/Card"
import "./style.css";
import { useAuth } from '../../store/auth';
import { useHelmetHook } from '../../custom/useHelmetHook';

export default function HistoryVideos() {
    const helmetTitle = useHelmetHook("History")
    const {auth, subscription} = useAuth();
    const navigate = useNavigate();

    let {
        data: getVideosData,
        isLoading: videosIsLoading,
        isError: videosIsError,
        refetch: getVideosRefetch,
      } = useQuery({
        queryKey: ["videoData"],
        queryFn: async () => {
          let resp = await fetch(
            `${import.meta.env.VITE_API_URL}/user/get-history`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "authorization": auth.token
              },
            }
          );
    
          return resp.json();
        },
      });

 
 
  useEffect(()=>{
    // console.log(getVideosData)
  }, [getVideosData])

  useEffect(()=>{
    if (!auth.token) {
      // If the user is already authenticated, redirect to the home page
      navigate('/login');
      // You can also return a loading indicator or a message
    }
  }, [auth.token])

  return (
    <Container>
      {/* Video List Section */}
      <h2>History</h2>
      <div className="App-videos-gridy">
        {videosIsLoading ? "Loading..." : ""}
        {videosIsError ? "Server Error." : ""}

        {getVideosData?.videos
          ? getVideosData?.videos?.length
            ? getVideosData.videos?.map((video, index) => (
                <Card data={video} key={video._id + index} />
              ))
            : "No Video!"
          : ""}
      </div>
    </Container>
  );
}
