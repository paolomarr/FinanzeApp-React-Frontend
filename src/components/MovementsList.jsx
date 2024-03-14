import { Table, ButtonGroup, Button, Form, Row, Col, Label, Input } from "reactstrap";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPenToSquare, faCirclePlus, faCaretDown, faCaretUp, faAnglesLeft, faAnglesRight } from "@fortawesome/free-solid-svg-icons"
import MovementModal from "./MovementModal"
import { t, Trans } from "@lingui/macro";
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
};

const PaginationControls = ({pagination, setPagination, total}) => {
  const numPages = Math.ceil(total / pagination.size);
  const pages = [];
  for (let index = 0; index < numPages; index++) {
    pages.push(index);
  }
  const pageCarouselWidth = 3;
  const pageCarousel = {
    halfWidth: Math.floor(pageCarouselWidth/2),
    minIdx: 1,
    maxIdx: numPages-1,
    start: function() {
      let ret = Math.min(pagination.page-this.halfWidth, this.maxIdx-pageCarouselWidth);
      return Math.max(this.minIdx, ret);
    },
    end: function() {
      return Math.min(this.maxIdx, this.start()+pageCarouselWidth);
    }
  };
  const pageButtonColor = (page) => {
    const btn_color = page == pagination.page ? "primary" : "secondary";
    return btn_color;
  };
  
  return (
    <div className="pagination_controls">
      <Form>
        <Row className="row-cols-lg-auto g-3 align-items-end">
          <Col xs={3}>
            <Label
              for="itemsPerPage"
            >
              <Trans>Show</Trans>
            </Label>
            <Input
              id="itemsPerPage"
              type="select"
              onChange={(e) => setPagination({...pagination, size:e.target.value})}
              value={pagination.size}
            >
            {[20,50,100].map((el) => {return <option key={`items_${el}`} value={el}>{el}</option>})}  
            </Input>
          </Col>
          <Col xs={9}>
            { numPages > pageCarouselWidth ?
            <>
            <ButtonGroup id="paginationScrollBack">
                <Button color={pageButtonColor(0)} onClick={()=>setPagination({...pagination, page:0})}>{1}</Button>
                <Button color="secondary"  onClick={()=>setPagination({...pagination, page:Math.max(0, pagination.page-pageCarouselWidth)})}><FontAwesomeIcon icon={faAnglesLeft} /></Button>
              </ButtonGroup>{' '}
              <ButtonGroup>
                {pages.slice(pageCarousel.start(), pageCarousel.end()).map((page) => {
                  return <Button color={pageButtonColor(page)} key={page} onClick={()=>setPagination({...pagination, page:page})}>{page+1}</Button>
                })}
              </ButtonGroup>{' '}
              <ButtonGroup id="paginationScrollForward">
                <Button color="secondary" onClick={()=>setPagination({...pagination, page: Math.min(numPages-1, pagination.page+pageCarouselWidth)})}><FontAwesomeIcon icon={faAnglesRight} /></Button>
                <Button color={pageButtonColor(numPages-1)} onClick={()=>setPagination({...pagination, page:numPages-1})}>{numPages}</Button>
              </ButtonGroup>
            </>
            : 
            <ButtonGroup>
              {pages.map((page) => {
                return <Button color={pageButtonColor(page)} key={page} onClick={()=>setPagination({...pagination, page:page})}>{page+1}</Button>
              })}
            </ButtonGroup>
            }
          </Col>
        </Row>
      </Form>
    </div>
  )
};

const MovementsList = ({movements, categories, subcategories, refresh}) => {
    const [showModal, setShowModal] = useState({
      movement: null,
      show: false
    });
    const [sort, setSort] = useState({
      field: "date",
      direction: -1
    });
    const [pagination, setPagination] = useState({
      size: 50,
      page: 0
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
        <PaginationControls setPagination={setPagination} pagination={pagination} total={movements.length}></PaginationControls>
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
              movements.toSorted(compareMovements).map((movement, index) => {
                const start = pagination.page * pagination.size;
                const end = start + pagination.size;
                if(index<start || index>=end){
                  return null;
                }
                return (
                <MovementsListItem key={movement.id} movement={movement} fields={fields} edit={() => setShowModal({show:true, movement: movement})} />
                )}
                )
            )}
          </tbody>
        </Table>
        <NewMovementButton onClick={() => setShowModal({show:true, movement: null})} />
        <MovementModal showModal={showModal} toggleModal={toggleModal} title={showModal.movement ? t`Update movement data` : t`Insert new movement`} />
      </>
    );
}

export default MovementsList