import Modal from 'react-bootstrap/Modal';
import MovementForm from "./MovementForm";
import { t } from "@lingui/macro";

const MovementModal = ({ showModal, toggleModal, onDataReady, title }) => {
  // const show = showModal.show;
  // const movement = showModal.movement;
  const {show, movement, errors} = showModal;
  if(!title){
    title = showModal.movement ? t`Update movement data` : t`Insert new movement`;
  }
  const innerToggle = () => {
    toggleModal();
  }
  return (
    <Modal show={show} onHide={innerToggle}>
      <Modal.Header onHide={innerToggle}><Modal.Title>{title}</Modal.Title></Modal.Header>
      <Modal.Body>
        <MovementForm movement={movement} cancel={innerToggle} onDataReady={onDataReady} errors={errors}/>
      </Modal.Body>
    </Modal>
  );
};

export default MovementModal;
