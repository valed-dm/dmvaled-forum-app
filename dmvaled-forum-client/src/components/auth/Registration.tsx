import React, { FC, useReducer } from "react";
import ReactModal from "react-modal";
import { ModalProps } from "../types/ModalProps";
import userReducer from "../auth/common/UserReducer";
import { allowSubmit } from "../auth/common/Helpers";
import PasswordComparison from "./common/PasswordComparison";
import { gql, useMutation } from "@apollo/client";

const RegisterMutation = gql`
  mutation Register($email: String!, $userName: String!, $password: String!) {
    register(email: $email, userName: $userName, password: $password)
  }
`;

const Registration: FC<ModalProps> = ({ isOpen, onClickToggle }) => {
  const [execRegister] = useMutation(RegisterMutation);

  const [
    { userName, password, email, passwordConfirm, resultMsg, isSubmitDisabled },
    dispatch,
  ] = useReducer(userReducer, {
    userName: "dmvaled",
    password: "",
    email: "dmvaled@gmail.com",
    passwordConfirm: "",
    resultMsg: "",
    isSubmitDisabled: true,
  });

  const onChangeUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "userName", payload: e.target.value });
    if (!e.target.value)
      allowSubmit(dispatch, "Username cannot be empty", true);
    else allowSubmit(dispatch, "", false);
  };
  const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "email", payload: e.target.value });
    if (!e.target.value) allowSubmit(dispatch, "Email cannot be empty", true);
    else allowSubmit(dispatch, "", false);
  };

  const onClickRegister = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    try {
      const result = await execRegister({
        variables: { email, userName, password },
      });
      console.log("register result: ", result.data.register);
      dispatch({ type: "resultMsg", payload: result.data.register });
    } catch (ex) {
      console.log(ex);
    }
  };

  const onClickCancel = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    onClickToggle(e);
  };

  return (
    <ReactModal
      className="modal-menu"
      isOpen={isOpen}
      onRequestClose={onClickToggle}
      shouldCloseOnOverlayClick={true}
    >
      <form>
        <div className="reg-inputs">
          <div>
            <label>username</label>
            <input type="text" value={userName} onChange={onChangeUserName} />
          </div>
          <div>
            <label>email</label>
            <input type="text" value={email} onChange={onChangeEmail} />
          </div>
          <div>
            <PasswordComparison
              dispatch={dispatch}
              password={password}
              passwordConfirm={passwordConfirm}
            />
          </div>
        </div>
        <div className="reg-buttons">
          <div className="reg-btn-left">
            <button
              style={{ marginLeft: ".5em" }}
              className="action-btn"
              disabled={isSubmitDisabled}
              onClick={onClickRegister}
            >
              Register
            </button>
            <button
              style={{ marginLeft: ".5em" }}
              className="cancel-btn"
              onClick={onClickCancel}
            >
              Close
            </button>
          </div>
          <span className="reg-btn-right">
            <strong>{resultMsg}</strong>
          </span>
        </div>
      </form>
    </ReactModal>
  );
};

export default Registration;
