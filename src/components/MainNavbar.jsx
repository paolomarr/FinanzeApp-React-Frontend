import { useMediaQuery } from "react-responsive";
import Offcanvas from 'react-bootstrap/Offcanvas';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faLanguage, faRightFromBracket, faSliders } from "@fortawesome/free-solid-svg-icons";
import Nav from 'react-bootstrap/Nav';
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { useState } from "react";
import { Trans } from "@lingui/macro";
import Dropdown from 'react-bootstrap/Dropdown'
import { languages } from "../constants";
import { useLingui } from "@lingui/react";
import { NavLink } from "react-router-dom";

const RightButtonGroup = () => {
    const { i18n } = useLingui();
    const setLanguage = (locale) => {
        localStorage.setItem("user_locale", locale);
        i18n.activate(locale);
    };
    return <ButtonGroup>
        <Button variant="transparent" href="/settings">
            <FontAwesomeIcon icon={faSliders} className="text-secondary" size="lg" />
        </Button>
        <Dropdown as={ButtonGroup}>
            <Dropdown.Toggle variant="transparent">
                <FontAwesomeIcon icon={faLanguage} className="text-secondary" size="lg"/>
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Header><Trans>Languages</Trans></Dropdown.Header>
                { languages.map((loc)=> {return <Dropdown.Item className={loc.locale === i18n.locale ? "fw-bold" : ""} key={loc.locale} onClick={() => setLanguage(loc.locale)}>{loc.name}</Dropdown.Item>} )
                    }
            </Dropdown.Menu>
        </Dropdown>
        <Button variant="transparent" href="/logout">
            <FontAwesomeIcon icon={faRightFromBracket} className="text-secondary" size="lg"/>
        </Button>
    </ButtonGroup>
};
const OffcanvasNavbar = () => {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return <div className="my-2 mx-2 d-flex align-items-center">
        <div className="me-auto">
            <Button variant="transparent" onClick={handleShow}>
                <FontAwesomeIcon icon={faBars} className="text-secondary" size="lg"/>
            </Button>
            <Offcanvas show={show} onHide={handleClose}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title><div className="invisible">Title</div></Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Nav className="flex-column" variant="underline">
                        <Nav.Item>
                            <NavLink to="/" end
                            className={({isActive}) => "nav-link" + (isActive ? " active" : "")}
                            onClick={() => setShow(false)}>
                                <Trans>Movements</Trans>
                            </NavLink>
                        </Nav.Item>
                        <Nav.Item>
                            <NavLink to="/assets" end
                            className={({isActive}) => "nav-link" + (isActive ? " active" : "")}
                            onClick={() => setShow(false)}>
                                <Trans>Balance records</Trans>
                            </NavLink>
                        </Nav.Item>
                    </Nav>
                </Offcanvas.Body>
            </Offcanvas>
        </div>
        <RightButtonGroup />
    </div>
};
const StandardNavbar = () => {
    return <div className="m-2 d-flex align-items-center">
        <div className="me-auto">
            <Nav variant="underline">
                <Nav.Item>
                    <NavLink to="/" end
                    className={({isActive}) => "nav-link" + (isActive ? " active" : "")}>
                        <Trans>Movements</Trans>
                    </NavLink>
                </Nav.Item>
                <Nav.Item>
                    <NavLink to="/assets" end
                    className={({isActive}) => "nav-link" + (isActive ? " active" : "")}>
                        <Trans>Balance records</Trans>
                    </NavLink>
                </Nav.Item>
            </Nav>
        </div>
        <RightButtonGroup />
    </div>
};
const MainNavbar = () => {
    const isMobile = useMediaQuery({ query: '(max-width: 576px)' })
    if(isMobile){
        return <OffcanvasNavbar />
    }else{
        return <StandardNavbar />
    }
};
export default MainNavbar;