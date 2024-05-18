// import { sub } from "date-fns";
import {format} from '../_lib/format_locale';
import ListGroup from 'react-bootstrap/ListGroup';
import Accordion from 'react-bootstrap/Accordion';
import Form from "react-bootstrap/Form";
import { useLingui } from "@lingui/react";
// import { format_ISO_date } from "../_lib/format_locale";
import { useQuery, useMutation } from "@tanstack/react-query";
import fetchMovements from "../queries/fetchMovements";
import mutateMovement from '../queries/mutateMovement';
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons"
import { debuglog } from '../constants';

// const samples = [
//     {date: sub(new Date(), {days: 2}), abs_amount: 100, description: "sample_0_a"},
//     {date: sub(new Date(), {days: 2}), abs_amount: 1000, description: "sample_0_b very very very long description that possibly spans more than one single line"},
//     {date: sub(new Date(), {days: 2}), abs_amount: 500, description: "sample_0_c"},
//     {date: sub(new Date(), {days: 22}), abs_amount: 140, description: "sample_1_a"},
//     {date: sub(new Date(), {days: 22}), abs_amount: 1400, description: "sample_1_b"},
//     {date: sub(new Date(), {days: 22}), abs_amount: 540, description: "sample_1_c"},
//     {date: sub(new Date(), {months: 1, days: 10}), abs_amount: 300, description: "sample_2_a"},
//     {date: sub(new Date(), {months: 1, days: 10}), abs_amount: 3000, description: "sample_2_b"},
//     {date: sub(new Date(), {months: 1, days: 10}), abs_amount: 300, description: "sample_2_c"},
// ];
const UploadState = {
    idle: 0,
    uploading: 1,
    done: 2
};
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
const AssetsHistoryList = ({assets, copyItems}) => {
    const {i18n} = useLingui();
    const grouped = groupByDate(assets);
    
    return <Accordion alwaysOpen flush>
        { grouped.map((dategroup, groupidx) => {
            const totalEntries = dategroup.entries.reduce((sum, item) => sum+=item.abs_amount, 0);
            return (
            <Accordion.Item eventKey={`dategroup_${groupidx}`} key={`dategroup_${groupidx}`}>
                <Accordion.Header>
                    <div className="flex-grow-1">{format(new Date(dategroup.date), i18n)}</div>
                    <div className="px-2">{parseFloat(totalEntries).toFixed(2)}{"€"}</div>
                </Accordion.Header>
                <Accordion.Body>
                    {dategroup.entries.map((asset, assetidx)=>{
                        return (
                            <div key={`asset_${assetidx}`} className="d-flex w-100 justify-content-between">
                                <FontAwesomeIcon icon={faPenToSquare} />
                                <div className="mb-1 pe-2 lh-sm">{asset.description}</div>
                                <small>{parseFloat(asset.abs_amount).toFixed(2)}{'€'}</small>
                            </div>
                            )
                    })}
                    {/* <div className="link-opacity-75 link-primary text-center text-decoration-underline"><Trans>Copy items</Trans></div> */}
                    <div className="text-center"><Button variant='link' onClick={copyItems?()=>copyItems(dategroup.entries.map((entry)=>{entry.date = new Date(); return entry;})):null}><Trans>Copy items</Trans></Button></div>
                </Accordion.Body>
            </Accordion.Item>
            )
        })}
    </Accordion>
};
const AssetsInsertionForm = ({balanceCategory, onAdd, initial}) => {
    const {i18n} = useLingui();
    const initialMovement = {
      date: new Date(),
      abs_amount: 0,
      description: "",
      category: balanceCategory.id,
    };
    if(!initial) initial = initialMovement;
    const [newmovement, setNewmovement] = useState(initial);
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
    // const updateNewMovement = (update) => {
    //   setNewmovement({...newmovement, ...update});
    // }
    if(initial && initial.id !== newmovement.id){
        setNewmovement(initial);
    }
    
    return <Form id='assetInsertForm'>
        <Form.Group className="mb-3">
            <Form.Text><Trans>Date</Trans>{": " + format(new Date(), i18n, {dateStyle: "short"})}</Form.Text>
          {/* <Form.Label htmlFor="date">
            {t`Date`}
          </Form.Label>
          <input
            readOnly
            id="date"
            name="date"
            type="date"
            className={`form-control`}
            value={format_ISO_date(newmovement.date)}
            onChange={(e) => setNewmovement({...newmovement, date: new Date(e.target.value)})}
          /> */}
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
        <Button variant="secondary" type="button" onClick={()=>addMovement()}>
            <Trans>Add</Trans>
        </Button>
    </Form>
};
const AssetsStagingList = ({list: assets, itemRemover, itemEditor, uploading}) => {
    // const {i18n} = useLingui();
    if(!assets || assets.length === 0){
        return <div className="text-secondary my-2"><Trans>Add your balances using the form above or by copying one group of entries from the list below</Trans></div>
    }
    const total = assets.reduce((sum, item)=>sum+=parseFloat(item.abs_amount),0);
    const baseButtonsClass = uploading !== UploadState.idle ? "disabled" : "";
    return <ListGroup variant="flush">
            {assets?.map((asset, assetidx) => {
                return (
                <ListGroup.Item key={`asset_${assetidx}`} className={"mx-0 px-0" + (asset.error ? "bg-danger-subtle" : "")}>
                    <div className={"d-flex w-100" + (asset.success ? " opacity-25" : "")}>
                        {/* <small className='pe-2 opacity-50'>{format(asset.date, i18n, {dateStyle: "short"})}</small> */}
                        <div className="mb-1 pe-2 lh-sm me-auto">{asset.description}</div>
                        <small className="px-2">{parseFloat(asset.abs_amount).toFixed(2)}{'€'}</small>
                        <div className='px-2'>
                            <FontAwesomeIcon icon={faPenToSquare} className={baseButtonsClass + " opacity-75"} onClick={()=>{ asset.date = new Date(asset.date); itemEditor(asset); itemRemover(assetidx); }}/>
                        </div>
                        <CloseButton className={baseButtonsClass} onClick={()=>itemRemover(assetidx)}/>
                    </div>
                </ListGroup.Item>
                )
            })}
            <ListGroup.Item key="assets_total">
                <div className="d-flex w-100 fw-bold">
                    <div className="mb-1 pe-2 lh-sm me-auto"><Trans>TOTAL</Trans></div>
                    <small className="px-2">{parseFloat(total).toFixed(2)}{'€'}</small>
                    <div className='px-2'>
                            <FontAwesomeIcon icon={faPenToSquare} className='invisible'/>
                        </div>
                    <CloseButton className="invisible"/>
                </div>
            </ListGroup.Item>
        </ListGroup>
}
const AssetsManager = () => {
    const queryclient = useQueryClient();
    const navigate = useNavigate();
    const {data: catData, status: catStatus} = useQuery({
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
    const {data: balanceData, status: balanceStatus} = useQuery({
        queryKey: ["balances"],
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
    const [editStagingItem, setEditStagingItem] = useState(null);
    const balanceMutation = useMutation({
        mutationFn: ({balanceMov}) => {
            delete balanceMov.id;
            return mutateMovement({movement: balanceMov});
        },
        onSuccess: (result, {movIdx}) => {
            setUploadingCounter(uploadingCounter-1);
            debuglog(`Item ${movIdx} uploaded. Upload counter: ${uploadingCounter}`);
            // if all upload ops have completed AND no error occured, clear the staging list after a while
            if(uploadingCounter === 0){
                if(stagingList.findIndex((item)=> item.error !== undefined)<0){
                    const timeout = 2000;
                    debuglog(`will clear staging list in ${timeout/1000} seconds`);
                    setTimeout(() => {
                        setStagingList([]);
                    }, timeout);
                }else{
                    debuglog("Some upload did fail. Retaining staging list for debug purpose");
                }
                setUploading(false);
            }
            queryclient.setQueryData(["balances"], (oldData) => {
                oldData.push(result);
            });
            let copylist = stagingList;
            copylist[movIdx].success = true;
            setStagingList(copylist);
        },
        onError: (error, {movIdx}) => {
            debuglog(`Item ${movIdx} failed to upload: ${error}`);
            let copylist = stagingList;
            copylist[movIdx].success = false;
            copylist[movIdx].error = error;
            setStagingList(copylist);
        }
    });
    
    const saveButtonLabel = (uploadState) => {
        switch (uploadState) {
            case UploadState.idle:
                return t`Save`;
            case UploadState.uploading:
                return t`Saving`;
            case UploadState.done:
                return t`Saved`;
            default:
                return t`Save`;
        }
    }
    const [uploading, setUploading] = useState(UploadState.idle);
    const [uploadingCounter, setUploadingCounter] = useState(0);
    
    const bulk_upload_assets = (list) => {
        setUploading(UploadState.uploading);
        // set a constant date for all the items to be uploaded
        const fixdate = new Date();
        debuglog(`will upload ${list.length} items`);
        list.forEach((movement, movidx) => {
            movement.date = fixdate;
            setUploadingCounter(uploadingCounter+1);
            debuglog(`Upload counter: ${uploadingCounter}`);
            balanceMutation.mutate({balanceMov: movement, movIdx: movidx});
        });
        // setUploading(UploadState.done);
        // setTimeout(() => {
        //     setStagingList
        // }, 1000);
    }

    if(catStatus === "loading" || balanceStatus === "loading"){
        return <LoadingDiv />
    }
    if(catStatus === "error" || balanceStatus === "error"){
        return <div>Error</div>
    }
    const balanceCategory = catData.find((category)=> category.category === "BALANCE" && category.direction == 0.0);
    return <>
        <div className="my-2">
            <Row className="justify-content-center" md={2}>
                <Col>
                    <Card className="shadow-lg" bg="primary">
                        <Card.Body>
                            <AssetsInsertionForm balanceCategory={balanceCategory} onAdd={(movement)=> { addToStagingList(movement); setEditStagingItem(null)} } initial={editStagingItem}></AssetsInsertionForm>
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
                                <Card.Title><Trans>Assets to be recorded</Trans></Card.Title>
                                <AssetsStagingList list={stagingList} 
                                    itemRemover={(listidx)=> setStagingList(stagingList.toSpliced(listidx,1))} 
                                    itemEditor={(asset)=> setEditStagingItem(asset)}
                                    onSave={(list)=>bulk_upload_assets(list)}
                                    uploading={uploading}
                                    />
                                <Button className={"mt-2" + uploading > UploadState.idle ? " disabled" : ""}
                                    onClick={() => bulk_upload_assets(stagingList)}>
                                    {saveButtonLabel(uploading)}
                                </Button>
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
                            <AssetsHistoryList assets={balanceData} copyItems={(dateGroup_items)=>setStagingList(dateGroup_items)}/>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    </>
};

export default AssetsManager;