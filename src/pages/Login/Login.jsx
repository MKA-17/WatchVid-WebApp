import React, { useEffect, useState } from "react";
import "./style.css";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../store/auth";
import { googleAuth, googleProvider } from "../../utils/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { useHelmetHook } from "../../custom/useHelmetHook";

export default function Login() {
  const helmetTitle = useHelmetHook("Login");
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();
  // console.log("auth: ", auth)

  const loginMutation = useMutation({
    mutationFn: async (variables) => {
      return (
        await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Setting the Content-Type header to JSON
          },
          body: JSON.stringify(variables),
        })
      ).json();
    },
    onSuccess: (data, variables, context) => {
      // console.log("Inside LoginForm mutation: ", data, variables);

      if (data.isPassword) {
        setAuth((prev) => {
          window.localStorage.setItem(
            "auth",
            JSON.stringify({ token: data.token, user: data.user })
          );
          // console.log("login")
          return { ...prev, token: data.token, user: data.user };
        });

        //navigate("/")
      } else alert(data.message);
    },
    onError: (error, variables, context) => {
      console.log("error: ", error.message);
      //toast.error('Some Error has been occurred')
    },
  });
  const googleLoginMutation = useMutation({
    mutationFn: async (variables) => {
      return (
        await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Setting the Content-Type header to JSON
          },
          body: JSON.stringify(variables),
        })
      ).json();
    },
    onSuccess: (data, variables, context) => {
      // console.log("Inside google LoginForm mutation: ", data, variables);

      if (data.isPassword) {
        setAuth((prev) => {
          window.localStorage.setItem(
            "auth",
            JSON.stringify({ token: data.token, user: data.user })
          );
          // console.log("login")
          return { ...prev, token: data.token, user: data.user };
        });

        //navigate("/")
      } else alert(data.message);
    },
    onError: (error, variables, context) => {
      console.log("error: ", error.message);
      //toast.error('Some Error has been occurred')
    },
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (loginData.email.trim() && loginData.password.trim())
      loginMutation.mutate(loginData);
  };

  const handleGoogleAuth = (e) => {
    signInWithPopup(googleAuth, googleProvider)
      .then((result) => {
        const { user } = result;
        googleLoginMutation.mutate({
          name: user.displayName,
          image: user.photoURL,
          email: user.email,
        });
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // console.log("googleAuth: ",  user, credential, token);
        // // The signed-in user info.
        // const user = result.user;
        // // IdP data available using getAdditionalUserInfo(result)
        // ...
      })
      .catch((error) => {
        alert(error);
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  };

  useEffect(() => {
    if (auth.token) {
      // If the user is already authenticated, redirect to the home page
      navigate("/");
      // You can also return a loading indicator or a message
    }
  }, [auth.token]);

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            required
            value={loginData.email}
            onChange={(e) =>
              setLoginData((prev) => ({ ...prev, email: e.target.value }))
            }
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            required
            value={loginData.password}
            onChange={(e) =>
              setLoginData((prev) => ({ ...prev, password: e.target.value }))
            }
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <div className="or-separator">
        <span>OR</span>
      </div>
      <button className="google-login-button" onClick={handleGoogleAuth}>
        Login with Google
      </button>

      <hr />
      <Link to="/register">Click here to Register.</Link>
      <br />
      {loginMutation.isError ? "Server Error." : ""}
      {loginMutation.isPending ? "Loading..." : ""}
      {googleLoginMutation.isError ? "Server Error." : ""}
      {googleLoginMutation.isPending ? "Loading..." : ""}
    </div>
  );
}
