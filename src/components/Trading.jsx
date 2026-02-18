import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import fetchTradinglog from "../queries/fetchTradinglog";
import { useNavigate } from "react-router-dom";
import LoadingDiv from "./LoadingDiv";
import { format, format_currency } from "../_lib/format_locale";
import { useLingui } from "@lingui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBasketShopping, faCashRegister, faClockRotateLeft, faHandHoldingDollar, faMoneyBillTrendUp, faPenSquare, faQuestion, faRotate, faScaleUnbalanced, faBuildingColumns } from "@fortawesome/free-solid-svg-icons";
import ListGroup from "react-bootstrap/ListGroup";
import { Trans, t } from "@lingui/macro";
import Card from 'react-bootstrap/Card';
import { useState } from "react";
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';
import mutateOrder from "../queries/mutateOrder";
import mutateQuotes from "../queries/mutateQuotes";
import FixedBottomRightButton from "./FixedBottomRightButton";
import OrderModal from "./OrderModal";

const TAX_RATE = 0.26;
const getValueAfterTax = (value) => value < 0 ? value : (1-TAX_RATE)*value;

const defaultQueryRetryFunction = (failureCount, error, queryclient, navigate) => {
    if(error.message === "forbidden"){
        queryclient.cancelQueries();
        navigate("/login");
        return false;
    } else{ 
        return failureCount-1;
    }
};

const PortfolioTimeSeriesChart = ({orders, stocks, quotes, operations}) => {
    const {i18n} = useLingui();
    
    // Process data to create time series
    const processPortfolioData = () => {
        if (!quotes || !orders || !stocks || !operations) return [];

        const portfolioData = [];
        // Quotes come date-descending sorted by default
        const sortedQuotes = quotes.sort((a, b) => new Date(a.close_timestamp) - new Date(b.close_timestamp));
        const allSymbols = [...new Set(stocks.map(s => s.symbol))];
        class CounterValueData {
            constructor(date, symbols=[]) {
                this.date = date;
                this.countervalues = {};
                symbols.forEach(symbol => {
                    this.countervalues[symbol] = 0;
                });
                this.investedTotal = 1; // to avoid division by zero
            }
            setCountervalueForStock = function (symbol, value) {
                this.countervalues[symbol] = value;
            };
            gain = function () {
                return (this.countervalueTotal() - this.investedTotal) / this.investedTotal;
            };
            netGain = function () {
                return getValueAfterTax(this.gain());
            }
            setInvestedTotalFromOrders = function (orders) {
                this.investedTotal = 0;
                orders
                    .filter(order => new Date(order.date).getTime() <= this.date.getTime())
                    .forEach(order => {
                        const operation = operations.find(op => op.id === order.operation);
                        const multiplier = operation?.operation === "SELL" ? -1 : 1;
                        this.investedTotal += order.quantity * order.price * multiplier;
                });
            };
            countervalueTotal = function () {
                let _cvtotal = 0;
                for (let symbol in this.countervalues) {
                    _cvtotal += this.countervalues[symbol];
                }
                return _cvtotal;
            }
            dump = function () {
                return {
                    date: this.date,
                    ...this.countervalues,
                    countervalue: this.countervalueTotal(),
                    invested: this.investedTotal,
                    gain: this.gain(),
                    netGain: this.netGain()
                };
            };
        };
        let counterValueData = new CounterValueData(null, allSymbols);
        sortedQuotes.forEach(quote => {
            const quoteDate = new Date(quote.close_timestamp);

            if(!counterValueData.date){
                counterValueData.date = quoteDate;
            }
            if(counterValueData.date.getTime() != quoteDate.getTime()){
                counterValueData.setInvestedTotalFromOrders(orders);
                portfolioData.push(counterValueData.dump());
                counterValueData.date = quoteDate;
                counterValueData.investedTotal = 0;
            }

            const stock = stocks.find(s => s.id === quote.stock);
            // find all orders up to quote's date, for the current stock
            const relevantOrders = orders.filter(order => 
                order.stock === stock.id && 
                new Date(order.date).getTime() <= quoteDate.getTime()
            );
            // calculate quantity owned of the current stock
            let ownedQuantity = 0;
            relevantOrders.forEach(order => {
                const operation = operations.find(op => op.id === order.operation);
                const multiplier = operation?.operation === "SELL" ? -1 : 1;
                ownedQuantity += order.quantity * multiplier;
            });
            // if we own shares, get the price as of this date
            const counterValueForStock = ownedQuantity * quote.close_val;
            counterValueData.setCountervalueForStock(stock.symbol, counterValueForStock);
            
        });
        
        return portfolioData
    };
    
    const chartData = processPortfolioData();
    
    // Generate colors for each stock
    const colors = [
        '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
        '#ff00ff', '#00ffff', '#ff0000', '#0000ff', '#ffff00'
    ];
    
    const formatTooltip = (value, name) => {
        return [format_currency(value), name];
    };
    
    const formatXAxisLabel = (tickItem) => {
        return format(new Date(tickItem), i18n, {dateStyle: 'short'});
    };
    const toPercent = (decimal) => `${(decimal * 100).toFixed(0)}%`;
    
    if (chartData.length === 0) {
        return (
            <Card className="shadow-lg">
                <Card.Body>
                    <Card.Title><Trans>Portfolio Value Over Time</Trans></Card.Title>
                    <div className="text-center text-muted p-4">
                        <Trans>No portfolio data available</Trans>
                    </div>
                </Card.Body>
            </Card>
        );
    }
    // Get unique stock symbols that appear in the data
    const stockSymbols = [];
    // stockSymbols.push(["invested"]);
    Object.keys(chartData[0]).filter(key => 
        key !== 'date' && key !== 'invested' && key != 'countervalue' && key !== 'gain' && key !== 'netGain'
    ).forEach(key => stockSymbols.push(key));
    
    return (
        <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData} margin={{left:0, right:0}}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 8}}
                    tickFormatter={formatXAxisLabel}
                />
                <YAxis 
                    yAxisId="left"
                    tick={{fontSize: 8}}
                    label={{value: "Countervalue [€]", angle: -90, position: "insideLeft", offset: 20, fontSize: 10}}
                    tickFormatter={(value) => format_currency(value, '', 0)} 
                />
                <YAxis
                    yAxisId="right"
                    tick={{fontSize: 8}}
                    orientation="right"
                    label={{value: "Net % Gain", angle: -90, position: "insideRight", offset: 20, fontSize: 10}}
                    tickFormatter={toPercent}
                />
                <Tooltip 
                    formatter={formatTooltip}
                    labelFormatter={(label) => format(new Date(label), i18n)}
                />
                {stockSymbols.map((symbol, index) => (
                    <Area
                        key={symbol}
                        type="monotone"
                        dataKey={symbol}
                        stackId="1"
                        stroke={colors[index % colors.length]}
                        fill={colors[index % colors.length]}
                        fillOpacity={0.6}
                        yAxisId="left"
                    />
                ))}
                <Line type="step" dataKey="netGain" yAxisId="right" dot={false} strokeWidth={2} />

            </ComposedChart>
        </ResponsiveContainer>
    );
};

