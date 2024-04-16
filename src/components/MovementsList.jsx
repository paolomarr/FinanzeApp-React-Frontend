import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Table from 'react-bootstrap/Table'

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPenToSquare, faCaretDown, faCaretUp, faAnglesLeft, faAnglesRight } from "@fortawesome/free-solid-svg-icons"
import { t, Trans } from "@lingui/macro";
import { format } from "../_lib/format_locale";
import { useLingui } from "@lingui/react";
import { startOfDay, endOfDay } from "date-fns";

function MovementsListTableHeader({fields, sort, onSort}) {
    return (
      <thead>
        <tr className="align-top">
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
          <td className="list-item-edit">
            <FontAwesomeIcon icon={faPenToSquare} onClick={edit} className="mt-1"/>
          </td>
        {fields.map((field) => {
          const key = `${field.column}_${movement.id}`;
          if (field.format !== undefined) {
            const val = field.format(movement[field.column]);
            return <td key={key}>{val??""}</td>;
          } else {
            const val = movement[field.column];
            return <td key={key}>{val??""}</td>;
          }
        })}
      </tr>
    );
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
        <Row className="row-cols-lg-auto g-3 align-items-end justify-content-md-end">
          <Col xs={3}>
            <Form.Label
              for="itemsPerPage"
            >
              <Trans>Show</Trans>
            </Form.Label>
            <Form.Select
              id="itemsPerPage"
              type="select"
              onChange={(e) => setPagination({...pagination, size:e.target.value})}
              value={pagination.size}
            >
            {[20,50,100].map((el) => {return <option key={`items_${el}`} value={el}>{el}</option>})}  
            </Form.Select>
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

const MovementsList = ({movements, categories, subcategories, onEdit, slice}) => {
    const {i18n} = useLingui();
    const [sort, setSort] = useState({
      field: "date",
      direction: -1
    });
    const [pagination, setPagination] = useState({
      size: 50,
      page: 0
    });
    const [movementFilter, setMovementFilter] = useState("");
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
    };
    const switchSorting = (field) => {
      const currentField = sort.field;
      if(currentField === field){
        setSort({field: field, direction: -sort.direction});
      }else{ // keep current direction, select new field
        setSort({...sort, field: field});
      }
    };
    const movementsFilterFunction = (movement) => {
      // for now, skip balance movements
      const balanceCategory = categories.find((cat)=> cat.category === "BALANCE");
      if(movement.category == balanceCategory.id) return false;
      if(!movementFilter || movementFilter.length === 0) return true;
      const cat_name = categories.find((cat) => cat.id === movement.category)?.category.toLocaleLowerCase() ?? "";
      const subcat_name = subcategories.find((subcat) => subcat.id === movement.subcategory)?.subcategory.toLocaleLowerCase() ?? "";
      let ret = false;
      // Text filter on multiple columns
      ret |= movement.description.toLocaleLowerCase().indexOf(movementFilter) >= 0;
      ret |= cat_name.indexOf(movementFilter) >= 0;
      ret |= subcat_name.indexOf(movementFilter) >= 0;
      ret |= movement.amount.toString().indexOf(movementFilter.replace(",", ".")) >= 0;
      return ret;
    };
    
    const fields = [
      // {column:"id", name: "id"},
      // {column:"user", name: "User"},
      {
        column: "date",
        name: t`Date`,
        format: (date) => {
          return format(new Date(date), i18n);
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
    
    let slicedMovements = movements;
    if(slice){
      slicedMovements = slicedMovements.filter((movement) => {
        const mDate = new Date(movement.date);
        const minFloored = startOfDay(slice.minDate);
        const maxCeiled = endOfDay(slice.maxDate);
        return mDate >= minFloored && mDate <= maxCeiled;
      });
    }
    slicedMovements = slicedMovements.filter(movementsFilterFunction).toSorted(compareMovements);
    
    return (
      <>
        <Row className="align-items-end">
          <Col xs={12} md={6} className="position-relative">
            { movementFilter.length>0 ? 
              <div className="position-absolute" style={{top: "0.4rem", right: "5%", color: "#666"}}>{slicedMovements.length}{' '}<Trans>found</Trans></div> : null
            }
            <Form.Text type="text" placeholder={t`Search movements`} value={movementFilter} id="movementFilter" onChange={(e) => setMovementFilter(e.target.value.toLocaleLowerCase())} />
          </Col>
          <Col xs={12} md={6}>
            <PaginationControls setPagination={setPagination} pagination={pagination} total={slicedMovements.length}></PaginationControls>
          </Col>
        </Row>
        <Table responsive={true} size="sm">
          <MovementsListTableHeader fields={fields} sort={sort} onSort={switchSorting}/>
          <tbody>
            {!slicedMovements || slicedMovements.length <= 0 ? (
              <tr>
                <td colSpan="6" align="center">
                  <b>Ops, no one here yet</b>
                </td>
              </tr>
            ) : (
              slicedMovements.map((movement, index) => {
                const start = pagination.page * pagination.size;
                const end = start + pagination.size;
                if(index<start || index>=end){
                  return null;
                }
                return (
                <MovementsListItem key={movement.id} movement={movement} fields={fields} edit={() => onEdit(movement)} />
                )}
                )
            )}
          </tbody>
        </Table>
      </>
    );
}

export default MovementsList