import React from 'react';
import {formatDate}from "../../utils/formatingFuncs" 
import './Card.css';
import { useNavigate } from 'react-router-dom';
 

const Card = ({data}) => {
  const navigate = useNavigate();
  // console.log(data)
 
  return (
    <div className="App-video">
      <img src={data?.imgURL} alt="Video" onClick={()=>navigate(`/watch/${data._id}`)}/>

      <div className="App-video-info">
        <div className="channel-details" onClick={()=>navigate(`/user/${data?.userId._id}`)}>
          <img className="channel-avatar" src={data?.userId?.image} alt="Channel Avatar" />
          <div>
            <h3>{data.title}</h3>
            <p>{data?.userId?.name}</p>
          </div>
        </div>
        <p>{data?.views} • {formatDate(data?.createdAt)}</p>
      </div>
    </div>
  );
};

export default Card;
