import { faIcons } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Nav from 'react-bootstrap/Nav';
import { NavLink, Outlet, Route, Routes } from 'react-router-dom';
import CategoryManager from './CategoryManager';

const SettingsComponent = () => {
    return <>
        <Nav>
            <Nav.Item>
                <NavLink
                    to="categories"
                    className={({ isActive, isPending }) =>
                        isPending ? "pending" : isActive ? "active" : ""
                    }
                    >
                    <FontAwesomeIcon icon={faIcons} />
                </NavLink>
            </Nav.Item>
        </Nav>
        <Outlet />
    </>
}
const Settings = () => {
    return <>
        <Routes>
            <Route path='' element={<SettingsComponent />}>
                <Route path="categories" element={<CategoryManager />} />
            </Route>
        </Routes>
    </>
}

export default Settings;