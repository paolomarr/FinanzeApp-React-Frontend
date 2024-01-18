import React from "react";
import { Form, FormGroup, Input, Label, Button, Container } from "reactstrap";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import authenticate from "../queries/authenticate";

const LoginForm = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
        const username = event.target.elements.username.value;
        const password = event.target.elements.password.value;
        const results = await authenticate(username, password, null);
        results.json().then((jres) => {
            sessionStorage.setItem("authToken", jres.token); 
        });
        setUser(username)
    } catch (error) {
      setError(error);
    }
  };

  return (
    <Container>
      {error && <p>{error.message}</p>}
      {user && <Navigate to="/" replace={true} />}
      <Form onSubmit={(event) => handleSubmit(event)}>
        <FormGroup>
          <Label for="username" hidden>
            Username
          </Label>
          <Input
            id="username"
            name="username"
            placeholder="Username"
            type="username"
          />
        </FormGroup>
        <FormGroup>
          <Label for="password" hidden>
            Password
          </Label>
          <Input
            id="password"
            name="password"
            placeholder="Password"
            type="password"
          />
        </FormGroup>
        <Button>Submit</Button>
      </Form>
    </Container>
  );
};

export default LoginForm;
