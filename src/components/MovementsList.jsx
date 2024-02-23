import { Table } from "reactstrap";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPenToSquare, faCirclePlus } from "@fortawesome/free-solid-svg-icons"
import MovementModal from "./MovementModal"
import { t } from "@lingui/macro";

function MovementsListTableHeader({fields}) {
    return (
      <thead>
        <tr>
          <th></th>
          {fields.map((field) => (
            <th key={`movementTableHeader_${field.column}`}>{field.name}</th>
          ))}
        </tr>
      </thead>
    );
}

const MovementsListItem = ({movement, fields, edit}) => {
    return (
      <tr key={movement.id} data-id={movement.id}>
          <td>
            <FontAwesomeIcon icon={faPenToSquare} onClick={edit} className="mt-1"/>
          </td>
        {fields.map((field) => {
          if (field.format !== undefined) {
            const val = field.format(movement[field.column]);
            const key = `${field.column}_${val.id}`;
            return <td key={key}>{val}</td>;
          } else {
            const key = `${field.column}_${movement.id}`;
            const val = movement[field.column];
            return <td key={key}>{val}</td>;
          }
        })}
      </tr>
    );
};

const NewMovementButton = ({onClick}) => {
    return (
        <button onClick={onClick} 
          style={{position: "fixed", right: "2%", bottom: "2%", border: "unset", background: "unset"}}>
          <FontAwesomeIcon icon={faCirclePlus} size="3x"/>
        </button>
    )
}

const MovementsList = (props) => {
    const [showModal, setShowModal] = useState({
      movement: null,
      show: false
    });
    
    const refresh = props.refresh;
    const movements = props.movements;
    
    const toggleModal = (data_updated) => {
      const show = !showModal.show
      setShowModal({show: show, movement: showModal.movement});
      if(!show && data_updated){
        console.log("Data updated, refreshing...");
        refresh();
      }
    };
    const fields = [
      // {column:"id", name: "id"},
      // {column:"user", name: "User"},
      {
        column: "date",
        name: t`Date`,
        format: (date) => {
          return new Date(date).toLocaleDateString();
        },
      },
      { column: "description", name: t`Description` },
      { column: "abs_amount", name: t`Abs. amount`, format: (val) => val.toFixed(2) },
      {
        column: "category",
        name: t`Category`,
        format: (item) => {
          return item.category;
        },
      },
      {
        column: "subcategory",
        name: t`Subcategory`,
        format: (item) => {
          return item.subcategory;
        },
      },
    ];
    
    
    return (
      <>
        <Table responsive={true} size="sm">
          <MovementsListTableHeader fields={fields} />
          <tbody>
            {!movements || movements.length <= 0 ? (
              <tr>
                <td colSpan="6" align="center">
                  <b>Ops, no one here yet</b>
                </td>
              </tr>
            ) : (
              movements.map((movement) => (
                <MovementsListItem key={movement.id} movement={movement} fields={fields} edit={() => setShowModal({show:true, movement: movement})} />
              ))
            )}
          </tbody>
        </Table>
        <NewMovementButton onClick={() => setShowModal({show:true, movement: null})} />
        <MovementModal showModal={showModal} toggleModal={toggleModal} title={showModal.movement ? "Update movement data" : "Insert new movement"} />
      </>
    );
}

export default MovementsList