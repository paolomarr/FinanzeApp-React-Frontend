import Modal from 'react-bootstrap/Modal';
import MovementForm from "./MovementForm";
import { t, Trans } from "@lingui/macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { faCamera, faUpload, faXmark, faCircle, faSpinner, faCameraRotate, faMicrophone, faStop } from
'@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useRef } from 'react';
import { useCallback } from 'react';
import Webcam from 'react-webcam';
import Button from 'react-bootstrap/esm/Button';
import ButtonGroup from 'react-bootstrap/esm/ButtonGroup';
import { useMutation } from '@tanstack/react-query';
import mutateReceipt from '../queries/mutateReceipt';
import mutateVoice from '../queries/mutateVoice';

const VoiceRecorder = ({ onVoiceResultReady }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recordingError, setRecordingError] = useState(null);

  const voiceMutation = useMutation({
    mutationFn: mutateVoice,
    onSuccess: (result) => {
      if (result.success && result.movement) {
        onVoiceResultReady({...result.movement, abs_amount: Math.abs(result.movement.amount), date: new Date(result.movement.date)});
      }
    },
    onError: (error) => {
      console.error('Voice processing error:', error);
      setRecordingError(error.message);
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Try to use webm first, fallback to other formats if not supported
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/wav';
          }
        }
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      const audioChunks = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        setIsLoading(true);
        voiceMutation.mutate({ audioBlob });
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingError(null);
    } catch (error) {
      setRecordingError(t`Microphone access denied or not available`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  return (
    <div className="text-center">
      {recordingError && (
        <div className="alert alert-danger mb-3">
          <small>{recordingError}</small>
          <br/>
          <Button variant="secondary" size="sm" onClick={() => setRecordingError(null)}>
            <Trans>Dismiss</Trans>
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="my-4">
          <FontAwesomeIcon icon={faSpinner} spin size="2x" />
          <p className="mt-2"><Trans>Processing voice recording...</Trans></p>
        </div>
      ) : (
        <div className="my-4">
          {isRecording ? (
            <div>
              <FontAwesomeIcon
                icon={faStop}
                size="3x"
                style={{color: "#dc3545", cursor: "pointer"}}
                onClick={stopRecording}
                className="recording-pulse"
              />
              <p className="mt-2"><Trans>Recording... Tap to stop</Trans></p>
            </div>
          ) : (
            <div>
              <FontAwesomeIcon
                icon={faMicrophone}
                size="3x"
                style={{color: "#198754", cursor: "pointer"}}
                onClick={startRecording}
              />
              <p className="mt-2"><Trans>Tap to start recording</Trans></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const WebcamComponent = ({ onScanResultReady }) => {
  const webcamRef = useRef(null);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);
  const [imgLoading, setImgLoading] = useState(false);
  const [isScanError, setIsScanError] = useState(false);
  const imageMutation = useMutation({
    mutationFn: mutateReceipt,
    onSuccess: (result) => {
      if(result.warning){
        console.log(result.warning);
        setIsScanError(true);
      }else{
        onScanResultReady({...result, date: new Date(result.date)});
      }
    },
    onError: (error) => {
      console.log(error);
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
                <Button  className='mx-1' variant='secondary' onClick={() => {setIsScanError(false); setImgSrc(null);
}}><Trans>Try again</Trans></Button>
              </small>
            </div>
            </>
            : <>
                <Button className='mx-1' variant='secondary' onClick={() => setImgSrc(null)}><FontAwesomeIcon
icon={faXmark} /></Button>
                <Button className='mx-1' variant='success' onClick={()=> uploadImage()}><FontAwesomeIcon icon={faUpload}
/></Button>
              </>
            }
          </div>
          { imgLoading ? <FontAwesomeIcon className='position-absolute top-50 start-50 translate-middle'
icon={faSpinner} spin /> : null }
        </div>
        :
      <div className='position-relative'>
        <Webcam className='w-100'
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
        />
        <div className='bg-secondary bottom-0 opacity-75 p-1 position-absolute px-3 rounded-2 start-50
translate-middle'>
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
  const [inputMode, setInputMode] = useState('form'); // 'form', 'camera', 'voice'

  const innerToggle = () => {
    setInputMode('form');
    toggleModal();
  };

  const updateMovementFromCameraResult = (result) => {
    console.log(result);
    onMovementUpdate(result);
    setInputMode('form');
  };

  const updateMovementFromVoiceResult = (result) => {
    console.log(result);
    // movement from voice is saved automatically
    onDataReady(result, false, false);
  };

  return (
    <Modal show={show} onHide={innerToggle}>
      <Modal.Header closeButton><Modal.Title>{title}</Modal.Title></Modal.Header>
      <Modal.Body>
        <div style={{"textAlign": "center"}} className='mb-2'>
          <ButtonGroup>
            <Button className='px-4' variant={inputMode === 'form' ? "secondary" : "outline-secondary"}>
              <FontAwesomeIcon icon={faPenToSquare} size="lg" onClick={() => setInputMode('form')}/>
            </Button>
            <Button className='px-4' variant={inputMode === 'camera' ? "secondary" : "outline-secondary"}>
              <FontAwesomeIcon icon={faCamera} size="lg" onClick={() => setInputMode('camera')}/>
            </Button>
            <Button className='px-4' variant={inputMode === 'voice' ? "secondary" : "outline-secondary"}>
              <FontAwesomeIcon icon={faMicrophone} size="lg" onClick={() => setInputMode('voice')}/>
            </Button>
          </ButtonGroup>
        </div>

        {inputMode === 'camera' && (
          <WebcamComponent onScanResultReady={updateMovementFromCameraResult}/>
        )}

        {inputMode === 'voice' && (
          <VoiceRecorder onVoiceResultReady={updateMovementFromVoiceResult}/>
        )}

        {inputMode === 'form' && (
          <MovementForm movement={movement} cancel={innerToggle} onDataReady={onDataReady} errors={errors}
fields={fields}/>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default MovementModal;