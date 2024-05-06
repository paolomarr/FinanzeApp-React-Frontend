import { sub } from "date-fns";
import {format} from '../_lib/format_locale';
import ListGroup from 'react-bootstrap/ListGroup';
import Accordion from 'react-bootstrap/Accordion';
import Form from "react-bootstrap/Form";
import { useLingui } from "@lingui/react";
import { format_ISO_date } from "../_lib/format_locale";
import { useQuery } from "@tanstack/react-query";
import fetchMovements from "../queries/fetchMovements";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Trans, t } from "@lingui/macro";
import { useState } from "react";
import LoadingDiv from "./LoadingDiv";
import Button from 'react-bootstrap/Button';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import CloseButton from "react-bootstrap/CloseButton";
import Card from "react-bootstrap/Card";
import Feedback from "react-bootstrap/Feedback";

const samples = [
    {date: sub(new Date(), {days: 2}), abs_amount: 100, description: "sample_0_a"},
    {date: sub(new Date(), {days: 2}), abs_amount: 1000, description: "sample_0_b very very very long description that possibly spans more than one single line"},
    {date: sub(new Date(), {days: 2}), abs_amount: 500, description: "sample_0_c"},
    {date: sub(new Date(), {days: 22}), abs_amount: 140, description: "sample_1_a"},
    {date: sub(new Date(), {days: 22}), abs_amount: 1400, description: "sample_1_b"},
    {date: sub(new Date(), {days: 22}), abs_amount: 540, description: "sample_1_c"},
    {date: sub(new Date(), {months: 1, days: 10}), abs_amount: 300, description: "sample_2_a"},
    {date: sub(new Date(), {months: 1, days: 10}), abs_amount: 3000, description: "sample_2_b"},
    {date: sub(new Date(), {months: 1, days: 10}), abs_amount: 300, description: "sample_2_c"},
];
const groupByDate = (movements) => {
    let grouped = {};
    for (const movement of movements) {
        const mdate = new Date(movement.date);
        if(mdate in grouped){
            grouped[mdate].entries.push(movement);
        }else{
            grouped[mdate] = {date: mdate, entries: [movement]};
        }
    }
    let output = [];
    Object.keys(grouped).toSorted((a,b)=>b-a).map((key) => {
        return output.push({date: key, entries: grouped[key].entries});
    })
    return output;
}
const AssetsHistoryList = ({assets}) => {
    const {i18n} = useLingui();
    const grouped = groupByDate(assets);
    
    return <Accordion alwaysOpen flush>
        { grouped.map((dategroup, groupidx) => {
            const totalEntries = dategroup.entries.reduce((sum, item) => sum+=item.abs_amount, 0);
            return (
            <Accordion.Item eventKey={`dategroup_${groupidx}`} key={`dategroup_${groupidx}`}>
                <Accordion.Header>
                    <div className="flex-grow-1">{format(new Date(dategroup.date), i18n)}</div>
                    <div className="px-2">{totalEntries}{"€"}</div>
                    {/* <Stack direction="horizontal" gap={3}>
                        <div className="me-auto">{format(new Date(dategroup.date), i18n)}</div>
                        <div className="ms-auto">{totalEntries}{"€"}</div>
                    </Stack> */}
                </Accordion.Header>
                <Accordion.Body>
                    {dategroup.entries.map((asset, assetidx)=>{
                        return (
                            <div key={`asset_${assetidx}`} className="d-flex w-100 justify-content-between">
                                <div className="mb-1 pe-2 lh-sm">{asset.description}</div>
                                <small>{asset.abs_amount}{'€'}</small>
                            </div>
                            )
                    })}
                </Accordion.Body>
            </Accordion.Item>
            )
        })}
    </Accordion>
};
const AssetsInsertionForm = ({balanceCategory, onAdd}) => {
    const initialMovement = {
      date: new Date(),
      abs_amount: 0,
      description: "",
      category: balanceCategory.id,
    };
    const [newmovement, setNewmovement] = useState(initialMovement);
    const [errors, setErrors] = useState(null);
    const addMovement = () => {
        let localerrors = {};
        if(newmovement.abs_amount == 0.0){
            localerrors["abs_amount"] = t`Amount cannot be zero`;
        }
        if(newmovement.description.length === 0){
            localerrors["description"] = t`Description cannot be empty`;
        }
        if(Object.keys(localerrors).length > 0){
            setErrors(localerrors);
        }else{
            setErrors(null);
            onAdd(newmovement);
            setNewmovement(initialMovement);
        }
    };
    
    return <Form>
        <Form.Group className="mb-3">
          <Form.Label htmlFor="date">
            {t`Date`}
          </Form.Label>
          <input
            id="date"
            name="date"
            type="datetime-local"
            className={`form-control`}
            value={format_ISO_date(newmovement.date)}
            onChange={(e) => setNewmovement({...newmovement, date: new Date(e.target.value)})}
          />
        </Form.Group>
        <Form.Group className="mb-3">
            <Form.Label htmlFor="amount">
                {t`Amount`}
            </Form.Label>
            <Form.Control
                id="amount"
                name="abs_amount"
                type="number"
                className={`${errors?.abs_amount? "is-invalid" : ""}`}
                value={newmovement.abs_amount}
                onChange={(e) => setNewmovement({...newmovement, abs_amount: e.target.value})}
                />
            <Feedback type='invalid'>{errors?.abs_amount?? ""}</Feedback>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label htmlFor="description"><Trans>Description</Trans></Form.Label>
          <Form.Control 
            id="description" 
            name="description" 
            type="text" 
            className={`${errors?.description? "is-invalid" : ""}`}
            value={newmovement.description}
            onChange={(e) => setNewmovement({...newmovement, description: e.target.value})}
            required
            />
            <Feedback type='invalid'>{errors?.description?? ""}</Feedback>
        </Form.Group>
        <Button variant="primary" type="button" onClick={()=>addMovement()}>
            <Trans>Add</Trans>
        </Button>
    </Form>
};
const AssetsStagingList = ({list: assets, itemRemover}) => {
    if(!assets || assets.length === 0){
        return <div className="text-secondary"><Trans>Add your balances using the form above</Trans></div>
    }
    const total = assets.reduce((sum, item)=>sum+=parseFloat(item.abs_amount),0);
    return <ListGroup variant="flush">
        {assets?.map((asset, assetidx) => {
            return (
            <ListGroup.Item key={`asset_${assetidx}`}>
                <div className="d-flex w-100">
                    <div className="mb-1 pe-2 lh-sm me-auto">{asset.description}</div>
                    <small className="px-2">{asset.abs_amount}{'€'}</small>
                    <CloseButton onClick={()=>itemRemover(assetidx)}/>
                </div>
            </ListGroup.Item>
            )
        })}
        <ListGroup.Item key="assets_total">
            <div className="d-flex w-100">
                <div className="mb-1 pe-2 lh-sm me-auto"><Trans>TOTAL</Trans></div>
                <small className="px-2">{total}{'€'}</small>
                <CloseButton className="invisible"/>
            </div>
        </ListGroup.Item>
    </ListGroup>
}
const AssetsManager = () => {
    const queryclient = useQueryClient();
    const navigate = useNavigate();
    const {data: catData, status} = useQuery({
      queryKey: ["categories"],
      queryFn: fetchMovements,
      retry: (failureCount, error) => {
        if(error.message === "forbidden"){
          queryclient.cancelQueries();
          navigate("/login");
          return false
        } else{ 
          return failureCount-1
        }
      }, 
    });
    const [stagingList, setStagingList] = useState([]);
    const addToStagingList = (movement) => {
        setStagingList([...stagingList, movement]);
    }

    if(status === "loading"){
        return <LoadingDiv />
    }
    if(status === "error"){
        return <div>Error</div>
    }
    const balanceCategory = catData.find((category)=> category.category === "BALANCE" && category.direction == 0.0);
    return <>
        <div className="my-2">
            <Row className="justify-content-center" md={2}>
                <Col>
                    <AssetsInsertionForm balanceCategory={balanceCategory} onAdd={(movement)=> addToStagingList(movement)}></AssetsInsertionForm>
                </Col>
            </Row>
        </div>
        <div className="my-2">
                <Row className="justify-content-center">
                    <Col md={8}>
                        <Card className="shadow-lg">
                            <Card.Body>
                                <Card.Title><Trans>Assets to be recorded</Trans></Card.Title>
                                <Card.Text>
                                    <AssetsStagingList list={stagingList} itemRemover={(listidx)=> setStagingList(stagingList.toSpliced(listidx,1))}/>
                                </Card.Text>
                                <Button className="mt-2"><Trans>Save</Trans></Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
        </div>
        <div className="my-2">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="shadow-lg">
                        <Card.Body>
                            <Card.Title><Trans>Balance record history</Trans></Card.Title>
                            <Card.Text>
                                <AssetsHistoryList assets={samples} />
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    </>
};

export default AssetsManager;