import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import fetchTradinglog from "../queries/fetchTradinglog";
import { useNavigate } from "react-router-dom";
import LoadingDiv from "./LoadingDiv";
import { format, format_currency } from "../_lib/format_locale";
import { useLingui } from "@lingui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBasketShopping, faCashRegister, faClockRotateLeft, faHandHoldingDollar, faMoneyBillTrendUp, faQuestion, faRotate, faScaleUnbalanced } from "@fortawesome/free-solid-svg-icons";
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
import mutateQuotes from "../queries/mutateQuotes";

const defaultQueryRetryFunction = (failureCount, error, queryclient, navigate) => {
    if(error.message === "forbidden"){
        queryclient.cancelQueries();
        navigate("/login");
        return false;
    } else{ 
        return failureCount-1;
    }
};
const OrderInsertionForm = ({stocks, operations, onMutateOrder}) => {
    const [errors] = useState(null);
    const insertOrder = () => {
        onMutateOrder(neworder, false);
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
    const TAX_RATE = 0.21;
    const getValueAfterTax = (value) => value < 0 ? value : (1-TAX_RATE)*value;
    let stats = {
        stocks: {},
        totalTransactions: 0.0,
        totalCurrent: 0.0,
        totalNetGain: 0.0,
        totalCosts: 0.0,
        grossGain: function(){ return parseFloat(this.totalCurrent-this.totalTransactions).toFixed(2) },
        netGain: function(){ return parseFloat(this.totalNetGain).toFixed(2) },
        grossPercent: function(){ 
            if(this.totalTransactions==0) return 0.00;
            return parseFloat(100*this.grossGain()/this.totalTransactions).toFixed(2)
        },
        netPercent: function(){ 
            if(this.totalTransactions==0) return 0.00;
            return parseFloat(100*this.totalNetGain/this.totalTransactions).toFixed(1)
        },
    };
    for (const order of orders) {
        const stock = stocks.find((stock) => stock.id === order.stock);
        if(stock == null) continue; // raise a flag??
        if(stats.stocks[stock.id] === undefined){
            stats.stocks[stock.id] = {count: 0, purhcaseValue: 0, stock: stock};
        }
        stats.stocks[stock.id].count += order.quantity;
        const orderAmount = order.quantity * order.price;
        stats.stocks[stock.id].purhcaseValue += orderAmount; // TODO: add transaction cost?
        stats.totalTransactions += orderAmount;
        stats.totalCosts += order.transaction_cost;
    }
    for (const iterstock in stats.stocks) { 
        const statItem = stats.stocks[iterstock];
        const stock = stocks.find((stock) => stock.id === parseInt(iterstock));
        const regular_market_price = parseFloat(stock.regular_market_price);
        const stockCurVal = regular_market_price * statItem.count;
        stats.stocks[iterstock].currentValue = stockCurVal;
        stats.stocks[iterstock].lastUpdate = new Date(stock.last_price_update);
        stats.totalCurrent += stockCurVal;
        stats.totalNetGain += getValueAfterTax(stockCurVal-stats.stocks[iterstock].purhcaseValue);
    }
    const statsGainClass = stats.netGain()>0 ? "text-earnings" : "text-expenses";
    const statsGainSign = stats.netGain()>=0 ? "+" : "-";
    const [rotateSpinning, setRotateSpinning] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const showDetailsLinkStr = showDetails ? t`Hide details` : t`Show details`;
    return <Card className="shadow-lg">
        <Card.Body>
            <Card.Title>
                <div className="d-flex align-items-center">
                    <Trans>Your current trading stats</Trans>{' '}
                    <FontAwesomeIcon icon={faRotate} 
                        spin={rotateSpinning} 
                        className="text-secondary ms-auto" 
                        onClick={()=>{setRotateSpinning(true); update(); } }/>
                </div>
            </Card.Title>
            <div className="row stats-summary align-items-center justify-content-center">
                <div className="col-5 col-md-3 text-center">
                    <div className="fs-4 bold"><FontAwesomeIcon icon={faCashRegister} /> {format_currency(stats.totalTransactions)}</div>
                    <div className="small text-secondary">Commissions {format_currency(stats.totalCosts)}</div>
                    <div className="fs-4 bold"><FontAwesomeIcon icon={faMoneyBillTrendUp}/> {format_currency(stats.totalCurrent)}</div>
                </div>
                <div className="col-5 col-md-3 text-center">
                    <div className={`fs-1 bold ${statsGainClass}`}>
                        <FontAwesomeIcon icon={faScaleUnbalanced} /> {statsGainSign}{stats.netPercent()}%
                    </div>
                </div>                
            </div>
            <div className="row">
                <div className="col text-center">
                    <a href="#detailsBlock" onClick={()=>setShowDetails(!showDetails)}>
                        {showDetailsLinkStr}
                    </a>
                </div>
            </div>
            <div className="row">
            { showDetails ?
                <ListGroup variant="flush" id="detailsBlock">{ Object.keys(stats.stocks).map((stockid) => {
                const stockData = stats.stocks[stockid];
                const curVal = format_currency(stockData.currentValue);
                const purVal = format_currency(stockData.purhcaseValue);
                const netGain = getValueAfterTax(stockData.currentValue - stockData.purhcaseValue);
                const gainVal = parseFloat(100*(netGain)/stockData.purhcaseValue).toFixed(1);
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
                            <div className="pe-2"><FontAwesomeIcon icon={faCashRegister} />{' '}{purVal}<br />
                                <FontAwesomeIcon icon={faMoneyBillTrendUp} />{" "}{curVal}
                            </div>
                            <div className="small text-secondary ms-auto">
                                <FontAwesomeIcon icon={faClockRotateLeft} />{' '}{format(stockData.lastUpdate, i18n)}
                            </div>
                        </div>
                    </ListGroup.Item>
                    })}
                </ListGroup>
            :null}
            </div>
        </Card.Body>
    </Card>
};
const TradingOrdersListComponent = ({orders, stocks, operations}) => {
    const {i18n} = useLingui();
    return <Card className="shadow-lg">
        <Card.Body>
            <Card.Title>
                <div className="d-flex align-items-center">
                    <Trans>Your past orders</Trans>
                </div>
            </Card.Title>
            <ListGroup variant="flush">
                { orders.map((order) => {
                    const dateStr = format(order.date, i18n);
                    const operation = operations.find((item)=>item.id === order.operation);
                    let operationIcon = faQuestion;
                    let operationClass = "";
                    let gainSign = ""
                    if(operation){
                        if(operation.operation === "BUY"){
                            operationIcon = faBasketShopping;
                            operationClass = "text-expenses";
                            gainSign = "-";
                        }else if(operation.operation === "SELL"){
                            operationIcon = faHandHoldingDollar;
                            operationClass = "text-earnings";
                        }
                    }
                    const stock = stocks.find((stock)=>stock.id === order.stock);
                    const stockSymStr = stock?.symbol?? "?";
                    const stockNameStr = stock?.name?? "?";
                    return <ListGroup.Item key={`order_${order.id}`}>
                        <div className={`d-flex mt-2 align-items-baseline ${operationClass}`}>
                            <div className="pe-2">{dateStr}</div>
                            <div className="pe-2"><FontAwesomeIcon icon={operationIcon} /></div>
                        </div>
                        <div className={`d-flex mt-2 align-items-baseline ${operationClass}`}>
                            <div className="fs-4 pe-2">{stockSymStr}</div>
                            <div className="pe-2 small">{' '}{format_currency(order.price)}&times;{order.quantity}</div>
                            <div className="fw-bold trading-gain ms-auto fs-4">{gainSign}{parseFloat(order.quantity * order.price).toFixed(2)}</div>
                        </div>
                        <div className="small text-secondary">{stockNameStr}</div>
                    </ListGroup.Item>
                })}
            </ListGroup>
        </Card.Body>
    </Card>
};
const Trading = () => {
    const queryclient = useQueryClient();
    const navigate = useNavigate();
    const [showOrders, setShowOrders] = useState(false);
    const showOrdersLinkStr = showOrders ? t`Hide orders` : t`Show orders`;
    const [stockQuery, orderQuery, quotesQuery, operations] = useQueries({
        queries: [
            {queryKey: ["stocks"], queryFn: fetchTradinglog, retry: (failureCount, error) => defaultQueryRetryFunction(failureCount, error, queryclient, navigate)},
            {queryKey: ["orders"], queryFn: fetchTradinglog, retry: (failureCount, error) => defaultQueryRetryFunction(failureCount, error, queryclient, navigate)},
            {queryKey: ["quotes"], queryFn: fetchTradinglog, retry: (failureCount, error) => defaultQueryRetryFunction(failureCount, error, queryclient, navigate)},
            {queryKey: ["operations"], queryFn: fetchTradinglog, retry: (failureCount, error) => defaultQueryRetryFunction(failureCount, error, queryclient, navigate)},
        ]
    });
    const [statsKey, setStatsKey] = useState(0);
    const queryClient = useQueryClient();
    const orderMutation = useMutation({
        mutationFn: ({order, _delete}) => {
            return mutateOrder({order:order, _delete: _delete});
        },
        onSuccess: (result, {order, _delete}) => {
            let mutandumIndex;
            if(order.id && result.id){ // DELETE or PUT
                mutandumIndex = orderQuery.data.findIndex((order)=> order.id === result.id);
                if(_delete){
                    queryClient.setQueryData(["orders"], (oldOrders)=>{
                        oldOrders.splice(mutandumIndex, 1);
                        return oldOrders;
                    });
                }else{
                    queryClient.setQueryData(["orders"], (oldOrders)=>{
                        oldOrders.splice(mutandumIndex, 1, result);
                        return oldOrders;
                    });
                }
            }else{ // POST
                queryClient.setQueryData(["orders"], (oldOrders)=>{
                    oldOrders.unshift(result);
                    return oldOrders;
                });
            }
        }
    });
    const quoteMutation = useMutation({
        mutationFn: ({stocks}) => { // `stocks` value must be a list of stock symbols
            return mutateQuotes({quotes: {symbols: stocks}})
        },
        onSuccess: ({stocks, quotes, errors}) => {
            if(!errors){
                queryClient.setQueryData(["quotes"], (oldQuotes)=>{
                    oldQuotes += quotes;
                    return oldQuotes;
                });
                queryClient.setQueryData(["stocks"], (oldStocks)=>{
                    stocks.map((newStock)=> {
                        const oldStockToUpdateIndex = oldStocks.findIndex((s)=> newStock.id === s.id);
                        if(oldStockToUpdateIndex>=0){
                            oldStocks.splice(oldStockToUpdateIndex, 1, oldStocks[oldStockToUpdateIndex]);
                        }
                    });
                    return oldStocks;
                })
            }// else ??
            setStatsKey(1+statsKey); // this stops the rotate icon spinning
        },
        onError: () => {
            setStatsKey(1+statsKey);
        },
    })
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
                            <OrderInsertionForm operations={operations.data} stocks={stockQuery.data} 
                                onMutateOrder={(neworder, _delete) => orderMutation.mutate({order:neworder, _delete:_delete})}
                                />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
        <div className="row justify-content-center">
            <div className="col-md-8">
                <TradingStats 
                    key={statsKey}
                    orders={orderQuery.data} 
                    stocks={stockQuery.data} 
                    update={()=>quoteMutation.mutate({stocks:stockQuery.data.map((stock)=>stock.id)})}
                    />
            </div>
        </div>
        <div className="row justify-content-center">
            <div className="col-md-8">
                {/* <TradingHistory orders={orderQuery.data.toReversed()} stocks={stockQuery.data} quotes={quotesQuery.data} /> */}
            </div>
        </div>
        <div className="row justify-content-center">
            <div className="col-md-8 text-center" id="#ordersBlock">
                <a href="#ordersBlock" onClick={()=>setShowOrders(!showOrders)}>{showOrdersLinkStr}</a>
            </div>
        </div>
        <div className="row justify-content-center">
            <div className="col-md-8">
            {showOrders ?
                <TradingOrdersListComponent orders={orderQuery.data} stocks={stockQuery.data} operations={operations.data}/>
                : null
            }
            </div>
        </div>
    </div>
};

export default Trading;