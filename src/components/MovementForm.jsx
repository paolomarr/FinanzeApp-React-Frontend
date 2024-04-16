import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
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
const FormDeleteButton = ({deleteConfirmState, onclick}) => {
  let deleteLabel;
  let className="mx-1";
  switch (deleteConfirmState) {
    case DeleteState.start:
      deleteLabel = t`Delete`;
      break;
    case DeleteState.confirm:
      deleteLabel = t`Confirm`;
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
const FormSaveButton = ({onclick, addMore}) => {
  let className = "mx-1";
  const buttonLabel = addMore ? t`Save and add more` : t`Save`;
  const color = addMore ? "primary" : "secondary";
  
  return <Button className={className} color={color} onClick={onclick}>
    {buttonLabel}
  </Button>;
};
const FormCancelDeleteButton = ({deleteConfirmState, onclick}) => {
  let className = "mx-1";
  if(deleteConfirmState >= DeleteState.deleting){
    className += " disabled";
  }
  return <Button className={className} color="secondary" onClick={onclick}><Trans>Cancel</Trans></Button>
}
const FormButtonSet = ({movement, deleteConfirmState, submitter, deleter}) => {
  if(movement){ // prepare the set for EDIT/DELETE
      if(deleteConfirmState >= DeleteState.confirm){
        return <>
          <FormCancelDeleteButton deleteConfirmState={deleteConfirmState} onclick={(e) => {e.preventDefault(); deleter(false);}}/>
          <FormDeleteButton deleteConfirmState={deleteConfirmState} onclick={(e) => {e.preventDefault(); deleter(true);}}/>
        </>
      }else{
        return <>
          <FormDeleteButton deleteConfirmState={deleteConfirmState} onclick={(e)=> {e.preventDefault(); deleter(true)}} />
          <FormSaveButton onclick={(e) => {e.preventDefault(); submitter(true);}} addMore={false} />
          </>
      }
  }else{ // prepare the set for SAVE [& CONTINUE]
    return <>
      <FormSaveButton onclick={(e) => {e.preventDefault(); submitter(true);}} addMore={false} />
      <FormSaveButton onclick={(e) => {e.preventDefault(); submitter(false);}} addMore={true} />
    </>
  }
}

const MovementForm = ({movement, onDataReady, errors}) => {
    
    if(movement?.date){
      if(typeof movement.date == 'string'){
        movement.date = new Date(movement.date);
      }
    }
    const catresults = useQuery(["categories"], fetchCategories);
    const categories = catresults?.data ?? [];
    const subcatresults = useQuery(["subcategories"], fetchCategories);
    const subcategories = subcatresults?.data ?? [];
    let showSuccess = false;
    let showFail = false;
    const [newmovement, setNewmovement] = useState(movement ?? {
      date: new Date(),
      abs_amount: 0,
      description: "",
      category: -1,
    });
    if(errors){
      showSuccess = Object.keys(errors).length==0;
      showFail = Object.keys(errors).length>0;
    }
    
    const [deleteConfirmState, setDeleteConfirmState] = useState(0);
    const updateNewMovement = (update) => {
      if(update.subcategory <0)  delete update.subcategory;
      setNewmovement({...newmovement, ...update});
    }
    const submitDelete = (stepUp) => {
      if(!stepUp){
        setDeleteConfirmState(DeleteState.start);
        return;
      }
      if(deleteConfirmState === DeleteState.start){
        setDeleteConfirmState(DeleteState.confirm);
        return;
      }
      setDeleteConfirmState(DeleteState.deleting);
      onDataReady(newmovement, true);
    }
    const submitForm = (close) => {
      onDataReady(newmovement, false, !close);
    };

    return (
      <>
      <Form id="movementForm" onSubmit={(e) => e.preventDefault()} className="mb-2">
        {movement ? 
          <Form.Text type="hidden" name="id" value={movement.id} /> : null
        }
        <Form.Group>
          <Form.Label for="date">
            {t`Date`}
          </Form.Label>
          <input
            id="date"
            name="date"
            type="datetime-local"
            className={`form-control ${errors?.date? "is-invalid" : ""}`}
            value={format_ISO_date(newmovement.date)}
            onChange={(e) => updateNewMovement({date: new Date(e.target.value)})}
          />
          <Form.Control.Feedback>{errors?.date}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group>
            <Form.Label for="amount">
                {t`Amount`}
            </Form.Label>
            <Form.Text
                id="amount"
                name="abs_amount"
                type="number"
                className={`${errors?.abs_amount? "is-invalid" : ""}`}
                value={newmovement.abs_amount}
                onChange={(e) => updateNewMovement({abs_amount: e.target.value})}
                />
          <Form.Control.Feedback>{errors?.abs_amount?? ""}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group>
          <Form.Label for="description"><Trans>Description</Trans></Form.Label>
          <Form.Text 
            id="description" 
            name="description" 
            type="text" 
            className={`${errors?.description? "is-invalid" : ""}`}
            value={newmovement.description}
            onChange={(e) => updateNewMovement({description: e.target.value})}
            required
            />
          <Form.Control.Feedback>{errors?.description?? ""}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group>
          <Form.Label for="category"><Trans>Category</Trans></Form.Label>
          <Form.Select 
            id="category" 
            name="category" 
            type="select" 
            className={`${errors?.category? "is-invalid" : ""}`}
            onChange={(e) => updateNewMovement({category: e.target.value})}
            value={newmovement.category}>
            <option value={-1}></option>
            {!categories || categories.length <= 0 ? (null) : (categories.map((cat) => {
              return <option key={cat.id} value={cat.id}>{cat.category}</option>
            }))}
          </Form.Select>
          <Form.Control.Feedback>{errors?.category?? ""}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group>
          <Form.Label for="subcategory"><Trans>Subcategory</Trans></Form.Label>
          <Form.Select 
            id="subcategory" 
            name="subcategory" 
            type="select" 
            className={`${errors?.subcategory? "is-invalid" : ""}`}
            onChange={(e) => updateNewMovement({subcategory: e.target.value})}
            // value={newmovement.subcategory}
            >
            <option value={-1}>{"("}<Trans>optional</Trans>{")"}</option>
            {subcategories.map((cat) => {
              return <option key={cat.id} value={cat.id}>{cat.subcategory}</option>
            })}
          </Form.Select>
          <Form.Control.Feedback>{errors?.subcategory?? ""}</Form.Control.Feedback>
        </Form.Group>
        <div className="justify-content-center d-flex">
          <FormButtonSet movement={movement} deleteConfirmState={deleteConfirmState} submitter={(finished)=>{submitForm(finished)}} deleter={(stepUp)=>{submitDelete(stepUp)}} />
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