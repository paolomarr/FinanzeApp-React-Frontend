import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const LoadingDiv = () => {
    return (
        <div className="loading-pane justify-content-center text-center">
            <FontAwesomeIcon icon={faSpinner} spinPulse size="2xl"/>
        </div>
        );
};

export default LoadingDiv;