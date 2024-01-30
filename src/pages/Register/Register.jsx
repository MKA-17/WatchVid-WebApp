import React, { useEffect, useState } from "react";
import "./style.css";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../store/auth";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import "../../assets/profile.png";
import { useNavigate } from "react-router-dom";
import { useHelmetHook } from "../../custom/useHelmetHook";
import { app } from "../../utils/firebase";

export default function Register() {
  const helmetTitle = useHelmetHook("Register");
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    image:
      "https://firebasestorage.googleapis.com/v0/b/video-41ea3.appspot.com/o/1699998646936profile.png?alt=media&token=f28c2c44-1099-4dd3-b95b-283bf13df0a1",
    name: "",
  });
  const [uploadPercent, setUploadPercent] = useState(0);
  const [imageFile, setImageFile] = useState(0);
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();
  useEffect(() => {
    // console.log("auth: ", auth);
  }, [auth.token]);

  const registerMutation = useMutation({
    mutationFn: async (variables) => {
      return (
        await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Setting the Content-Type header to JSON
          },
          body: JSON.stringify(variables),
        })
      ).json();
    },
    onSuccess: (data, variables, context) => {
      // console.log("Inside RegisterForm mutation: ", data, variables);

      alert(data.message);
      if(data.success)
        navigate("/login")

    },
    onError: (error, variables, context) => {
      console.log("error: ", error.message);
      //toast.error('Some Error has been occurred')
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log("registerData: ", registerData,  (registerData.email.trim() && registerData.email.trim()&& registerData.image && registerData.password.trim().length>5 ));

    if (
      registerData.email.trim() &&
      registerData.email.trim() &&
      registerData.password.trim().length > 5 &&
      registerData.image
    ) {
      registerMutation.mutate(registerData);
    } else alert("Complete the Form.");
  };

  const UploadFileToFirebase = (file) => {
    const storage = getStorage(app);
    const storageRef = ref(storage, new Date().getTime() + file.name);
    const uploadTask = uploadBytesResumable(storageRef, file);
    setRegisterData((prev) => ({ ...prev, image: "" }));
    // Register three observers:
    // 1. 'state_changed' observer, called any time the state changes
    // 2. Error observer, called on failure
    // 3. Completion observer, called on successful completion
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        // console.log('Upload is ' + progress + '% done');
        setUploadPercent(Math.floor(progress));
        switch (snapshot.state) {
          case "paused":
            // setUploadPercent("Paused.")
            console.log("Upload is paused");
            break;
          case "running":
            // setUploadPercent("Running.")

            console.log("Upload is running");
            break;
        }
      },
      (error) => {
        alert(error);
        // Handle unsuccessful uploads
      },
      // Handle successful uploads on complete
      () => {
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          // console.log('File available at', downloadURL);
          setRegisterData((prev) => ({ ...prev, image: downloadURL }));
        });
      }
    );
  };

  useEffect(() => {
    if (imageFile) UploadFileToFirebase(imageFile);
  }, [imageFile]);

  useEffect(() => {
    if (auth.token) {
      // If the user is already authenticated, redirect to the home page
      navigate("/");
      // You can also return a loading indicator or a message
    }
  }, [auth.token]);

  return (
    <div className="login-container">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            required
            value={registerData.email}
            onChange={(e) =>
              setRegisterData((prev) => ({ ...prev, email: e.target.value }))
            }
          />
        </div>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Name"
            required
            value={registerData.name}
            onChange={(e) =>
              setRegisterData((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>
        <div className="form-group">
          <label htmlFor="profileImage">Profile Image</label>
          <div className="upload-btn-wrapper">
            <input
              type="file"
              id="profileImage"
              name="profileImage"
              accept="image/*"
              onChange={(e) => setImageFile((prev) => e.target.files[0])}
            />

            {!!uploadPercent && (
              <div className="file-name">
                Upload percentage: {uploadPercent}%{" "}
              </div>
            )}
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Write a Password (Atleast 6 characters)"
            required
            value={registerData.password}
            onChange={(e) =>
              setRegisterData((prev) => ({ ...prev, password: e.target.value }))
            }
          />
        </div>

        <button type="submit">Register</button>
      </form>
      {registerMutation.isError ? "Server Error." : ""}
      {registerMutation.isPending ? "Loading..." : ""}
    </div>
  );
}
