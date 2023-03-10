import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import StyleTotal from "./cssLoginForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {} from "@fortawesome/free-solid-svg-icons";
import { faSnowflake } from "@fortawesome/free-regular-svg-icons";
import { REGIS_USER_SAGA } from "../../../redux/actionSaga/UserAction";

const LoginForm = () => {
  const dispatch = useDispatch();

  const handleSubmit = (e: any) => {
    e.preventDefault();
    dispatch(
      REGIS_USER_SAGA({
        userRegister: {
          name: "LoganZ",
          email: "ln26805@gmail.com",
          password: "alooo",
          userImage:
            "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50",
          userRole: 1,
        },
      })
    );
  };

  return (
    <StyleTotal>
      <div className="loginForm">
        <div className="welcomeBack mb-12">
          <div className="icon_logo">
            <FontAwesomeIcon className="icon" icon={faSnowflake} />
          </div>
          <h2 className="title">Welcome back!</h2>
        </div>

        {/* Form Input */}
        <form className="container-fluid form" onSubmit={handleSubmit}>
          <div className="form-group w-full">
            <input
              className="form-control w-full h-9 mb-5 p-5"
              name="email"
              type="text"
              placeholder="Email"
            />
            <input
              className="form-control w-full h-9 mb-5 p-5"
              name="password"
              type="password"
              placeholder="Password"
            />
            <button
              type="submit"
              className="btn btn-primary w-full h-9 mb-4 mt-3 font-bold"
            >
              Login
            </button>
          </div>
          <div className="forgotPass">Forgotten Password ?</div>
        </form>

        <div className="anotherLogin mt-10">
          <div className="title relative">
            <span className="absolute" style={{ color: "#d4d4d4" }}>
              or login with
            </span>
            <hr />
          </div>
          <div className="loginTool mt-10 w-full">
            <div className="google h-10">
              <span className="icon mr-2">
                <img src="./images/google.svg" alt="google" />
              </span>
              <span>Continue with Gmail</span>
            </div>
            <div className="github mt-4 h-10">
              <span className="icon mr-2">
                <img src="./images/github.svg" alt="github" />
              </span>
              <span>Continue with Github</span>
            </div>
          </div>
        </div>

        <div className="noAccount text-center mt-8">
          <span>Don't you have an account yet? </span>
          <span className="signUp ml-1">Sign up</span>
        </div>
      </div>
    </StyleTotal>
  );
};

export default LoginForm;
