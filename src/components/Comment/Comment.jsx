import React, { useState } from 'react';
import {formatDate} from "../../utils/formatingFuncs"
import "./style.css";
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../store/auth';
import { useNavigate } from 'react-router-dom';

const Comment = ({commentData, getCommentRefetch}) => {
  const [seeMore, setSeeMore] = useState(false);
  const {auth} = useAuth();
  const navigate = useNavigate();

  const deleteCommentMutation =  useMutation({
    mutationFn: async () => {
      
      return (
        await fetch(`${import.meta.env.VITE_API_URL}/comment/${commentData._id}`, {
          method: "DELETE",
          headers: {
            'Content-Type': 'application/json',
            "authorization": auth.token
           },
         })
      ).json();
    },
    onSuccess: (data, variables, context) => {
      // console.log("Inside Delete comment mutation: ", data, variables);
      // console.log(data.message) 
      getCommentRefetch()         
    },
    onError: (error, variables, context) => {
      console.log("error: ", error.message);
      //toast.error('Some Error has been occurred') 
    },
}); 

   const deleteComment = () => {
    console.log("delete comment id: ", commentData._id)
    const confirmed = window.confirm('Are you sure you want to delete this comment?');

    if(confirmed) deleteCommentMutation.mutate();
    
    // Logic to delete a comment based on its ID
  };

  return (
    <div className="comments-container">
         <div key={commentData.id} className="comment">
          <div onClick={()=>navigate( `/user/${commentData.userId._id}` )}><img src={commentData.userId.image} alt="User Avatar" className="user-avatar mr-3" /></div>
          <div className="comment-details">
            
            <h4>{commentData.userId.name}</h4>
            {commentData.text.length > 20 ? (
              <>
                {seeMore ? (
                  <p>{commentData.text} <span onClick={() => setSeeMore(prev => !prev)}>See less</span></p>
                ) : (
                  <p>{commentData.text.slice(0, 20)}... <span onClick={() => setSeeMore(prev => !prev)}>See More</span></p>
                )}
              </>
            ) : (
              <p>{commentData.text}</p>
            )}
            <p className="faint-font">{formatDate(commentData.createdAt)}</p>
            { auth?.user?.id === commentData.userId._id ?
                <button onClick={deleteComment}>Delete</button>
                : ""
            }
          </div>
        </div>
      
    </div>
  );
};

export default Comment;
