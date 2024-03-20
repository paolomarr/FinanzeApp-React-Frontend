import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";

const FixedBottomRightButton = ({onClick, icon}) => {
    if(!icon){
        icon = faCirclePlus;
    }
    return (
        <button onClick={onClick} 
          style={{position: "fixed", right: "2%", bottom: "2%", border: "unset", background: "unset"}}>
          <FontAwesomeIcon className="text-secondary" icon={icon} size="3x"/>
        </button>
    )
}
export default FixedBottomRightButton;