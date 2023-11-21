import React, { useEffect, useState } from "react";
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

export default function EditUser() {
  const helmetTitle = useHelmetHook("User Edit");
  const { auth, setAuth } = useAuth();
  const [userData, setUserData] = useState({
    image:
      auth.user.image ||
      "https://firebasestorage.googleapis.com/v0/b/video-41ea3.appspot.com/o/1699998646936profile.png?alt=media&token=f28c2c44-1099-4dd3-b95b-283bf13df0a1",
    name: auth.user.name,
  });
  const [newPassword, setNewPassword] = useState({
    changePassword: false,
    prevPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [uploadPercent, setUploadPercent] = useState(0);
  const [imageFile, setImageFile] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // console.log("auth: ", auth);
  }, [auth.token]);

  const editUserMutation = useMutation({
    mutationFn: async (variables) => {
      return (
        await fetch(`${import.meta.env.VITE_API_URL}/user/${auth.user.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: auth.token, // Setting the Content-Type header to JSON
          },
          body: JSON.stringify(variables),
        })
      ).json();
    },
    onSuccess: (data, variables, context) => {
      // console.log("Inside editUserForm mutation: ", data, variables);
      if (data.success && data.updatedUser) {
        // console.log("inside success update")
        setAuth((prev) => {
          window.localStorage.setItem(
            "auth",
            JSON.stringify({ ...prev, user: data.updatedUser })
          );
          return { ...prev, user: data.updatedUser };
        });
      }
      alert(data.message);
    },
    onError: (error, variables, context) => {
      console.log("error: ", error.message);
      //toast.error('Some Error has been occurred')
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    let obj = {
      ...userData,
      name: userData.name.trim(),
    };

    if (newPassword.changePassword) {
      newPassword.password.trim() === newPassword.confirmPassword.trim()
        ? (obj = {
            ...obj,
            password: {
              prevPassword: newPassword.prevPassword,
              newPassword: newPassword.password,
            },
          })
        : alert("Type the Password correctly.");
    } else delete obj.password;

    userData.name && userData.image
      ? editUserMutation.mutate(obj)
      : alert("Complete the Form.");

    // console.log("userData: ", obj )
  };

  const UploadFileToFirebase = (file) => {
    const storage = getStorage();
    const storageRef = ref(storage, new Date().getTime() + file.name);
    const uploadTask = uploadBytesResumable(storageRef, file);
    setUserData((prev) => ({ ...prev, image: "" }));
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
          setUserData((prev) => ({ ...prev, image: downloadURL }));
        });
      }
    );
  };

  useEffect(() => {
    if (imageFile) UploadFileToFirebase(imageFile);
  }, [imageFile]);

  useEffect(() => {
    if (!auth.token) {
      // If the user is already authenticated, redirect to the home page
      navigate("/login");
      // You can also return a loading indicator or a message
    }
  }, [auth.token]);

  return (
    <>
      {!auth.user.fromGoogle ? 
      
      (
        <div className="login-container">
          <h1>Edit Profile</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Name"
                required
                value={userData.name}
                onChange={(e) =>
                  setUserData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="profileImage">New Profile Image</label>
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
                {imageFile && uploadPercent === 100 && (
                  <button
                    className="btn btn-sm btn-secondary btn-left"
                    onClick={(event) => {
                      event.preventDefault();
                      setUserData((prev) => ({
                        ...prev,
                        image: auth.user.image,
                      }));
                      setUploadPercent(0);
                      setImageFile("");
                    }}
                  >
                    Cancel Image
                  </button>
                )}
              </div>
            </div>

            {newPassword.changePassword ? (
              <>
                <div className="form-group">
                  <label htmlFor="password">Previous Password</label>
                  <input
                    type="password"
                    id="prev-password"
                    name="prev-password"
                    placeholder="Write previous password (Atleast 6 characters)"
                    required
                    value={newPassword.prevPassword}
                    onChange={(e) =>
                      setNewPassword((prev) => ({
                        ...prev,
                        prevPassword: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">New Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Write new password (Atleast 6 characters)"
                    required
                    value={newPassword.password}
                    onChange={(e) =>
                      setNewPassword((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Confirm Password</label>
                  <input
                    type="password"
                    id="confirm-password"
                    name="password"
                    placeholder="Write a Password (Atleast 6 characters)"
                    required
                    value={newPassword.confirmPassword}
                    onChange={(e) =>
                      setNewPassword((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                  />
                </div>
              </>
            ) : (
              ""
            )}

            <button
              className="btn btn-danger"
              onClick={(event) => {
                event.preventDefault();
                setNewPassword((prev) => ({
                  ...prev,
                  changePassword: !prev.changePassword,
                }));
              }}
            >
              {newPassword.changePassword
                ? "Not Change Password"
                : "Change Password"}
            </button>
            <hr />
            <button type="submit">Submit</button>
          </form>
        {editUserMutation.isError ? "Server Error." : ""}
        {editUserMutation.isPending ? "Loading..." : ""}
        </div>

      ) : (
        ""
      )}
    </>
  );
}
