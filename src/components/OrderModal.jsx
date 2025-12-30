import Modal from 'react-bootstrap/Modal';
import { t } from "@lingui/macro";

const OrderModal = ({ showModal, onOrderUpdate, toggleModal, onDataReady, operations, stocks, editOrder }) => {
  const {show, errors} = showModal;
  const title = editOrder ? t`Update order data` : t`Insert new order`;

  return (
    <Modal show={show} onHide={toggleModal}>
      <Modal.Header closeButton><Modal.Title>{title}</Modal.Title></Modal.Header>
      <Modal.Body>
        <OrderInsertionForm 
          operations={operations} 
          stocks={stocks} 
          onMutateOrder={onDataReady}
          editOrder={editOrder}
          errors={errors}
        />
      </Modal.Body>
    </Modal>
  );
};

export default OrderModal;
