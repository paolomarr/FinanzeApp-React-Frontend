import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import fetchTradinglog from "../queries/fetchTradinglog";
import { useNavigate } from "react-router-dom";
import LoadingDiv from "./LoadingDiv";
import { format } from "../_lib/format_locale";
import { useLingui } from "@lingui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCashRegister, faClockRotateLeft, faMoneyBillTrendUp, faRotate } from "@fortawesome/free-solid-svg-icons";
import ListGroup from "react-bootstrap/ListGroup";
import { Trans, t } from "@lingui/macro";
import Card from 'react-bootstrap/Card';
import Form from "react-bootstrap/Form";
import Button from 'react-bootstrap/Button';
import Feedback from 'react-bootstrap/Feedback';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useState } from "react";
import mutateOrder from "../queries/mutateOrder";

const defaultQueryRetryFunction = (failureCount, error, queryclient, navigate) => {
    if(error.message === "forbidden"){
        queryclient.cancelQueries();
        navigate("/login");
        return false;
    } else{ 
        return failureCount-1;
    }
};
const OrderInsertionForm = ({stocks, operations, onAddNewStock}) => {
    const [errors] = useState(null);
    const queryclient = useQueryClient();
    const orderMutation = useMutation({
        mutationFn: ({order, isDelete}) => {
            mutateOrder({order: order, _delete: isDelete});
        },
        onSuccess: (result, {order, isDelete}) => {
            queryclient.setQueryData(["orders"], (oldData) => {
                if(isDelete){ // DELETE
                }else if(order.id){// PUT
                }else { // POST
                    oldData.push(result);
                }
            });
        },
        onError: (error, variables, context) => {
            console.log(error);
            console.log(variables);
            console.log(context);
        }
    })
    const insertOrder = () => {
        orderMutation.mutate({order: neworder, isDelete: false});
    };
    const [neworder, setNeworder] = useState({
        operation: 1,
        code: 0,
        account: "",
        price: 0,
        transaction_cost: 2,
        quantity: 0,
    });
    return <Form>
        <Form.Group className="mb-1">
            <Form.Label htmlFor="code">
                {t`Code`}
            </Form.Label>
            <Form.Control
                id="code"
                name="code"
                className={`${errors?.code? "is-invalid" : ""}`}
                value={neworder.abs_amount}
                onChange={(e) => setNeworder({...neworder, code: e.target.value})}
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
                className={`form-control ${errors?.date? "is-invalid" : ""}`}
                // value={neworder.date ?? new Date()}
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
                className={`form-control ${errors?.account? "is-invalid" : ""}`}
                value={neworder.account}
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
                    type="select"
                    className={`${errors?.stock? "is-invalid" : ""}`}
                    onChange={(e) => setNeworder({...neworder, stock: e.target.value})}
                    value={neworder.stock}>
                        <option value={-1}></option>
                    {!stocks || stocks.length <= 0 ? (null) : (stocks.map((stock) => {
                        return <option key={stock.id} value={stock.id}>{`${stock.symbol} - ${stock.name}`}</option>
                    }))}
                        <option value={-2} onClick={() => onAddNewStock()}>{t`Add new stock`}</option>
                </Form.Select>
            </Col>
            <Col xs="4">
                <Form.Label htmlFor="operation">
                    {t`Operation`}
                </Form.Label>
                <Form.Select
                    id="operation"
                    name="operation"
                    >
                    <option value={1}></option>
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
                    type="number"
                    className={`${errors?.price? "is-invalid" : ""}`}
                    value={neworder.price}
                    onChange={(e) => setNeworder({...neworder, price: e.target.value})}
                />
            </Col>
            <Col>
                <Form.Label htmlFor="quantity">{t`Quantity`}</Form.Label>
                <Form.Control
                    id="quantity"
                    name="quantity"
                    type="number"
                    className={`${errors?.quantity? "is-invalid" : ""}`}
                    value={neworder.quantity}
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
                    type="number"
                    className={`form-control ${errors?.transaction_cost? "is-invalid" : ""}`}
                    value={neworder.transaction_cost}
                    onChange={(e) => setNeworder({...neworder, transaction_cost: e.target.value})}
                />
            </Col>
        </Row>
        <Button className="mt-2" variant="secondary" type="button" onClick={()=>insertOrder()}>
            <Trans>Add</Trans>
        </Button>
    </Form>
}
// const TradingHistory = ({orders, stocks, quotes}) => {
//     // merge orders and quotes
//     const tot_orders = orders.length;
//     let chartData = [];
//     for(let ordIdx = 0; ordIdx<tot_orders; ordIdx++){
//         let chartDataPoint = {};
//         if(ordIdx<tot_orders-1){
//             const curOrder = orders[ordIdx];
//             chartDataPoint.date = new Date()
//             let nextOrder = orders[ordIdx+1];
//             while(order.date == nextOrder.date){

//                 nextOrder = orders[++ordIdx];
//             }

