import React, { useState } from "react";
import { Link } from "react-router-dom";
import ReactModal from "react-modal";
import { useWindowDimensions } from "../../hooks/useWindowDimensions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import SideBarMenus from "./sidebar/SideBarMenus";
import "./Nav.css";

const Nav = () => {
  const [showMenu, setShowMenu] = useState(false);
  const { width } = useWindowDimensions();

  const getMobileMenu = () => {
    if (width <= 768) {
      return (
        <FontAwesomeIcon
          onClick={onClickToggle}
          icon={faBars}
          size="lg"
          className="nav-mobile-menu"
        />
      );
    }
    return null;
  };

  const onClickToggle = (e: React.MouseEvent<Element, MouseEvent>) => {
    setShowMenu(!showMenu);
  };
  const onRequestClose = (
    e: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>
  ) => {
    setShowMenu(false);
  };

  return (
    <React.Fragment>
      <div
        style={{
          width: "100%",
          color: "white",
          display: "flex",
          alignItems: "center",
          alignContent: "spaceEvenly",
          backgroundColor: "DarkSlateBlue",
        }}
      >
        <ReactModal
          className="modal-menu"
          isOpen={showMenu}
          onRequestClose={onRequestClose}
          shouldCloseOnOverlayClick={true}
        >
          <SideBarMenus />
        </ReactModal>
        <nav>
          {getMobileMenu()}
          <strong>DMValed Forum</strong>
        </nav>
        <div style={{ marginLeft: "auto", marginRight: "1em" }}>
          <Link
            to={"/latest"}
            style={{ color: "white", textDecoration: "none" }}
          >
            <strong>main</strong>
          </Link>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Nav;
