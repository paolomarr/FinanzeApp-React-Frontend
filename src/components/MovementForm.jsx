import { Form, FormGroup, FormFeedback, Label, Input, Alert, Button } from "reactstrap";
import { useQuery } from "@tanstack/react-query";
import fetchCategories from "../queries/fetchCategories";
import { useState } from "react";
import { t, Trans } from "@lingui/macro";
import { format_ISO_date } from "../_lib/format_locale";

const DeleteState = {
  start: 0,
  confirm: 1,
  deleting: 2,
  deleted: 3
};
const FormDeleteButton = ({movement, deleteConfirmState, onclick}) => {
  if(!movement){
    return null;
  }
  let deleteLabel;
  let className="";
  switch (deleteConfirmState) {
    case DeleteState.start:
      deleteLabel = t`Delete`;
      break;
    case DeleteState.confirm:
      deleteLabel = t`Are you sure` + "?";
      break;
    case DeleteState.deleting:
      deleteLabel = t`Deleting` + "...";
      break;
    case DeleteState.deleted:
      deleteLabel = t`Deleted`;
      className="disabled";
      break;
    default:
      break;
  }
  return (
    <Button color="danger" onClick={onclick} className={className}>{deleteLabel}</Button>
  )
};
const FormSaveButton = ({deleteConfirmState, onclick, addMore}) => {
  let className = "";
  if(deleteConfirmState >= DeleteState.deleting){
    className = "disabled";
  }
  const buttonLabel = addMore ? t`Save and add more` : t`Save`;
  const color = addMore ? "primary" : "secondary";
  
  return <Button className={className} color={color} onClick={onclick}>
    {buttonLabel}
  </Button>;
};