//         }
//     };
//     return <></>
// };
const TradingStats = ({orders, stocks, update}) => {
    const {i18n} = useLingui();
    let stats = {};
    for (const order of orders) {
        const stock = stocks.find((stock) => stock.id === order.stock);
        if(stock == null) continue; // raise a flag??
        if(stats[stock.id] === undefined){
            stats[stock.id] = {count: 0, purhcaseValue: 0, stock: stock};
        }
        stats[stock.id].count += order.quantity;
        stats[stock.id].purhcaseValue += (order.quantity * order.price); // TODO: add transaction cost?
    }
    for (const iterstock in stats) { 
        const statItem = stats[iterstock];
        const stock = stocks.find((stock) => stock.id === parseInt(iterstock));
        const regular_market_price = parseFloat(stock.regular_market_price);
        stats[iterstock].currentValue = regular_market_price * statItem.count;
        stats[iterstock].lastUpdate = new Date(stock.last_price_update);
    }
    return <Card className="shadow-lg">
        <Card.Body>
            <Card.Title>
                <div className="d-flex align-items-center">
                    <Trans>Your current trading assets</Trans>{' '}<FontAwesomeIcon icon={faRotate} className="text-secondary ms-auto" onClick={()=>update()}/>
                </div>
            </Card.Title>
            <ListGroup variant="flush">{ Object.keys(stats).map((stockid) => {
            const stockData = stats[stockid];
            const curVal = parseFloat(stockData.currentValue).toFixed(2);
            const purVal = parseFloat(stockData.purhcaseValue).toFixed(2);
            const gainVal = parseFloat(100*(curVal - purVal)/purVal).toFixed(1);
            const gainClass = gainVal > 0 ? "gain" : "loss";
            const gainSign = gainVal > 0 ? "+" : "";
            return <ListGroup.Item key={`tradingStatsItem_${stockid}`}>
                    <div className="d-flex mt-2 align-items-baseline">
                        <div className="fs-4 pe-2">{stockData.stock.symbol}</div>
                        <div className="pe-2 small">{' '}&times;{stockData.count}</div>
                        <div className={`fw-bold trading-gain ms-auto fs-4 ${gainClass}`}>{gainSign}{gainVal}{'%'}</div>
                    </div>
                    <div className="small text-secondary">{stockData.stock.name}</div>
                    <div className="d-flex m-2 align-items-end">
                        <div className="pe-2"><FontAwesomeIcon icon={faCashRegister} />{' '}{purVal}{"€"}<br />
                            <FontAwesomeIcon icon={faMoneyBillTrendUp} />{" "}{curVal}{"€"}
                        </div>
                        <div className="small text-secondary ms-auto">
                            <FontAwesomeIcon icon={faClockRotateLeft} />{' '}{format(stockData.lastUpdate, i18n)}
                        </div>
                    </div>
                </ListGroup.Item>
                })}
            </ListGroup>
        </Card.Body>
    </Card>
};
const Trading = () => {
    const queryclient = useQueryClient();
    const navigate = useNavigate();
    const [stockQuery, orderQuery, quotesQuery, operations] = useQueries({
        queries: [
            {queryKey: ["stocks"], queryFn: fetchTradinglog, retry: (failureCount, error) => defaultQueryRetryFunction(failureCount, error, queryclient, navigate)},
            {queryKey: ["orders"], queryFn: fetchTradinglog, retry: (failureCount, error) => defaultQueryRetryFunction(failureCount, error, queryclient, navigate)},
            {queryKey: ["quotes"], queryFn: fetchTradinglog, retry: (failureCount, error) => defaultQueryRetryFunction(failureCount, error, queryclient, navigate)},
            {queryKey: ["operations"], queryFn: fetchTradinglog, retry: (failureCount, error) => defaultQueryRetryFunction(failureCount, error, queryclient, navigate)},
        ]
    });
    if(stockQuery.isLoading || orderQuery.isLoading || quotesQuery.isLoading || operations.isLoading){
        return <LoadingDiv />
    }
    if(stockQuery.isError || orderQuery.isError || quotesQuery.isError || operations.isError){
        return <div>Error</div>
    }
    return <div className="container-sm">
        <div className="my-2">
            <Row className="justify-content-center" md={2}>
                <Col>
                    <Card className="shadow-lg" bg="primary">
                        <Card.Body>
                            <Card.Title><Trans>Record a new order</Trans></Card.Title>
                            <OrderInsertionForm operations={operations.data} stocks={stockQuery.data} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
        <div className="row justify-content-center">
            <div className="col-md-8">
                <TradingStats orders={orderQuery.data} stocks={stockQuery.data} />
            </div>
        </div>
        <div className="row jusftify-content-center">
            <div className="col-md-8">
                {/* <TradingHistory orders={orderQuery.data.toReversed()} stocks={stockQuery.data} quotes={quotesQuery.data} /> */}
            </div>
        </div>
    </div>
};

export default Trading;