import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Feedback from 'react-bootstrap/Feedback';
import { useQuery } from "@tanstack/react-query";
import fetchCategories from "../queries/fetchCategories";
import { useState } from "react";
import { t, Trans } from "@lingui/macro";
import { format_ISO_date } from "../_lib/format_locale";
import FormGroup from 'react-bootstrap/esm/FormGroup';

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
    <Button variant="danger" onClick={onclick} className={className}>{deleteLabel}</Button>
  )
};
const FormSaveButton = ({onclick, addMore}) => {
  let className = "mx-1";
  const buttonLabel = addMore ? t`Save and add more` : t`Save`;
  const color = addMore ? "primary" : "secondary";
  
  return <Button className={className} variant={color} onClick={onclick}>
    {buttonLabel}
  </Button>;
};
const FormCancelDeleteButton = ({deleteConfirmState, onclick}) => {
  let className = "mx-1";
  if(deleteConfirmState >= DeleteState.deleting){
    className += " disabled";
  }
  return <Button className={className} variant="secondary" onClick={onclick}><Trans>Cancel</Trans></Button>
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

const MovementForm = ({movement, onDataReady, errors, fields}) => {
    const _initialMovement = () => {
      return {
        date: new Date(),
        abs_amount: 0,
        description: "",
        category: -1,
      };
    };
    if(movement?.date){
      if(typeof movement.date == 'string'){
        movement.date = new Date(movement.date);
      }
    }
    const catresults = useQuery(["categories"], fetchCategories);
    const categories = catresults?.data ?? [];
    const subcatresults = useQuery(["subcategories"], fetchCategories);
    const subcategories = subcatresults?.data ?? [];
    const [showSuccess, setShowSuccess] = useState(true);
    const [showFail, setShowFail] = useState(true);
    const [newmovement, setNewmovement] = useState(movement ?? _initialMovement());
    // const movementFormRef = useRef(null);
    const [deleteConfirmState, setDeleteConfirmState] = useState(0);
    const updateNewMovement = (update) => {
      let updated = {...newmovement, ...update};
      if(update.subcategory <0)  delete updated.subcategory;
      setNewmovement(updated);
    }
    const cleanUpForm = () => {
      const resetMovement = _initialMovement();
      setShowSuccess(true);
      setShowFail(true);
      setNewmovement(resetMovement);
      // const inputs = movementFormRef.current?.elements;
      // if(inputs){
      //   inputs["date"].value = format_ISO_date(resetMovement.date);
      //   inputs["abs_amount"].value = resetMovement.abs_amount;
      //   inputs["description"].value = resetMovement.description;
      //   inputs["category"].value = resetMovement.category;
      //   inputs["subcategory"].value = resetMovement.subcategory;
      // }
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
      cleanUpForm();
    }
    const submitForm = (close) => {
      onDataReady(newmovement, false, !close);
      cleanUpForm();
    };

    let errors_success = false;
    let errors_fail = false;
    if(errors){
      const any_error = Object.keys(errors).length > 0;
      if(any_error){
        errors_fail = true
      }else{
        errors_success = true;
      }
    }
    

    return (
      <>
      <Form onSubmit={(e) => e.preventDefault()} className="mb-2">
        {movement ? 
          <Form.Control type="hidden" name="id" value={movement.id} /> : null
        }
        { fields && !fields?.includes("date") ? null : <FormGroup>
          <Form.Label htmlFor="date">
            {t`Date`}
          </Form.Label>
          <input
            id="date"
            name="date"
            type="datetime-local"
            className={`form-control ${errors?.date? "is-invalid" : ""}`}
            value={format_ISO_date(newmovement.date ?? new Date())}
            onChange={(e) => updateNewMovement({date: new Date(e.target.value)})}
          />
          <Feedback type='invalid'>{errors?.date}</Feedback>
          </FormGroup> }
        { fields && !fields?.includes("abs_amount") ? null : <FormGroup>
            <Form.Label htmlFor="amount">
                {t`Amount`}
            </Form.Label>
            <Form.Control
                id="amount"
                name="abs_amount"
                type="number"
                className={`${errors?.abs_amount? "is-invalid" : ""}`}
                value={newmovement.abs_amount}
                onChange={(e) => updateNewMovement({abs_amount: e.target.value})}
                />
          <Feedback type='invalid'>{errors?.abs_amount?? ""}</Feedback>
          </FormGroup> }
        { fields && !fields?.includes("description") ? null : <FormGroup>
          <Form.Label htmlFor="description"><Trans>Description</Trans></Form.Label>
          <Form.Control 
            id="description" 
            name="description" 
            type="text" 
            className={`${errors?.description? "is-invalid" : ""}`}
            value={newmovement.description}
            onChange={(e) => updateNewMovement({description: e.target.value})}
            required
            />
          <Feedback type='invalid'>{errors?.description?? ""}</Feedback>
          </FormGroup> }
        { fields && !fields?.includes("category") ? null : <FormGroup>
          <Form.Label htmlFor="category"><Trans>Category</Trans></Form.Label>
          <Form.Select 
            id="category" 
            name="category" 
            type="select" 
            className={`${errors?.category? "is-invalid" : ""}`}
            onChange={(e) => updateNewMovement({category: e.target.value})}
            value={newmovement.category}
            >
            <option value={-1}></option>
            {!categories || categories.length <= 0 ? (null) : (categories.map((cat) => {
              return <option key={cat.id} value={cat.id}>{cat.category}</option>
            }))}
          </Form.Select>
          <Feedback type='invalid'>{errors?.category?? ""}</Feedback>
          </FormGroup> }
        { fields && !fields?.includes("subcategory") ? null : <FormGroup>
          <Form.Label htmlFor="subcategory"><Trans>Subcategory</Trans></Form.Label>
          <Form.Select 
            id="subcategory" 
            name="subcategory" 
            type="select" 
            className={`${errors?.subcategory? "is-invalid" : ""}`}
            onChange={(e) => updateNewMovement({subcategory: e.target.value})}
            value={newmovement.subcategory}
            >
            <option value={-1}>{"("}<Trans>optional</Trans>{")"}</option>
            {subcategories.map((cat) => {
              return <option key={cat.id} value={cat.id}>{cat.subcategory}</option>
            })}
          </Form.Select>
          <Feedback type='invalid'>{errors?.subcategory?? ""}</Feedback>
          </FormGroup> }
        <div className="justify-content-center d-flex mt-2">
          <FormButtonSet movement={movement} deleteConfirmState={deleteConfirmState} submitter={(finished)=>{submitForm(finished)}} deleter={(stepUp)=>{submitDelete(stepUp)}} />
        </div>
      </Form>
      { errors_success && showSuccess ? 
        <Alert variant="info" onClose={() => setShowSuccess(false)} dismissible>
          { deleteConfirmState < DeleteState.deleting ?
            <Trans>Data has been saved</Trans> :
            <Trans>Deleted</Trans>
          }{"."}
        </Alert> : null 
      }
      { errors_fail && showFail ?
        <Alert variant="danger" onClose={() => setShowFail(false)} dismissible>
          <Trans>An error occurred while saving data.</Trans>
        </Alert> : null
      }
      </>
    );
};

export default MovementForm;