import styled, { css } from "styled-components";

const flex_center_column = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const flex_center_row = css`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const StyleTotal = styled.div`
  width: 32rem;
  height: 40rem;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /* border: 1px solid white; */

  .loginForm {
    width: 100%;
    height: 100%;
    background-color: #171718;
    ${flex_center_column};
    .welcomeBack {
      ${flex_center_column};
      .icon_logo {
        color: white;
        font-size: 2rem;
        width: 70px;
        height: 70px;
        margin-bottom: 1rem;
        border: double 4px transparent;
        border-radius: 50%;
        background-image: linear-gradient(#171718, #171718),
          radial-gradient(circle at right top, #2979ff, #07a787);
        background-origin: border-box;
        background-clip: padding-box, border-box;
        position: relative;
        ${flex_center_row};
      }
      .title {
        color: white;
        font-size: 1.5rem;
        font-weight: 500;
      }
    }
    .form {
      width: 70%;
      ${flex_center_column};
      .form-group {
        ${flex_center_column};
        .form-control {
          border: none;
          color: #d4d4d4;
          font-size: 1rem;
          background-color: #202021;
          ::placeholder {
            font-size: 0.95rem;
          }
          &:focus-visible {
            outline: none;
          }
        }
        .btn {
          background-image: linear-gradient(to right, #1f67e3, #00ae8c);
          color: #cfcaca;
          &:hover {
            background-image: linear-gradient(to right, #256adf, #0abe9a);
            transition: all 0.5s;
          }
        }
      }
      .forgotPass {
        color: #d4d4d4;
        font-size: 0.8rem;
        &:hover {
          color: white;
          transition: all 0.5s;
          cursor: pointer;
        }
      }
    }
    .anotherLogin {
        width: 70%;
      .title {
        span {
          top: -0.9rem;
          left: 35%;
          background-color: #171718;
          padding: 0 0.5rem;
          font-size: 0.9rem;
        }
      }
      .loginTool {
        .google {
          ${flex_center_row};
          background-color: #202021;
          color: #d4d4d4;
          font-size: 0.9rem;
          &:hover {
            background-color: #1f67e3;
            transition: all 0.5s;
            cursor: pointer;
          }
          .icon {
            width: 1.5rem;
            height: 1.5rem;
          }
        }
        .github {
          ${flex_center_row};
          background-color: #202021;
          color: #d4d4d4;
          font-size: 0.9rem;
          &:hover {
            background-color: #1f67e3;
            transition: all 0.5s;
            cursor: pointer;
          }
          .icon {
            width: 1.5rem;
            height: 1.5rem;
          }
        }
      }
    }
    .noAccount{
        width: 70%;
        color: #d4d4d4;
        font-size: 0.9rem;
        .signUp{
            color: #1f67e3;
            &:hover{
                color: #256adf;
                transition: all 0.5s;
                cursor: pointer;
            }
        }
    }
  }
`;

export default StyleTotal;
