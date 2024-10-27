import React, { useState } from 'react';
import Card from 'react-bootstrap/Card';
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form"
import Button from 'react-bootstrap/esm/Button';
import { t } from '@lingui/macro';
import { useQuery } from '@tanstack/react-query';
import fetchMovements from '../queries/fetchMovements';


const EditorPanel = ({items, label, title, onMutateItem}) => {
    const [outItem, setOutItem] = useState({});
    return <Card className="shadow-lg">
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
                    <Form.Control 
                    id="itemName" name="name" value={outItem.value} 
                    onChange={(value)=> setOutItem({...outItem, value: value})}/>
                </Form>
                <Button type="button" onClick={()=> onMutateItem(outItem)} />
            </div>
            {items.length > 0 ? <ListGroup variant='flush'>
                {items.map((item)=>{
                    return <ListGroup.Item key={item.id}>{item[label]}</ListGroup.Item>
                })}
                </ListGroup> : <div>t`No data`</div>
            }
        </Card.Body>
    </Card>
};
const CategoryManager = () => {
    const {data: categoryData} = useQuery({
        queryKey: ["categories"],
        queryFn: fetchMovements,
        placeholderData: [],
    });
    const {data: subcategoryData} = useQuery({
        queryKey: ["subcategories"],
        queryFn: fetchMovements, 
        placeholderData: [],
    });
    return <>
        <EditorPanel items={categoryData} label="category" title={t`Categories`} />
        <EditorPanel items={subcategoryData} label="subcategory" title={t`Subcategories`} />
    </>
};

export default CategoryManager;
