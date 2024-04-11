import { Modal, ModalHeader, ModalBody } from "reactstrap";
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
    <Modal isOpen={show} toggle={innerToggle}>
      <ModalHeader toggle={innerToggle}>{title}</ModalHeader>
      <ModalBody>
        <MovementForm movement={movement} cancel={innerToggle} onDataReady={onDataReady} errors={errors}/>
      </ModalBody>
    </Modal>
  );
};

export default MovementModal;
