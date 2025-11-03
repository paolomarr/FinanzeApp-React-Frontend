import Modal from 'react-bootstrap/Modal';
import MovementForm from "./MovementForm";
import { t, Trans } from "@lingui/macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";


const MovementModal = ({ showModal, onMovementUpdate, toggleModal, onDataReady, title, fields }) => {
  const {show, movement, errors} = showModal;
  if(!title){
    title = showModal.movement ? t`Update movement data` : t`Insert new movement`;
  }

  return (
    <Modal show={show} onHide={toggleModal}>
      <Modal.Header closeButton><Modal.Title>{title}</Modal.Title></Modal.Header>
      <Modal.Body>
        <MovementForm movement={movement} cancel={toggleModal} onDataReady={onDataReady} errors={errors} fields={fields}/>
      </Modal.Body>
    </Modal>
  );
};

export default MovementModal;
