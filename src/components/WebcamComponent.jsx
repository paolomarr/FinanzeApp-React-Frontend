import { useRef, useState, useCallback, useMutation } from 'react';
import Webcam from "react-webcam";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faSpinner, faCircle, faCameraRotate } from "@fortawesome/free-solid-svg-icons";
import Button from "react-bootstrap/Button";
import {Trans} from "@lingui/macro";

export const WebcamComponent = ({ onScanResultReady }) => {
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