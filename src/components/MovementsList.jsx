import { Table } from "reactstrap";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPenToSquare, faCirclePlus, faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons"
import MovementModal from "./MovementModal"
import { t } from "@lingui/macro";
import { format } from "../_lib/format_locale";

function MovementsListTableHeader({fields, sort, onSort}) {
    return (
      <thead>
        <tr>
          <th></th>
          {fields.map((field) => {
            let style = {color: "#cccccc",};
            let icon = faCaretDown;
            if(sort && sort.field === field.column){
              style={};
              if(sort.direction === 1){
                icon = faCaretUp;
              }
            }
            return (
              <th key={`movementTableHeader_${field.column}`}>{field.name}{' '}
                <FontAwesomeIcon onClick={() => onSort? onSort(field.column) : null} icon={icon} style={style} />
              </th>
            )
            })
          }
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

const MovementsList = ({movements, categories, subcategories, refresh}) => {
    const [showModal, setShowModal] = useState({
      movement: null,
      show: false
    });
    const [sort, setSort] = useState({
      field: "date",
      direction: -1
    });
    const compareMovements = (movA, movB) => {
      const reverseFactor = -sort.direction;
      const valA = movA[sort.field];
      const valB = movB[sort.field];
      if(valA < valB){
        return reverseFactor;
      }else if(valB < valA){
        return -reverseFactor;
      }
      return 0;
    }
    const switchSorting = (field) => {
      const currentField = sort.field;
      if(currentField === field){
        setSort({field: field, direction: -sort.direction});
      }else{ // keep current direction, select new field
        setSort({...sort, field: field});
      }
    };
    
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
          return format(new Date(date));
        },
      },
      { column: "description", name: t`Description` },
      { column: "amount", name: t`Amount`, format: (val) => val.toFixed(2) + "€" },
      {
        column: "category",
        name: t`Category`,
        format: (item) => {
          return categories?.find((cat)=> cat.id==item )?.category ?? item;
        },
      },
      {
        column: "subcategory",
        name: t`Subcategory`,
        format: (item) => {
          return subcategories?.find((subcat)=> subcat.id==item )?.subcategory ?? item;
        },
      },
    ];
    
    
    return (
      <>
        <Table responsive={true} size="sm">
          <MovementsListTableHeader fields={fields} sort={sort} onSort={switchSorting}/>
          <tbody>
            {!movements || movements.length <= 0 ? (
              <tr>
                <td colSpan="6" align="center">
                  <b>Ops, no one here yet</b>
                </td>
              </tr>
            ) : (
              movements.toSorted(compareMovements).map((movement) => (
                <MovementsListItem key={movement.id} movement={movement} fields={fields} edit={() => setShowModal({show:true, movement: movement})} />
              ))
            )}
          </tbody>
        </Table>
        <NewMovementButton onClick={() => setShowModal({show:true, movement: null})} />
        <MovementModal showModal={showModal} toggleModal={toggleModal} title={showModal.movement ? t`Update movement data` : t`Insert new movement`} />
      </>
    );
}

export default MovementsList