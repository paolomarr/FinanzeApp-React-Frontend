import React from "react";
import Navbar from 'react-bootstrap/Navbar';
import Dropdown from 'react-bootstrap/Dropdown';
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
        <Dropdown>
          <Dropdown.Toggle caret={false}>
            <FontAwesomeIcon icon={faBars} />
          </Dropdown.Toggle>
        </Dropdown>
        <Navbar.Brand>
          <img
          src="https://logrocket-assets.io/img/logo.png"
          alt="The website logo"
          width="300"
          className="img-thumbnail"
          // style={{ marginTop: "20px" }}
        />
        </Navbar.Brand>
        { loggedUser ?
          <Dropdown>
            <Dropdown.Toggle caret={false}>
              <FontAwesomeIcon icon={faUser} />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item header>{loggedUser}</Dropdown.Item>
              <Dropdown.Item onClick={()=>onLogout()}>Logout</Dropdown.Item>
              <Dropdown.Item disabled={true}><Trans>Profile</Trans></Dropdown.Item>
              <Dropdown.Item divider />
              <Dropdown.Item header><Trans>Languages</Trans></Dropdown.Item>
              { languages.map((loc)=> {return <Dropdown.Item className={loc.locale === i18n.locale ? "fw-bold" : ""} key={loc.locale} onClick={() => setLanguage(loc.locale)}>{loc.name}</Dropdown.Item>} )
                }
            </Dropdown.Menu>
          </Dropdown> : null }
      </div>
      <div className="text-center">
        <h1>{title}</h1>
      </div>
    </>
  );
}

export default Header;