const MovementForm = ({movement, cancel, onDataReady, errors}) => {
    
    if(movement?.date){
      if(typeof movement.date == 'string'){
        movement.date = new Date(movement.date);
      }
    }
    const catresults = useQuery(["categories"], fetchCategories);
    const categories = catresults?.data ?? [];
    const subcatresults = useQuery(["subcategories"], fetchCategories);
    const subcategories = subcatresults?.data ?? [];
    let showSuccess = errors?.length==0 ?? false;
    let showFail = errors?.length>0 ?? false;
    const [newmovement, setNewmovement] = useState(movement ?? {
      date: new Date(),
      abs_amount: 0,
      description: "",
      category: null,
      subcategory: null,
    });
    const [deleteConfirmState, setDeleteConfirmState] = useState(0);
    const updateNewMovement = (update) => {
      setNewmovement({...newmovement, ...update});
    }
    const submitDelete = (e) => {
      e.preventDefault();
      if(deleteConfirmState === DeleteState.start){
        setDeleteConfirmState(DeleteState.confirm);
        return;
      }
      setDeleteConfirmState(DeleteState.deleting);
      onDataReady(newmovement, true);
      // const method = "DELETE";
      // const url = `${API_URL}movements/${newmovement.id}`;
      // authenticatedFetch(url, {
      //   method: method,
      // }).then((response) => {
      //   setDeleteConfirmState(DeleteState.deleted);
      //   if(response.ok){
      //     setShowSuccess(true);
      //     if(data_submitted){
      //       data_submitted(true);
      //     }
      //   }else{
      //     setShowFail(true);
      //   }
      // });
    }
    const submitForm = (e, exit) => {
      e.preventDefault();
      onDataReady(newmovement, false);
      if(exit && cancel){
        cancel();
      }
      // let method = "";
      // let url = `${API_URL}movements/`;
      // if(newmovement.id){ // update existing -> PUT
      //   method = "PUT";
      //   url += `${newmovement.id}`;
      // }else{ // new movement -> POST
      //   method = "POST";
      // }
      // const body = JSON.stringify(newmovement);
      // authenticatedFetch(url, {
      //   method: method,
      //   body: body
      // }, {
      //   "Content-Type": "application/json"
      // }).then((response) => {
      //   if(response.ok){
      //     response.json().then((data) => {
      //       if(data.errors){
      //         setErrors(response.data);
      //       }else{
      //         // reset some fields
      //         setNewmovement({...newmovement, 
      //           abs_amount: 0,
      //           description:"",
      //           category: null,
      //           subcategory: null,
      //         });
      //         setShowSuccess(true);
      //         if(data_submitted){
      //           data_submitted(true);
      //         }
      //         if(exit && cancel){
      //           cancel();
      //         }
      //       }
      //     });
      //   }else{
      //     setShowFail(true);
      //     response.json().then((json) => {
      //       setErrors(json);
      //     });
      //   }
      // });
    };

    return (
      <>
      <Form id="movementForm" onSubmit={(e) => submitForm(e)} className="mb-2">
        {movement ? 
          <Input type="hidden" name="id" value={movement.id} /> : null
        }
        <FormGroup>
          <Label for="date">
            {t`Date`}
          </Label>
          <input
            id="date"
            name="date"
            type="datetime-local"
            className={`form-control ${errors?.date? "is-invalid" : ""}`}
            value={format_ISO_date(newmovement.date)}
            onChange={(e) => updateNewMovement({date: new Date(e.target.value)})}
          />
          <FormFeedback>{errors?.date}</FormFeedback>
        </FormGroup>
        <FormGroup>
            <Label for="amount">
                {t`Amount`}
            </Label>
            <Input
                id="amount"
                name="abs_amount"
                type="number"
                className={`${errors?.abs_amount? "is-invalid" : ""}`}
                value={newmovement.abs_amount}
                onChange={(e) => updateNewMovement({abs_amount: e.target.value})}
                />
          <FormFeedback>{errors?.abs_amount?? ""}</FormFeedback>
        </FormGroup>
        <FormGroup>
          <Label for="description"><Trans>Description</Trans></Label>
          <Input 
            id="description" 
            name="description" 
            type="text" 
            className={`${errors?.description? "is-invalid" : ""}`}
            value={newmovement.description}
            onChange={(e) => updateNewMovement({description: e.target.value})}
            required
            />
          <FormFeedback>{errors?.description?? ""}</FormFeedback>
        </FormGroup>
        <FormGroup>
          <Label for="category"><Trans>Category</Trans></Label>
          <Input 
            id="category" 
            name="category" 
            type="select" 
            className={`${errors?.category? "is-invalid" : ""}`}
            onChange={(e) => updateNewMovement({category: e.target.value})}
            value={newmovement.category}>
            <option value={null}></option>
            {!categories || categories.length <= 0 ? (null) : (categories.map((cat) => {
              return <option key={cat.id} value={cat.id}>{cat.category}</option>
            }))}
          </Input>
          <FormFeedback>{errors?.category?? ""}</FormFeedback>
        </FormGroup>
        <FormGroup>
          <Label for="subcategory"><Trans>Subcategory</Trans></Label>
          <Input 
            id="subcategory" 
            name="subcategory" 
            type="select" 
            className={`${errors?.subcategory? "is-invalid" : ""}`}
            onChange={(e) => updateNewMovement({subcategory: e.target.value})}
            value={newmovement.subcategory}>
            <option value={null}>{"("}<Trans>optional</Trans>{")"}</option>
            {subcategories.map((cat) => {
              return <option key={cat.id} value={cat.id}>{cat.subcategory}</option>
            })}
          </Input>
          <FormFeedback>{errors?.subcategory?? ""}</FormFeedback>
        </FormGroup>
        <div className="text-center">
          <FormDeleteButton movement={movement} deleteConfirmState={deleteConfirmState} onclick={(e)=>submitDelete(e)}></FormDeleteButton>{' '}
          <FormSaveButton deleteConfirmState={deleteConfirmState} onclick={(e)=>submitForm(e,true)}></FormSaveButton>{' '}
          { !movement ? <FormSaveButton addMore={true} deleteConfirmState={deleteConfirmState} onclick={(e)=>submitForm(e,false)}></FormSaveButton> : null }
        </div>
      </Form>
      <Alert color="info" isOpen={showSuccess} toggle={() => showSuccess = !showSuccess}>
        { deleteConfirmState < DeleteState.deleting ?
          <Trans>Data has been saved</Trans> :
          <Trans>Deleted</Trans>
        }{"."}
      </Alert>
      <Alert color="danger" isOpen={showFail} toggle={() => showFail = !showFail}>
        <Trans>An error occurred while saving data.</Trans>
      </Alert>
      </>
    );
};

export default MovementForm;