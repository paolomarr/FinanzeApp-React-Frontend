import { Form, FormGroup, FormFeedback, Label, Input, Alert, Button } from "reactstrap";
import { useQuery } from "@tanstack/react-query";
import fetchCategories from "../queries/fetchCategories";
import { useState } from "react";
import { API_URL } from "../constants";
import authenticatedFecth from "../queries/authenticatedFetch";

const MovementForm = (props) => {
    const movement = props.movement;
    if(movement?.date){
      if(typeof movement.date == 'string'){
        movement.date = new Date(movement.date);
      }
    }
    const catresults = useQuery(["categories"], fetchCategories);
    const categories = catresults?.data ?? [];
    const subcatresults = useQuery(["subcategories"], fetchCategories);
    const subcategories = subcatresults?.data ?? [];
    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [showFail, setShowFail] = useState(false);
    const [newmovement, setNewmovement] = useState(movement ?? {
      date: new Date(),
      abs_amount: 0,
      description: "",
      category: -1,
      subcategory: -1,
    });
    const updateNewMovement = (update) => {
      setNewmovement({...newmovement, ...update});
    }
    const submitForm = (e) => {
      e.preventDefault();
      setShowSuccess(false); setShowFail(false); setErrors({});
      let method = "";
      let url = `${API_URL}movements`;
      if(newmovement.id){ // update existing -> PUT
        method = "PUT";
        url += `/${newmovement.id}`;
      }else{ // new movemente -> POST
        method = "POST";
      }
      authenticatedFecth(url, {
        method: method,
        body: JSON.stringify(newmovement)
      }, {
        "Content-Type": "application/json"
      }).then((response) => {
        if(response.ok){
          response.json().then((data) => {
            if(data.errors){
              setErrors(response.data.errors);
            }else{
              setShowSuccess(true);
            }
          });
        }else{
          setShowFail(true);
          response.json().then((json) => {
            setErrors(json);
          });
        }
      });
    };

    return (
      <>
      <Form id={props.id} onSubmit={(e) => submitForm(e)} className="mb-2">
        {movement ? 
          <Input type="hidden" name="id" value={movement?.id} /> : null
        }
        <FormGroup>
          <Label for="date">
            Date
          </Label>
          <input
            id="date"
            name="date"
            placeholder="Date"
            type="datetime-local"
            className={`form-control ${errors?.date? "is-invalid" : ""}`}
            value={newmovement.date.toISOString().replace(/\.\d+Z$/,"")}
            onChange={(e) => updateNewMovement({date: new Date(e.target.value)})}
          />
          <FormFeedback>{errors?.date}</FormFeedback>
        </FormGroup>
        <FormGroup>
            <Label for="amount">
                Amount
            </Label>
            <Input
                id="amount"
                name="abs_amount"
                placeholder="Amount"
                type="number"
                className={`${errors?.abs_amount? "is-invalid" : ""}`}
                value={newmovement.abs_amount}
                onChange={(e) => updateNewMovement({abs_amount: e.target.value})}
                />
        </FormGroup>
        <FormGroup>
          <Label for="description">Description</Label>
          <Input 
            id="description" 
            name="description" 
            placeholder="Description" 
            type="text" 
            className={`${errors?.description? "is-invalid" : ""}`}
            value={newmovement.description}
            onChange={(e) => updateNewMovement({description: e.target.value})}
            required
            />
        </FormGroup>
        <FormGroup>
          <Label for="category">Category</Label>
          <Input 
            id="category" 
            name="category" 
            type="select" 
            className={`${errors?.category? "is-invalid" : ""}`}
            onChange={(e) => updateNewMovement({category: e.target.value})}
            value={newmovement.category.id}>
            <option value="-1">Select category</option>
            {!categories || categories.length <= 0 ? (null) : (categories.map((cat) => {
              return <option key={cat.id} value={cat.id}>{cat.category}</option>
            }))}
          </Input>
        </FormGroup>
        <FormGroup>
          <Label for="category">Subcategory</Label>
          <Input 
            id="subcategory" 
            name="subcategory" 
            type="select" 
            className={`${errors?.subcategory? "is-invalid" : ""}`}
            onChange={(e) => updateNewMovement({subcategory: e.target.value})}
            value={newmovement.subcategory.id}>
            <option value="-1">Select subcategory</option>
            {subcategories.map((cat) => {
              return <option key={cat.id} value={cat.id}>{cat.subcategory}</option>
            })}
          </Input>
        </FormGroup>
        <div className="text-center">
          <Button color="secondary" onClick={(e) => {e.preventDefault(); props.cancel()}}>
            Cancel
          </Button>{' '}
          <Button color="primary" onClick={(e) => submitForm(e)}>
            Save
          </Button>
        </div>
      </Form>
      <Alert color="info" isOpen={showSuccess} toggle={() => setShowSuccess(false)}>Data has been saved!</Alert>
      <Alert color="danger" isOpen={showFail} toggle={() => setShowFail(false)}>An error occurred while saving data.</Alert>
      </>
    );
};

export default MovementForm;