import { useState } from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import MovementForm from "./MovementForm";

const MovementModal = ({ showModal, toggleModal, title }) => {
  const show = showModal.show;
  const movement = showModal.movement;
  const [dataSubmitted, setDataSubmitted] = useState(false);
  
  const innerToggle = () => {
    toggleModal(dataSubmitted);
  }
  return (
    <Modal isOpen={show} toggle={innerToggle}>
      <ModalHeader toggle={innerToggle}>{title}</ModalHeader>
      <ModalBody>
        <MovementForm movement={movement} cancel={innerToggle} data_submitted={setDataSubmitted}/>
      </ModalBody>
    </Modal>
  );
};

export default MovementModal;
