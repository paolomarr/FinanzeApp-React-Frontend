import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import MovementForm from "./MovementForm";

const MovementModal = ({ showModal, toggleModal, title }) => {
  const show = showModal.show;
  const movement = showModal.movement;
  return (
    <Modal isOpen={show} toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>{title}</ModalHeader>
      <ModalBody>
        <MovementForm movement={movement} />
      </ModalBody>
      <ModalFooter>
          <Button color="primary" onClick={toggleModal}>
            Save
          </Button>{' '}
          <Button color="secondary" onClick={toggleModal}>
            Cancel
          </Button>
        </ModalFooter>
    </Modal>
  );
};

export default MovementModal;
