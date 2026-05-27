import Form from "react-bootstrap/Form";
import Button from 'react-bootstrap/Button';
import Feedback from 'react-bootstrap/Feedback';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useState, useRef } from "react";
import { t, Trans } from "@lingui/macro";

const OrderForm = ({stocks, operations, onMutateOrder, editOrder, errors}) => {
    const insertOrder = () => {
        onMutateOrder(neworder, false);
    };
    const [neworder, setNeworder] = useState(editOrder ? {
        ...editOrder,
        date: editOrder.date ? String(editOrder.date).slice(0, 10) : "",
    } : {
        operation: 1,
        code: 0,
        account: "",
        date: "",
        stock: 0,
        price: 0,
        transaction_cost: 2,
        quantity: 0,
    });
    const orderCodeRef = useRef(null);
    const orderDateRef = useRef(null);
    const orderAccountRef = useRef(null);
    const orderStockRef = useRef(null);
    const orderOperationRef = useRef(null);
    const orderPriceRef = useRef(null);
    const orderQuantityRef = useRef(null);
    const orderTransactionCostRef = useRef(null);
    return <Form>
        {neworder.id ? <input type="hidden" name="id" value={neworder.id} /> : null}
        <Form.Group className="mb-1">
            <Form.Label htmlFor="code">
                {t`Code`}
            </Form.Label>
            <Form.Control
                id="code"
                name="code"
                className={`${errors?.code? "is-invalid" : ""}`}
                ref={orderCodeRef}
                onChange={(e) => setNeworder({...neworder, code: e.target.value})}
                value={neworder.code ?? ""}
                />
            <Feedback type='invalid'>{errors?.abs_amount?? ""}</Feedback>
        </Form.Group>
        <Form.Group className="mb-1">
            <Form.Label htmlFor="date">
                {t`Date`}
            </Form.Label>
            <Form.Control
                id="date"
                name="date"
                type="date"
                ref={orderDateRef}
                className={`form-control ${errors?.date? "is-invalid" : ""}`}
                value={neworder.date ?? ""}
                onChange={(e) => setNeworder({...neworder, date: e.target.value})}
            />
            <Feedback type='invalid'>{errors?.date}</Feedback>
        </Form.Group>
        <Form.Group className="mb-1">
            <Form.Label htmlFor="account">
                {t`Account no.`}
            </Form.Label>
            <Form.Control
                id="account"
                name="account"
                ref={orderAccountRef}
                className={`form-control ${errors?.account? "is-invalid" : ""}`}
                value={neworder.account ?? ""}
                onChange={(e) => setNeworder({...neworder, account: e.target.value})}
            />
        </Form.Group>
        <Row className="mb-1">
            <Col xs="8" className="mb-1">
                <Form.Label htmlFor="stock">
                    {t`Stock`}
                </Form.Label>
                <Form.Select
                    id="stock"
                    name="stock"
                    ref={orderStockRef}
                    type="select"
                    className={`${errors?.stock? "is-invalid" : ""}`}
                    value={neworder.stock ?? 0}
                    onChange={(e) => setNeworder({...neworder, stock: e.target.value})}
                    >
                        <option value={0}></option>
                    {!stocks || stocks.length <= 0 ? (null) : (stocks.map((stock) => {
                        return <option key={stock.id} value={stock.id}>{`${stock.symbol} - ${stock.name}`}</option>
                    }))}
                        <option value={-2}>{t`Add new stock`}</option>
                </Form.Select>
            </Col>
            <Col xs="4">
                <Form.Label htmlFor="operation">
                    {t`Operation`}
                </Form.Label>
                <Form.Select
                    id="operation"
                    name="operation"
                    ref={orderOperationRef}
                    value={neworder.operation ?? 0}
                    onChange={(e) => setNeworder({...neworder, operation: e.target.value})}
                    >
                    <option value={0}></option>
                    {!operations || operations.length <= 0 ? (null) : (operations.map((operation) => {
                    return <option key={operation.id} value={operation.id}>{operation.operation}</option>
                    }))}
                    </Form.Select>
            </Col>
        </Row>
        <Row className="mb-1">
            <Col xs="8">
                <Form.Label htmlFor="price">{t`Price`}</Form.Label>
                <Form.Control
                    id="price"
                    name="price"
                    ref={orderPriceRef}
                    type="number"
                    className={`${errors?.price? "is-invalid" : ""}`}
                    value={neworder.price ?? 0}
                    onChange={(e) => setNeworder({...neworder, price: e.target.value})}
                />
            </Col>
            <Col>
                <Form.Label htmlFor="quantity">{t`Quantity`}</Form.Label>
                <Form.Control
                    id="quantity"
                    name="quantity"
                    ref={orderQuantityRef}
                    type="number"
                    className={`${errors?.quantity? "is-invalid" : ""}`}
                    value={neworder.quantity ?? 0}
                    onChange={(e) => setNeworder({...neworder, quantity: e.target.value})}
                />
            </Col>
        </Row>
        <Row className="mb-1">
            <Col xs="8">
                <Form.Label htmlFor="transaction_cost">
                    {t`Transaction cost`}
                </Form.Label>
                <Form.Control
                    id="transaction_cost"
                    name="transaction_cost"
                    ref={orderTransactionCostRef}
                    type="number"
                    className={`form-control ${errors?.transaction_cost? "is-invalid" : ""}`}
                    value={neworder.transaction_cost ?? 0}
                    onChange={(e) => setNeworder({...neworder, transaction_cost: e.target.value})}
                />
            </Col>
        </Row>
        <Button className="mt-2" variant="secondary" type="button" onClick={()=>insertOrder()}>
            {editOrder ? <Trans>Update</Trans> : <Trans>Add</Trans>}
        </Button>
    </Form>
}

export default OrderForm;