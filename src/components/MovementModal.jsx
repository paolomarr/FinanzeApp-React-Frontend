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
    <Modal.Dialog isOpen={show} toggle={innerToggle}>
      <Modal.Header toggle={innerToggle}>{title}</Modal.Header>
      <Modal.Body>
        <MovementForm movement={movement} cancel={innerToggle} onDataReady={onDataReady} errors={errors}/>
      </Modal.Body>
    </Modal.Dialog>
  );
};

export default MovementModal;
