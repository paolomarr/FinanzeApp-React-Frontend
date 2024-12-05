import Modal from 'react-bootstrap/Modal';
import MovementForm from "./MovementForm";
import { t, Trans } from "@lingui/macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { faCamera, faUpload, faXmark, faCircle, faSpinner, faCameraRotate } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useRef } from 'react';
import { useCallback } from 'react';
import Webcam from 'react-webcam';
// import ToggleButton from 'react-bootstrap/esm/Button';
import Button from 'react-bootstrap/esm/Button';
import ButtonGroup from 'react-bootstrap/esm/ButtonGroup';
import { useMutation } from '@tanstack/react-query';
import mutateReceipt from '../queries/mutateReceipt';

const WebcamComponent = ({ onScanResultReady }) => {
  const webcamRef = useRef(null);
  // const _cameras_constraints_map = {
  //   REAR_CAMERA: "environment",
  //   FRONT_CAMERA: "user"
  // };
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);
  const [imgLoading, setImgLoading] = useState(false);
  const [isScanError, setIsScanError] = useState(false);
  const imageMutation = useMutation({
    mutationFn: mutateReceipt,
    // TODO: handle errors and response
    onSuccess: (result) => {
      if(result.warning){ // parsing failed
        console.log(result.warning);
        setIsScanError(true);
        // MOCK
        // onScanResultReady({description: "MOCKED DATA", date: new Date() + 24*60*60, abs_amount: 666.66}); // mock with tomorrow date
      }else{
        onScanResultReady({...result, date: new Date(result.date)});
      }
    },
    onError: (error) => {
      console.log(error);
      // MOCK
      // onScanResultReady({description: "MOCKED DATA", date: new Date() + 24*60*60, abs_amount: 666.66}); // mock with tomorrow date
    },
    onSettled: () => {
      setImgLoading(false);
    }
  });
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef, setImgSrc]);
  const uploadImage = () => {
    if(null==imgSrc) return;
    const b64marker = "base64,"
    let bareImgB64 = imgSrc;
    const index = imgSrc.indexOf(b64marker);
    if(index>=0){
      bareImgB64 = imgSrc.slice(index+b64marker.length);
    }
    // console.log("Sending image: base64: " + bareImgB64.substring(0, 20) + "..." + bareImgB64.substring(bareImgB64.length-10));
    imageMutation.mutate({imgBase64: bareImgB64})
    setImgLoading(true);
  };
  const videoConstraints = {facingMode: isFrontCamera ? "user" : "environment"};
  return (
    <>
      { imgSrc ? 
        <div className='position-relative'>
          <img src={imgSrc} alt='The shot you took'/> 
          <div className='position-absolute  opacity-75 bottom-0 start-50 translate-middle-x w-75 text-center'>
            { isScanError ? <>
            <div className="alert alert-secondary" role="alert">
              <small>
                <Trans>Could not parse the receipt content.</Trans>
                <br/>
                <Button  className='mx-1' variant='secondary' onClick={() => {setIsScanError(false); setImgSrc(null); }}><Trans>Try again</Trans></Button>
              </small>
            </div>
            </>
            : <>
                <Button className='mx-1' variant='secondary' onClick={() => setImgSrc(null)}><FontAwesomeIcon icon={faXmark} /></Button>
                <Button className='mx-1' variant='success' onClick={()=> uploadImage()}><FontAwesomeIcon icon={faUpload} /></Button>
              </>
            }
          </div>
          { imgLoading ? <FontAwesomeIcon className='position-absolute top-50 start-50 translate-middle' icon={faSpinner} spin /> : null }
        </div>
        :
      <div className='position-relative'>
        <Webcam className='w-100'
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
        />
        <div className='bg-secondary bottom-0 opacity-75 p-1 position-absolute px-3 rounded-2 start-50 translate-middle'>

          <FontAwesomeIcon
            icon={faCircle} 
            size="2xl" 
            style={{"color": "#f25a50"}}
            onClick={capture}/>
          <FontAwesomeIcon
            icon={faCameraRotate}
            size="2xl" 
            onClick={()=> setIsFrontCamera(!isFrontCamera)}/>
        </div>
      </div>
      }
    </>
  )
}
const MovementModal = ({ showModal, onMovementUpdate, toggleModal, onDataReady, title, fields }) => {
  const {show, movement, errors} = showModal;
  if(!title){
    title = showModal.movement ? t`Update movement data` : t`Insert new movement`;
  }
  const [showCamera, setShowCamera] = useState(false);
  const innerToggle = () => {
    setShowCamera(false);
    toggleModal();
  };
  const updateMovementFromCameraResult = (result) => {
    console.log(result);
    onMovementUpdate(result);
    setShowCamera(false);
  };
  
  
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
          <WebcamComponent onScanResultReady={updateMovementFromCameraResult}/> :
          <MovementForm movement={movement} cancel={innerToggle} onDataReady={onDataReady} errors={errors} fields={fields}/>
        }
      </Modal.Body>
    </Modal>
  );
};

export default MovementModal;
