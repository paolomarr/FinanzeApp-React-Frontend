import Modal from 'react-bootstrap/Modal';
import MovementForm from "./MovementForm";
import { t } from "@lingui/macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { faCamera, faUpload, faXmark, faCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useRef } from 'react';
import { useCallback } from 'react';
import Webcam from 'react-webcam';
// import ToggleButton from 'react-bootstrap/esm/Button';
import Button from 'react-bootstrap/esm/Button';
import ButtonGroup from 'react-bootstrap/esm/ButtonGroup';
import { useMutation } from '@tanstack/react-query';
import mutateReceipt from '../queries/mutateReceipt';

const WebcamComponent = ({ onShotReady }) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [imgLoading, setImgLoading] = useState(false);
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef, setImgSrc]);
  const uploadImage = () => {
    if(null==imgSrc) return;
    console.log("Sending image: base64: " + imgSrc.substring(0, 10) + "..." + imgSrc.substring(imgSrc.length-10));
    onShotReady(imgSrc);
    setImgLoading(true);
  };
  return (
    <>
      { imgSrc ? 
        <div className='position-relative'>
          <img src={imgSrc} alt='The shot you took'/> 
          <div className='position-absolute bottom-0 start-50 opacity-75 translate-middle'>
            <Button className='mx-1' variant='secondary' onClick={() => setImgSrc(null)}><FontAwesomeIcon icon={faXmark} /></Button>
            <Button className='mx-1' variant='success' onClick={()=> uploadImage()}><FontAwesomeIcon icon={faUpload} /></Button>
          </div>
        </div>
      :
      <div className='position-relative'>
        <Webcam className='w-100'
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
        />
        <FontAwesomeIcon className='position-absolute bottom-0 start-50 translate-middle opacity-75' 
          icon={faCircle} 
          size="2xl" 
          style={{"color": "#f25a50"}}
          onClick={capture}/>
        { imgLoading ? <FontAwesomeIcon className='position-absolute bottom-50 start-50 translate-middle' icon={faSpinner} spin /> : null }
      </div>
      }
    </>
  )
}
const MovementModal = ({ showModal, toggleModal, onDataReady, title, fields }) => {
  const {show, movement, errors} = showModal;
  if(!title){
    title = showModal.movement ? t`Update movement data` : t`Insert new movement`;
  }
  const [showCamera, setShowCamera] = useState(false);
  const innerToggle = () => {
    setShowCamera(false);
    toggleModal();
  };
  const [webcamComponentKey, setWebcamComponentKey] = useState(0);
  const imageMutation = useMutation({
    mutationFn: mutateReceipt,
    // TODO: handle errors and response
    onSuccess: (result) => {
      console.log(result);
    },
    onError: (error) => {
      console.log(error);
    },
    onSettled: () => {
      setWebcamComponentKey(webcamComponentKey+1); // resets component's loading state
    }
  });
  const sendImage = (imgdata) => {
    imageMutation.mutate({imgBase64: imgdata});
  }
  return (
    <Modal show={show} onHide={innerToggle}>
      <Modal.Header closeButton><Modal.Title>{title}</Modal.Title></Modal.Header>
      <Modal.Body>
        <div style={{"textAlign": "center"}} className='mb-2'>
          <ButtonGroup>
            <Button className='px-4' variant={showCamera ? "outline-secondary" : "secondary"} ><FontAwesomeIcon icon={faPenToSquare} size="lg" onClick={() => setShowCamera(false)}/></Button>
            <Button className='px-4' variant={showCamera ? "secondary" : "outline-secondary"} ><FontAwesomeIcon icon={faCamera} size="lg" onClick={() => setShowCamera(true)}/></Button>
          </ButtonGroup>
        </div>
        { showCamera ? 
          <WebcamComponent key={webcamComponentKey} onShotReady={(img) => sendImage(img) }/> :
          <MovementForm movement={movement} cancel={innerToggle} onDataReady={onDataReady} errors={errors} fields={fields}/>
        }
      </Modal.Body>
    </Modal>
  );
};

export default MovementModal;
