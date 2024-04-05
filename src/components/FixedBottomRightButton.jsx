import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { colors } from "../constants";

const FixedBottomRightButton = ({onClick, icon}) => {
    if(!icon){
        icon = faCirclePlus;
    }
    return (
        <button onClick={onClick} 
          style={{position: "fixed", right: "2%", bottom: "2%", border: "unset", background: "unset"}}>
          <FontAwesomeIcon style={{color: colors.secondary_A00}} icon={icon} size="3x"/>
        </button>
    )
}
export default FixedBottomRightButton;