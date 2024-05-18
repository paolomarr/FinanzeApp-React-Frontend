import { useMediaQuery } from "react-responsive";
import Offcanvas from 'react-bootstrap/Offcanvas';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faLanguage, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { useState } from "react";
import { Trans } from "@lingui/macro";
import Dropdown from 'react-bootstrap/Dropdown'
import { languages } from "../constants";
import { useLingui } from "@lingui/react";

const OffcanvasNavbar = () => {
    const { i18n } = useLingui();
    const setLanguage = (locale) => {
        localStorage.setItem("user_locale", locale);
        i18n.activate(locale);
    };
    
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return <div className="my-2 mx-2 d-flex">
        <div className="me-auto">
            <Button variant="secondary" onClick={handleShow}>
                <FontAwesomeIcon icon={faBars} />
            </Button>
            <Offcanvas show={show} onHide={handleClose}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title><div className="invisible">Title</div></Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Nav className="flex-column">
                        <Nav.Item>
                            <Nav.Link href="/"><Trans>Movements overview</Trans></Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="/assets"><Trans>Balance records</Trans></Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Offcanvas.Body>
            </Offcanvas>
        </div>
        <ButtonGroup>
            <Dropdown as={ButtonGroup}>
                <Dropdown.Toggle variant="secondary">
                    <FontAwesomeIcon icon={faLanguage} />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Header><Trans>Languages</Trans></Dropdown.Header>
                    { languages.map((loc)=> {return <Dropdown.Item className={loc.locale === i18n.locale ? "fw-bold" : ""} key={loc.locale} onClick={() => setLanguage(loc.locale)}>{loc.name}</Dropdown.Item>} )
                        }
                </Dropdown.Menu>
            </Dropdown>
            <Button variant="secondary" href="/logout">
                <FontAwesomeIcon icon={faRightFromBracket} />
            </Button>
        </ButtonGroup>
    </div>
};
const StandardNavbar = () => {
    return <Navbar></Navbar>
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