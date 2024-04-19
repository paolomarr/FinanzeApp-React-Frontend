import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Button from "react-bootstrap/Button";

const FixedBottomRightButton = ({onClick, icon}) => {
    if(!icon){
        icon = faPlus;
    }
    return (
        <Button onClick={onClick} variant="secondary"
            className="rounded-circle bg-opacity-50"
          style={{position: "fixed", right: "2%", bottom: "2%", border: "unset"}}>
          <FontAwesomeIcon icon={icon} size="2x" className="text-primary"/>
        </Button>
    )
}
export default FixedBottomRightButton;