import React, { FC } from "react";
import ReactModal from "react-modal";
import { ModalProps } from "../types/ModalProps";
import { gql, useMutation } from "@apollo/client";
import { useSelector } from "react-redux";
import { AppState } from "../../store/configureStore";
import useRefreshReduxMe, { Me } from "../../hooks/useRefreshReduxMe";
import "./Logout.css";

const LogoutMutation = gql`
  mutation Logout {
    logout
  }
`;

const Logout: FC<ModalProps> = ({ isOpen, onClickToggle }) => {
  const user = useSelector((store: AppState) => store.user);
  const [execLogout] = useMutation(LogoutMutation, {
    refetchQueries: [
      {
        query: Me,
      },
    ],
  });
  const { deleteMe } = useRefreshReduxMe();

  const onClickLogout = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    onClickToggle(e);
    await execLogout();
    deleteMe();
    console.log(`User with username ${user?.userName} successfully logged out`);
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
        <div className="logout-inputs">Are you sure you want to logout?</div>
        <div className="form-buttons form-buttons-sm">
          <div className="form-btn-left">
            <button
              style={{ marginLeft: ".5em" }}
              className="action-btn"
              onClick={onClickLogout}
            >
              Logout
            </button>
            <button
              style={{ marginLeft: ".5em" }}
              className="cancel-btn"
              onClick={onClickCancel}
            >
              Close
            </button>
          </div>
        </div>
      </form>
    </ReactModal>
  );
};

export default Logout;
