import React, { useRef, useState } from 'react';
import Card from 'react-bootstrap/Card';
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import Button from 'react-bootstrap/esm/Button';
import { t } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import fetchMovements from '../queries/fetchMovements';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { Trans } from "@lingui/macro";

const EditorPanel = ({ items, label, title, onMutateItem }) => {
    const defaultItem = {id: null, value:"", direction:-1};
    const [outItem, setOutItem] = useState(defaultItem);
    const itemValueRef = useRef(null);
    const itemDirectionRef = useRef(null);
    const handleEditClick = (item) => {
        setOutItem(item);
        itemValueRef.current.value = item[label] ?? "";
        itemDirectionRef.current.value = item.direction;
    };

    return (
        <Card className="shadow-lg">
            <Card.Body>
                <Card.Title>{title}</Card.Title>
                <div>
                    <Form>
                        <input
                            id="itemId"
                            name="id"
                            hidden
                            value={outItem.id}
                        />
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                id="itemValue"
                                name="value"
                                ref={itemValueRef}
                                onChange={(value) => {
                                    setOutItem({ ...outItem, value: value }); 
                                    // document.getElementById('itemId').value={value}
                                }}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Direction</Form.Label>
                            <Form.Select 
                            name="direction"
                            ref={itemDirectionRef}
                            onChange={(value)=> setOutItem({...outItem, value:value})}>
                                <option value={1}><Trans>Earnings</Trans></option>
                                <option value={-1}><Trans>Expenses</Trans></option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                    { outItem.id ? 
                    <Button type='button' variant='secondary' onClick={() => handleEditClick(defaultItem)}><Trans>Cancel</Trans></Button> : null}
                    <Button type="button" onClick={() => onMutateItem(outItem)} disabled={itemValueRef.current.value.length==0}><Trans>Save</Trans></Button>
                </div>
                {items.length > 0 ? (
                    <ListGroup variant='flush'>
                        {items.map((item) => {
                            return (
                                <ListGroup.Item key={item.id} active={item.id == outItem.id}>
                                    <FontAwesomeIcon 
                                        icon={faPenToSquare} 
                                        onClick={() => handleEditClick(item)} 
                                        style={{ cursor: 'pointer', marginRight: '10px' }} 
                                    />
                                    {item[label]}
                                </ListGroup.Item>
                            );
                        })}
                    </ListGroup>
                ) : (
                    <div>{t`No data`}</div>
                )}
            </Card.Body>
        </Card>
    );
};

const CategoryManager = () => {
    const { data: categoryData } = useQuery({
        queryKey: ["categories"],
        queryFn: fetchMovements,
        placeholderData: [],
    });
    const { data: subcategoryData } = useQuery({
        queryKey: ["subcategories"],
        queryFn: fetchMovements,
        placeholderData: [],
    });
    
    return (
        <>
            <EditorPanel items={categoryData} label="category" title={t`Categories`} />
            <EditorPanel items={subcategoryData} label="subcategory" title={t`Subcategories`} />
        </>
    );
};

export default CategoryManager;
