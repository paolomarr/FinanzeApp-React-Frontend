import { Form, FormGroup, FormFeedback, Label, Input, Alert, Button } from "reactstrap";
import { useQuery } from "@tanstack/react-query";
import fetchCategories from "../queries/fetchCategories";
import { useState } from "react";
import { API_URL } from "../constants";

const MovementForm = (props) => {
    const movement = props.movement;
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
      category: 0,
      subcategory: 0,
    });
    const updateNewMovement = (update) => {
      setNewmovement({...newmovement, ...update});
    }
    const submitForm = (e) => {
      e.preventDefault();
      setShowSuccess(false); setShowFail(false); setErrors({});
      let method = "";
      if(newmovement.id){ // update existing -> PUT
        method = "PUT";
      }else{ // new movemente -> POST
        method = "POST";
      }
      console.log(`Sending data to ${API_URL}movement (${method})`);
      // fetch(`${API_URL}movement`, {
      //   method: method,
      //   data: new URLSearchParams(newmovement)
      // }).then((response) => {
      //   if(response.ok){
      //     if(response.data.errors){
      //       setErrors(response.data.errors);
      //     }else{
      //       setShowSuccess(true);
      //     }
      //   }else{
      //     setShowFail(true);
      //   }
      // });
    };

    return (
      <>
      <Form id={props.id} onSubmit={(e) => submitForm(e)}>
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
            onChange={(e) => updateNewMovement({category: e.target.value})}>
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
            onChange={(e) => updateNewMovement({subcategory: e.target.value})}>
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
      <Alert color="danger" isOpen={showFail} toggle={() => setShowFail(false)}>Data has been saved!</Alert>
      </>
    );
};

export default MovementForm;