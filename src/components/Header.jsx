import React from "react";
import { NavbarBrand, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faBars } from "@fortawesome/free-solid-svg-icons";
import { Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { languages } from "../constants";
import { useContext } from "react";
import UserContext from "../contexts/UserContext";

function Header({title, onLogout}) {
  const { i18n } = useLingui();
  const setLanguage = (locale) => {
    localStorage.setItem("user_locale", locale);
    i18n.activate(locale);
  };
  const loggedUser = useContext(UserContext);
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
        { loggedUser ?
          <UncontrolledDropdown>
            <DropdownToggle caret={false}>
              <FontAwesomeIcon icon={faUser} />
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem header>{loggedUser}</DropdownItem>
              <DropdownItem onClick={()=>onLogout()}>Logout</DropdownItem>
              <DropdownItem disabled={true}><Trans>Profile</Trans></DropdownItem>
              <DropdownItem divider />
              <DropdownItem header><Trans>Languages</Trans></DropdownItem>
              { languages.map((loc)=> {return <DropdownItem className={loc.locale === i18n.locale ? "fw-bold" : ""} key={loc.locale} onClick={() => setLanguage(loc.locale)}>{loc.name}</DropdownItem>} )
                }
            </DropdownMenu>
          </UncontrolledDropdown> : null }
      </div>
      <div className="text-center">
        <h1>{title}</h1>
      </div>
    </>
  );
}

export default Header;