import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import fetchMovements from "../queries/fetchMovements";
import mutateMovement from "../queries/mutateMovement";
import { Navigate, useNavigate } from "react-router-dom";
import { sub, add } from "date-fns";
import FixedBottomRightButton from "./FixedBottomRightButton";
import MovementModal from "./MovementModal"
import VoiceInsertionModal from "./VoiceInsertionModal"
import LoadingDiv from "./LoadingDiv";
import { Container, Form } from 'react-bootstrap';
import MovementsList from "./MovementsList";
import { t } from "@lingui/macro";

const Movements = () => {
  const queryclient = useQueryClient();
  const navigate = useNavigate();
  const monthsBack = 12; // Show more data on full page

  const [dataSlice] = useState({
    minDate: sub(new Date(), {months: monthsBack}),
    maxDate: new Date(),
  });

  const [showModal, setShowModal] = useState({
    movement: null,
    show: false,
    errors: null,
  });

  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const toggleModal = () => {
    const show = !showModal.show;
    setShowModal({...showModal, show: show});
  };

  const categoryResults = useQuery({
    queryKey: ["categories"],
    queryFn: fetchMovements,
    retry: (failureCount, error) => {
      if(error.message === "forbidden"){
        queryclient.cancelQueries();
        navigate("/login");
        return false;
      } else{ 
        return failureCount-1;
      }
    }, 
  });

  const subcategoryResults = useQuery({
    queryKey: ["subcategories"],
    queryFn: fetchMovements,
    retry: (failureCount, error) => {
      if(error.message === "forbidden"){
        queryclient.cancelQueries();
        navigate("/login");
        return false;
      } else{ 
        return failureCount-1;
      }
    }, 
  });

  const movementResults = useQuery({
    queryKey: ["movements", {
      all: true, 
      datefrom: dataSlice.minDate, 
      // dateto: add(dataSlice.maxDate, {days: 1}),
      sort_field: "date",
    }],
    queryFn: fetchMovements,
    retry: (failureCount, error) => {
      if(error.message === "forbidden"){
        queryclient.cancelQueries();
        navigate("/login");
        return false;
      } else{ 
        console.log(`'movements query error: ${error.message}`);
        return failureCount-1;
      }
    },
    enabled: !!categoryResults.data && !!subcategoryResults.data,
  });

  const mutation = useMutation({
    mutationFn: ({movement, _delete}) => {
      setShowModal({...showModal, errors: null});
      return mutateMovement({movement, _delete});
    },
    onSuccess: (result, {_continue}) => {
      setShowModal({...showModal, show: _continue, movement: null, errors: {}})
      queryclient.invalidateQueries(["movements"]);
    },
    onError: (error, variables, context) => {
      console.log(variables);
      console.log(context);
      setShowModal({...showModal, errors: error.cause})
    }
  });

  const handleVoiceMovementCreated = (movement) => {
    // Only invalidate the movements query to refresh the data
    queryclient.invalidateQueries(["movements"]);
  };

  const handleManualInsert = () => {
    setShowVoiceModal(false);
    setShowModal({show: true, movement: null, errors: null});
  };

  if (movementResults.isLoading) {
    return <LoadingDiv />
  }

  if (movementResults.isError) {
    switch (movementResults.error.message) {
      case "forbidden":
        console.log("Unable to fetch: unauthenticated");
        break;
      default:
        console.log("Unable to fetch: unknown error");
        break;
    }
    return <Navigate to="/login" />
  }

  return (
    <Container fluid>
      <MovementsList
        movements={movementResults.data?.filtered?.movements}
        categories={categoryResults.data}
        subcategories={subcategoryResults.data}
        onEdit={(movement) => setShowModal({show: true, movement: movement})}
        isWidget={false}
        compact={false}
      />

      <FixedBottomRightButton onClick={() => setShowVoiceModal(true)} />

      <VoiceInsertionModal
        show={showVoiceModal}
        onHide={() => setShowVoiceModal(false)}
        onMovementCreated={handleVoiceMovementCreated}
        onManualInsert={handleManualInsert}
      />

      <MovementModal
        showModal={showModal}
        onMovementUpdate={(newMovement)=>setShowModal({...showModal, movement:newMovement})}
        toggleModal={toggleModal}
        onDataReady={(movement, todelete, tocontinue) => mutation.mutate({movement: movement, _delete: todelete, _continue: tocontinue})}
      />
    </Container>
  )
}

export default Movements;
