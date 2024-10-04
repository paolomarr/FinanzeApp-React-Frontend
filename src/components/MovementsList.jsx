import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Table from 'react-bootstrap/Table'
import ListGroup from 'react-bootstrap/ListGroup'

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCaretDown, faCaretUp, faAnglesLeft, faAnglesRight, faXmark } from "@fortawesome/free-solid-svg-icons"
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons"
import { t, Trans } from "@lingui/macro";
import { format } from "../_lib/format_locale";
import { useLingui } from "@lingui/react";
import { startOfDay, endOfDay } from "date-fns";
import { useMediaQuery } from "react-responsive";

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

const MovementsListTableItem = ({movement, fields, edit}) => {
    return (
      <tr key={movement.id} data-id={movement.id}>
          <td className="list-item-edit">
            <FontAwesomeIcon icon={faPenToSquare} onClick={edit} className="mt-1"/>
          </td>
        {fields.map((field) => {
          const key = `${field.column}_${movement.id}`;
          const extra_class = field.className ?? "";
          if (field.format !== undefined) {
            const val = field.format(movement[field.column]);
            return <td key={key} className={extra_class}>{val??""}</td>;
          } else {
            const val = movement[field.column];
            return <td key={key} className={extra_class}>{val??""}</td>;
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
    const btn_color = page == pagination.page ? "primary" : "outline-secondary";
    return btn_color;
  };
  
  return (
    <div className="mt-2">
      <Form>
        <Row className="row-cols-lg-auto g-3 align-items-end justify-content-lg-end">
          <Col xs={3}>
            <Form.Label htmlFor='itemsPerPage' className='small'>
              <Trans>Page size</Trans>
            </Form.Label>
            <Form.Select
              id="itemsPerPage"
              size="sm"
              onChange={(e) => setPagination({...pagination, size:parseInt(e.target.value)})}
              value={pagination.size}
            >
            {[20,50,100].map((el) => {return <option key={`items_${el}`} value={el}>{el}</option>})}  
            </Form.Select>
          </Col>
          <Col xs={9} className='text-end'>
            { numPages > pageCarouselWidth ?
            <>
            <ButtonGroup id="paginationScrollBack" size='sm'>
                <Button variant={pageButtonColor(0)} onClick={()=>setPagination({...pagination, page:0})}>{1}</Button>
                <Button variant="outline-secondary"  onClick={()=>setPagination({...pagination, page:Math.max(0, pagination.page-pageCarouselWidth)})}><FontAwesomeIcon icon={faAnglesLeft} /></Button>
              </ButtonGroup>{' '}
              <ButtonGroup size='sm'>
                {pages.slice(pageCarousel.start(), pageCarousel.end()).map((page) => {
                  return <Button variant={pageButtonColor(page)} key={page} onClick={()=>setPagination({...pagination, page:page})}>{page+1}</Button>
                })}
              </ButtonGroup>{' '}
              <ButtonGroup size='sm' id="paginationScrollForward">
                <Button variant="outline-secondary" onClick={()=>setPagination({...pagination, page: Math.min(numPages-1, pagination.page+pageCarouselWidth)})}><FontAwesomeIcon icon={faAnglesRight} /></Button>
                <Button variant={pageButtonColor(numPages-1)} onClick={()=>setPagination({...pagination, page:numPages-1})}>{numPages}</Button>
              </ButtonGroup>
            </>
            : 
            <ButtonGroup size='sm'>
              {pages.map((page) => {
                return <Button variant={pageButtonColor(page)} key={page} onClick={()=>setPagination({...pagination, page:page})}>{page+1}</Button>
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
      // const balanceCategory = categories.find((cat)=> cat.category === "BALANCE");
      // if(movement.category == balanceCategory.id) return false;
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
      { column: "amount", name: t`Amount`, format: (val) => val.toFixed(2) + "€", className: "text-end" },
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
    const balanceCategory = categories.find((cat)=> cat.category === "BALANCE");
    // if(movement.category == balanceCategory.id) return false  
    let slicedMovements = movements.filter((movement)=>movement.category!=balanceCategory.id);
    if(slice){
      slicedMovements = slicedMovements.filter((movement) => {
        const mDate = new Date(movement.date);
        const minFloored = startOfDay(slice.minDate);
        const maxCeiled = endOfDay(slice.maxDate);
        return mDate >= minFloored && mDate <= maxCeiled;
      });
    }
    const nMovementsInDateRange = slicedMovements.length;
    slicedMovements = slicedMovements.filter(movementsFilterFunction).toSorted(compareMovements);
    
    const paginationStartIdx = pagination.page * pagination.size;
    const paginationEndIdx = paginationStartIdx + pagination.size;

    const isMobile = useMediaQuery({ query: '(max-width: 576px)' })

    return (
      <>
        <Row className="align-items-end mt-4">
          <Col xs={12} md={6} className="position-relative">
            <Form.Control type="text" size='sm' placeholder={t`Search movements`} value={movementFilter} id="movementFilter" onChange={(e) => setMovementFilter(e.target.value.toLocaleLowerCase())} />
              {movementFilter && (
            <FontAwesomeIcon icon={faXmark}
              onClick={()=> setMovementFilter("")}
              style={{
                position: 'absolute',
                right: '5%',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: '#888'
              }}
            />
      )}
          </Col>
          <Col xs={12} md={6}>
            <PaginationControls setPagination={setPagination} pagination={pagination} total={slicedMovements.length}></PaginationControls>
          </Col>
        </Row>
        <Row className='filter-stats'>
          <Col className='text-center small'>
            <Trans>Showing</Trans>{' '}{paginationStartIdx+1}{' - '}{Math.min(paginationEndIdx, slicedMovements.length)}{' '}<Trans id='movementsListFilterStats.of'>of</Trans>{' '}{slicedMovements.length}{' '}<Trans>filtered out of</Trans>{' '}{nMovementsInDateRange}
          </Col>
        </Row>
        { !isMobile ?
          <Table responsive="sm">
            <MovementsListTableHeader fields={fields} sort={sort} onSort={switchSorting}/>
            <tbody>
              {!slicedMovements || slicedMovements.length <= 0 ? (
                <tr>
                  <td colSpan="6" align="center">
                    <b>Ops, no one here yet</b>
                  </td>
                </tr>
              ) : (
                slicedMovements.filter((movement, index) => index>=paginationStartIdx && index<paginationEndIdx).map((movement) => {
                  return (
                  <MovementsListTableItem key={movement.id} movement={movement} fields={fields} edit={() => onEdit(movement)} />
                  )}
                  )
              )}
            </tbody>
          </Table> : slicedMovements.filter((movement, index) => index>=paginationStartIdx && index<paginationEndIdx).map((movement) => {
            const direction_color_class = (movement.amount >= 0 ? " earnings" : " expenses");
            return <ListGroup key={`movement_${movement.id}`} variant='flush' className='movement-list'>
              <ListGroup.Item className='border-bottom item' onClick={() => onEdit(movement)}>
                <div className='d-flex'>
                  <div className={`me-auto category ${direction_color_class} fw-bold`}>{categories.find((cat)=>cat.id===movement.category)?.category}</div>
                  <div className='date small text-secondary'>{format(movement.date, i18n)}</div>
                </div>
                <div className='d-flex'>
                  <div className='description small me-auto'>{movement.description}</div>
                  <div className={`amount ${direction_color_class}`}>{parseFloat(movement.amount).toFixed(2)}&nbsp;€</div>
                </div>
              </ListGroup.Item>
            </ListGroup>
          })
        }
      </>
    );
}

export default MovementsList
