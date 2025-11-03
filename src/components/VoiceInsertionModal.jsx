import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { t, Trans } from "@lingui/macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faStop, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import mutateVoice from '../queries/mutateVoice';

/**
 * VoiceRecorder is a React component which allows users to record voice messages.
 *
 * @param {function} onVoiceResultReady - Called when the voice recording is finished and the result is ready.
 * @returns A React component which displays a button to start recording and a button to stop recording.
 */
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

const VoiceInsertionModal = ({ show, onHide, onMovementCreated, onManualInsert }) => {
  const handleVoiceResult = (movement) => {
    onMovementCreated(movement);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{t`Add Movement with Voice`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <VoiceRecorder onVoiceResultReady={handleVoiceResult} />
        <div className="text-center mt-3">
          <button 
            onClick={onManualInsert}
            className="border-0 bg-transparent text-primary text-decoration-underline"
          >
            {t`Insert manually`}
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default VoiceInsertionModal;
