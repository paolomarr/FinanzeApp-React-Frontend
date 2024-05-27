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
import MovementModal from './MovementModal';

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
const AssetsHistoryList = ({assets, copyItems, onEditAsset}) => {
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
                            <div key={`asset_${assetidx}`} className="d-flex w-100">
                                <div className='pe-2'><FontAwesomeIcon icon={faPenToSquare} onClick={() => onEditAsset(asset)}/></div>
                                <div className="mb-1 pe-2 lh-sm">{asset.description}</div>
                                <div className='ms-auto'><small>{parseFloat(asset.abs_amount).toFixed(2)}{'€'}</small></div>
                            </div>
                            )
                    })}
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
    if(initial && initial.id !== newmovement.id){
        setNewmovement(initial);
    }
    
    return <Form id='assetInsertForm'>
        <Form.Group className="mb-3">
            <Form.Text><Trans>Date</Trans>{": " + format(new Date(), i18n, {dateStyle: "short"})}</Form.Text>
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
        return <div className="text-secondary my-2"><Trans>Record your current net worth using the form above or by copying one group of past entries from the list below</Trans></div>
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
            <ListGroup.Item key="assets_total" className='mx-0 px-0'>
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
        mutationFn: ({balanceMov, _delete}) => {
            setShowModal({...showModal, errors: null});
            return mutateMovement({movement: balanceMov, _delete});
        },
        onSuccess: (result, {balanceMov, movIdx, _delete}) => {
            setShowModal({...showModal, show: false, movement: null, errors: null})
            if(!_delete){ // it was a POST or a PUT
                if(movIdx){ // definitely POST
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
                }else { // movIdx === undefined -> it was a PUT, i.e. an history item has been edited on remote server. Let's update our local queryData
                    queryclient.setQueryData(["balances"], (oldData) => {
                        const index = oldData.findIndex((omovement)=> omovement.id === balanceMov.id);
                        if(index>=0){
                            oldData.splice(index, 1, result);
                        }
                    });
                }
            }else{ // it was a delete
                queryclient.setQueryData(["balances"], (oldData) => {
                    const index = oldData.findIndex((omovement)=> omovement.id === balanceMov.id);
                    if(index>=0){
                        oldData.splice(index, 1);
                        return oldData;
                    }
                });
            }
        },
        onError: (error, {movIdx}) => {
            setShowModal({...showModal, errors: error.cause});
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
    const [showModal, setShowModal] = useState({
      movement: null,
      show: false,
      errors: null,
    });
    const toggleModal = () => {
      const show = !showModal.show;
      setShowModal({...showModal, show: show});
    };
    const [uploading, setUploading] = useState(UploadState.idle);
    const [uploadingCounter, setUploadingCounter] = useState(0);
    
    const bulk_upload_assets = (list) => {
        setUploading(UploadState.uploading);
        // set a constant date for all the items to be uploaded
        const fixdate = new Date();
        const allowed_keys = ["description", "abs_amount"];
        debuglog(`will upload ${list.length} items`);
        list.forEach((movement, movidx) => {
            let uploading_mov = {date: fixdate, category: balanceCategory.id};
            Object.keys(movement)
                .filter((key)=> allowed_keys.includes(key))
                .forEach((key) => uploading_mov[key]=movement[key]);
            setUploadingCounter(uploadingCounter+1);
            debuglog(`Upload counter: ${uploadingCounter}`);
            balanceMutation.mutate({balanceMov: uploading_mov, movIdx: movidx});
        });
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
                            <AssetsHistoryList assets={balanceData} copyItems={(dateGroup_items)=>setStagingList(dateGroup_items)} onEditAsset={(asset) => {setShowModal({...showModal, movement: asset, show: true})}}/>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
        <MovementModal showModal={showModal} 
            toggleModal={toggleModal} 
            onDataReady={(movement, todelete, tocontinue) => balanceMutation.mutate({balanceMov: movement, _delete: todelete, _continue: tocontinue})} 
            fields={["id", "abs_amount", "description"]}/>
    </>
};

export default AssetsManager;