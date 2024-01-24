import { Modal, ModalHeader, ModalBody } from "reactstrap";
import MovementForm from "./MovementForm";

const MovementModal = ({ showModal, toggleModal, title }) => {
  const show = showModal.show;
  const movement = showModal.movement;
  
  return (
    <Modal isOpen={show} toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>{title}</ModalHeader>
      <ModalBody>
        <MovementForm movement={movement} cancel={toggleModal} />
      </ModalBody>
    </Modal>
  );
};

export default MovementModal;
