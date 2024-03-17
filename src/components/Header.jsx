import React from "react";
import { NavbarBrand, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faBars } from "@fortawesome/free-solid-svg-icons";

function Header({title, onLogout}) {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center p-2">
        <UncontrolledDropdown>
          <DropdownToggle caret={false}>
            <FontAwesomeIcon icon={faBars} />
          </DropdownToggle>
        </UncontrolledDropdown>
        <NavbarBrand>
          <img
          src="https://logrocket-assets.io/img/logo.png"
          alt="The website logo"
          width="300"
          className="img-thumbnail"
          // style={{ marginTop: "20px" }}
        />
        </NavbarBrand>
        <UncontrolledDropdown>
          <DropdownToggle caret={false}>
            <FontAwesomeIcon icon={faUser} />
          </DropdownToggle>
          <DropdownMenu>
            {/* <DropdownItem header>Header</DropdownItem> */}
            <DropdownItem onClick={()=>onLogout()}>Logout</DropdownItem>
            <DropdownItem disabled={true}>Profile</DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
      <div className="text-center">
        <h1>{title}</h1>
      </div>
    </>
  );
}

export default Header;