import React from "react";
import { Form, FormGroup, Input, Label, Button, Container, Row, Col } from "reactstrap";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import authenticate from "../queries/authenticate";
import { msg, Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";

const LoginForm = ({logout}) => {
  const { _ } = useLingui();
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
            setUser(username);
        });
    } catch (error) {
      setError(error);
    }
  };
  if(logout){
    sessionStorage.removeItem("authToken");
    // setUser(null);
    // setError(null);
  }

  return (
    <Container>
      {user && <Navigate to="/" replace={true} />}
      <Row className="justify-content-center">
        <Col className="col-md-6 col-lg-4">
        {error && <p>{error.message}</p>}
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col className="col-md-6 col-lg-4">
          <Form onSubmit={(event) => handleSubmit(event)}>
            <FormGroup>
              <Label for="username" hidden>
                <Trans>Username</Trans>
              </Label>
              <Input
                id="username"
                name="username"
                placeholder={_(msg`Username`)}
                type="username"
              />
            </FormGroup>
            <FormGroup>
              <Label for="password" hidden>
                <Trans>Password</Trans>
              </Label>
              <Input
                id="password"
                name="password"
                placeholder={_(msg`Password`)}
                type="password"
              />
            </FormGroup>
            <Button><Trans id="login_form_submit">Submit</Trans></Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginForm;
