import { Table } from "reactstrap";
import { useState } from "react";
import { useQuery} from "@tanstack/react-query";
import fetchMovements from "../queries/fetchMovements";
import { Navigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPenToSquare, faCirclePlus } from "@fortawesome/free-solid-svg-icons"
import MovementModal from "./MovementModal"

function MovimentiListTableHeader({fields}) {
    return (
      <thead>
        <tr>
          {fields.map((field) => (
            <th key={`movementTableHeader_${field.column}`}>{field.name}</th>
          ))}
        </tr>
      </thead>
    );
}

const MovimentiListItem = ({movement, fields, edit}) => {
    return (
      <tr key={movement.id} data-id={movement.id}>
          {/* <Button color="secondary" outline> */}
            <FontAwesomeIcon icon={faPenToSquare} border onClick={edit}/>
          {/* </Button> */}
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

const MovimentiList = () => {
    const [showModal, setShowModal] = useState({
      movement: null,
      show: false
    });
    const toggleModal = () => setShowModal({show: !showModal.show, movement: showModal.movement});

    const results = useQuery(["movements"], fetchMovements);
    const movements = results?.data;
    const fields = [
      // {column:"id", name: "id"},
      // {column:"user", name: "User"},
      {
        column: "date",
        name: "Date",
        format: (date) => {
          return new Date(date).toLocaleDateString();
        },
      },
      { column: "description", name: "Description" },
      { column: "abs_amount", name: "Abs. amount", format: (val) => val.toFixed(2) },
      {
        column: "category",
        name: "Category",
        format: (item) => {
          return item.category;
        },
      },
      {
        column: "subcategory",
        name: "Subcategory",
        format: (item) => {
          return item.subcategory;
        },
      },
    ];
    
    if (results.isLoading) {
      return (
        <div className="loading-pane">
          <h2 className="loader">🌀</h2>
        </div>
      );
    }
    if (results.isError) {
        switch (results.error.message) {
            case "forbidden":
                console.log("Unable to fetch: unauthenticated");
                return (
                    <Navigate to="/login" />
                )
            default:
                console.log("Unable to fetch: unknown error");
                break;
        }
    }
    return (
      <>
        <MovementModal showModal={showModal} toggleModal={toggleModal} title="Insert new movement" />
        <Table>
          <MovimentiListTableHeader fields={fields} />
          <tbody>
            {!movements || movements.length <= 0 ? (
              <tr>
                <td colSpan="6" align="center">
                  <b>Ops, no one here yet</b>
                </td>
              </tr>
            ) : (
              movements.map((movement) => (
                <MovimentiListItem key={movement.id} movement={movement} fields={fields} edit={() => setShowModal({show:true, movement: movement})} />
              ))
            )}
          </tbody>
        </Table>
        <NewMovementButton onClick={() => setShowModal({show:true, movement: null})} />
      </>
    );
}

export default MovimentiList