const TradingStats = ({orders, stocks, operations, quotes, update}) => {
    const {i18n} = useLingui();
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
        let signedQuantity = order.quantity;
        const orderDirection = operations.find((op) => op.id === order.operation)?.operation;
        if(orderDirection === "SELL")   signedQuantity *= -1;
        const orderAmount = signedQuantity * order.price;
        stats.stocks[stock.id].count += signedQuantity;
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
        const lpu_date = new Date(stock.last_price_update);
        stats.stocks[iterstock].lastUpdate = lpu_date;
        stats.lastCurrentPriceUpdate = stats.lastCurrentPriceUpdate ? Math.max(stats.lastCurrentPriceUpdate, lpu_date) : lpu_date;
        stats.totalCurrent += stockCurVal;
        stats.totalNetGain += getValueAfterTax(stockCurVal-stats.stocks[iterstock].purhcaseValue);
    }
    const statsGainClass = stats.netGain()>0 ? "text-earnings" : "text-expenses";
    const statsGainSign = stats.netGain()>=0 ? "+" : "-";
    const [rotateSpinning, setRotateSpinning] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const showDetailsLinkStr = showDetails ? t`Hide details` : t`Show details`;
    return <>
                <div className="row align-items-center text-center">
                    <div className="col-12 col-md-auto">
                        <Trans>Your current trading stats</Trans>{' '}
                    </div>
                    <div className="col-12 col-md-auto">
                        <span className="small text-secondary"><Trans>Updated</Trans>{' '}{format(stats.lastCurrentPriceUpdate, i18n)}</span>{' '}
                        <FontAwesomeIcon icon={faRotate}
                            spin={rotateSpinning}
                            className="text-secondary ms-auto"
                            onClick={()=>{setRotateSpinning(true); update(); } }/>
                    </div>
                </div>
            <div className="row stats-summary align-items-center justify-content-center">
                <div className="col-12 col-md-4 d-flex px-4">
                    <div className="flex-grow-1 flex-md-grow-0 bold"><FontAwesomeIcon icon={faCashRegister} />{' '}<Trans>Purchased:</Trans> </div>
                    <div>{format_currency(stats.totalTransactions)}</div>
                </div>
                <div className="col-12 col-md-4 d-flex px-4">
                    <div className="flex-grow-1 flex-md-grow-0 text-secondary"><FontAwesomeIcon icon={faBuildingColumns} />{' '}<Trans>Commissions:</Trans> </div>
                    <div>{format_currency(stats.totalCosts)}</div>
                </div>
                <div className="col-12 col-md-4 d-flex px-4">
                    <div className="flex-grow-1 flex-md-grow-0 bold"><FontAwesomeIcon icon={faMoneyBillTrendUp}/>{' '}<Trans>Current value:</Trans> </div>
                    <div>{format_currency(stats.totalCurrent)}</div>
                </div>
                <div className="col-12 col-md-3 ">
                    <div className={`fw-bold ${statsGainClass} text-center`}>
                        <FontAwesomeIcon icon={faScaleUnbalanced} />{' '}<Trans>Net gain</Trans> {statsGainSign}{stats.netPercent()}%
                    </div>
                </div>                
            </div>
            <div className="row align-items-center justify-content-center">
                <div className="col-md-12 mx-0 px-0 mt-3">
                    <PortfolioTimeSeriesChart 
                        orders={orders} 
                        stocks={stocks} 
                        quotes={quotes} 
                        operations={operations}
                    />
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
                <ListGroup variant="flush" id="detailsBlock">{ 
                    Object.keys(stats.stocks)
                        .filter((stockid)=>stats.stocks[stockid].count>0)
                        .map((stockid) => {
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
            </>
};
const TradingOrdersListComponent = ({orders, stocks, operations, onOrderEditClicked}) => {
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
                            <div className="ms-auto"><FontAwesomeIcon icon={faPenSquare} onClick={()=>onOrderEditClicked(order)} /></div>
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
    const [showModal, setShowModal] = useState({
        show: false,
        errors: null,
    });
    const [stockQuery, orderQuery, quotesQuery, operationsQuery] = useQueries({
        queries: [
            {queryKey: ["stocks"], queryFn: fetchTradinglog, retry: (failureCount, error) => defaultQueryRetryFunction(failureCount, error, queryclient, navigate)},
            {queryKey: ["orders"], queryFn: fetchTradinglog, retry: (failureCount, error) => defaultQueryRetryFunction(failureCount, error, queryclient, navigate)},
            {queryKey: ["quotes"], queryFn: fetchTradinglog, retry: (failureCount, error) => defaultQueryRetryFunction(failureCount, error, queryclient, navigate)},
            {queryKey: ["operations"], queryFn: fetchTradinglog, retry: (failureCount, error) => defaultQueryRetryFunction(failureCount, error, queryclient, navigate)},
        ]
    });
    const [editOrder, setEditOrder] = useState(null);
    const [statsKey, setStatsKey] = useState(0);
    const queryClient = useQueryClient();
    
    const toggleModal = () => {
        const show = !showModal.show;
        setShowModal({...showModal, show: show});
        if (!show) {
            setEditOrder(null); // Clear edit order when closing modal
        }
    };
    const orderMutation = useMutation({
        mutationFn: ({order, _delete}) => {
            setShowModal({...showModal, errors: null});
            return mutateOrder({order:order, _delete: _delete});
        },
        onSuccess: (result, {order, _delete}) => {
            setShowModal({...showModal, show: false, errors: {}});
            setEditOrder(null);
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
        },
        onError: (error, variables, context) => {
            console.log(variables);
            console.log(context);
            setShowModal({...showModal, errors: error.cause});
        }
    });
    const quoteMutation = useMutation({
        mutationFn: ({stocks}) => { // `stocks` value must be a list of stock symbols
            return mutateQuotes({quotes: {symbols: stocks}})
        },
        onSuccess: ({errors}) => {
            if(!errors){
                queryClient.invalidateQueries(["stocks", "quotes"]);
            }// else ??
            setStatsKey(1+statsKey); // this stops the rotate icon spinning
        },
        onError: () => {
            setStatsKey(1+statsKey);
        },
    })
    const handleOrderEditClicked = (order) => {
        setEditOrder(order);
        setShowModal({show: true, errors: null});
    };
    if(stockQuery.isLoading || orderQuery.isLoading || quotesQuery.isLoading || operationsQuery.isLoading){
        return <LoadingDiv />
    }
    if(stockQuery.isError || orderQuery.isError || quotesQuery.isError || operationsQuery.isError){
        return <div>Error</div>
    }
    return <div className="container-sm">
        <div className="row justify-content-center">
            <div className="col-md-8">
                { orderQuery.data.length > 0 ?
                <TradingStats 
                    key={statsKey}
                    orders={orderQuery.data} 
                    stocks={stockQuery.data}
                    operations={operationsQuery.data}
                    quotes={quotesQuery.data}
                    update={()=>quoteMutation.mutate({stocks:stockQuery.data.map((stock)=>stock.id)})}
                    />
                : null}
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
                <TradingOrdersListComponent orders={orderQuery.data} 
                    stocks={stockQuery.data} 
                    operations={operationsQuery.data} 
                    onOrderEditClicked={handleOrderEditClicked}
                    
                />
                : null
            }
            </div>
        </div>
        
        <FixedBottomRightButton onClick={() => setShowModal({show: true, errors: null})} />
        
        <OrderModal 
            showModal={showModal}
            toggleModal={toggleModal} 
            onDataReady={(order, _delete) => orderMutation.mutate({order: order, _delete: _delete})}
            operations={operationsQuery.data}
            stocks={stockQuery.data}
            editOrder={editOrder}
        />
    </div>
};

export default Trading;
