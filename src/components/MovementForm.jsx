import { Form, FormGroup, Label, Input } from "reactstrap";

const MovementForm = ({movement}) => {
    return (
      <Form>
        {movement ? 
          <Input type="hidden" name="id" value={movement?.id} /> : null
        }
        <FormGroup>
          <Label for="date">
            Date
          </Label>
          <Input
            id="date"
            name="date"
            placeholder="Date"
            type="date"
            value={movement? movement.date : new Date()}
          />
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
                value={movement? movement.abs_amount : 0}
                />
        </FormGroup>
      </Form>
    );
};

export default MovementForm;