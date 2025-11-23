import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Table from 'react-bootstrap/Table'
import ListGroup from 'react-bootstrap/ListGroup'
import Collapse from 'react-bootstrap/Collapse'
import Card from 'react-bootstrap/Card'

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCaretDown, faCaretUp, faAnglesLeft, faAnglesRight, faXmark, faSearch } from "@fortawesome/free-solid-svg-icons"
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons"
import { t, Trans } from "@lingui/macro";
import { format, format_UTC_ISO_date } from "../_lib/format_locale";
import { useLingui } from "@lingui/react";
import { startOfDay, endOfDay } from "date-fns";
import { useMediaQuery } from "react-responsive";

function MovementsListTableHeader({fields, sort, onSort, compact = false}) {
    return (
      <thead>
        <tr className="align-top">
          {!compact && <th></th>}
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

const MovementsListTableItem = ({movement, fields, edit, compact = false}) => {
    const isFutureMovement = new Date(movement.date) > new Date();
    const futureClass = isFutureMovement ? "future-movement" : "";

    return (
      <tr key={movement.id} data-id={movement.id} className={futureClass}>
          {!compact && (
            <td className="list-item-edit">
              <FontAwesomeIcon icon={faPenToSquare} onClick={edit} className="mt-1"/>
            </td>
          )}
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
        <div className='d-flex'>
          <div className='px-2'>
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
          </div>
          <div className='px-2'>
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
          </div>
        </div>
      </Form>
    </div>
  )
};

const MovementsList = ({movements, categories, subcategories, onEdit, slice, isWidget = false, compact = false, onAdvancedSearch}) => {
    const {i18n} = useLingui();
    const [sort, setSort] = useState({
      field: "date",
      direction: -1
    });
    const [pagination, setPagination] = useState({
      size: isWidget ? (movements?.length || 10) : 50,
      page: 0
    });
    const [movementFilter, setMovementFilter] = useState("");
    const [showFutureMovements, setShowFutureMovements] = useState(false);
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [advancedSearchForm, setAdvancedSearchForm] = useState({
      categories: [],
      subcategories: [],
      description: "",
      minDate: "",
      maxDate: "",
      minAmount: "",
      maxAmount: ""
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

      // if showFutureMovements is not set, filter out future movements
      if(!showFutureMovements && new Date(movement.date) > new Date()) return false;

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
    
    const fields = compact ? [
      {
        column: "date",
        name: t`Date`,
        format: (date) => {
          return format(new Date(date), i18n);
        },
      },
      { column: "description", name: t`Description` },
      { column: "amount", name: t`Amount`, format: (val) => val.toFixed(2) + "€", className: "text-end" },
    ] : [
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
        <div className="mb-3">
          <Form.Check
            type="checkbox"
            id="show-future-movements"
            label={t`Show future movements`}
            checked={showFutureMovements}
            onChange={(e) => setShowFutureMovements(e.target.checked)}
          />
        </div>
        {!isWidget && (
          <>
            <Row className="justify-content-start mt-4">
              <Col xs={12} md={6}>
                <PaginationControls setPagination={setPagination} pagination={pagination} total={slicedMovements.length}></PaginationControls>
              </Col>
            </Row>
            
            <Row className="mt-2">
              <Col xs={12}>
                <Button
                  variant="link"
                  onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                  aria-controls="advanced-search-collapse"
                  aria-expanded={showAdvancedSearch}
                  className="p-0 text-decoration-none"
                >
                  <Trans>Advanced Search</Trans> <FontAwesomeIcon icon={showAdvancedSearch ? faCaretUp : faCaretDown} />
                </Button>
                
                <Collapse in={showAdvancedSearch}>
                  <div id="advanced-search-collapse">
                    <Card className="mt-2">
                      <Card.Body>
                        <Form onSubmit={(e) => {
                          e.preventDefault();
                          if (onAdvancedSearch) {
                            onAdvancedSearch(advancedSearchForm);
                          }
                        }}>
                          <Row className="g-3">
                            <Col xs={12} md={6}>
                              <Form.Label><Trans>Categories</Trans></Form.Label>
                              <Form.Select
                                multiple
                                value={advancedSearchForm.categories}
                                onChange={(e) => {
                                  const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                                  setAdvancedSearchForm({...advancedSearchForm, categories: values});
                                }}
                              >
                                {categories?.map(cat => (
                                  <option key={cat.id} value={cat.id}>{cat.category}</option>
                                ))}
                              </Form.Select>
                            </Col>
                            
                            <Col xs={12} md={6}>
                              <Form.Label><Trans>Subcategories</Trans></Form.Label>
                              <Form.Select
                                multiple
                                value={advancedSearchForm.subcategories}
                                onChange={(e) => {
                                  const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                                  setAdvancedSearchForm({...advancedSearchForm, subcategories: values});
                                }}
                              >
                                {subcategories?.map(subcat => (
                                  <option key={subcat.id} value={subcat.id}>{subcat.subcategory}</option>
                                ))}
                              </Form.Select>
                            </Col>
                            
                            <Col xs={12} md={6}>
                              <Form.Label><Trans>Description</Trans></Form.Label>
                              <Form.Control
                                type="text"
                                value={advancedSearchForm.description}
                                onChange={(e) => setAdvancedSearchForm({...advancedSearchForm, description: e.target.value})}
                                placeholder={t`Search in description`}
                              />
                            </Col>
                            
                            <Col xs={12} md={6}>
                              <Row>
                                <Col xs={6}>
                                  <Form.Label><Trans>Min Date</Trans></Form.Label>
                                  <Form.Control
                                    type="date"
                                    value={advancedSearchForm.minDate}
                                    onChange={(e) => setAdvancedSearchForm({...advancedSearchForm, minDate: e.target.value})}
                                  />
                                </Col>
                                <Col xs={6}>
                                  <Form.Label><Trans>Max Date</Trans></Form.Label>
                                  <Form.Control
                                    type="date"
                                    value={advancedSearchForm.maxDate}
                                    onChange={(e) => setAdvancedSearchForm({...advancedSearchForm, maxDate: e.target.value})}
                                  />
                                </Col>
                              </Row>
                            </Col>
                            
                            <Col xs={12} md={6}>
                              <Row>
                                <Col xs={6}>
                                  <Form.Label><Trans>Min Amount</Trans></Form.Label>
                                  <Form.Control
                                    type="number"
                                    step="0.01"
                                    value={advancedSearchForm.minAmount}
                                    onChange={(e) => setAdvancedSearchForm({...advancedSearchForm, minAmount: e.target.value})}
                                    placeholder="0.00"
                                  />
                                </Col>
                                <Col xs={6}>
                                  <Form.Label><Trans>Max Amount</Trans></Form.Label>
                                  <Form.Control
                                    type="number"
                                    step="0.01"
                                    value={advancedSearchForm.maxAmount}
                                    onChange={(e) => setAdvancedSearchForm({...advancedSearchForm, maxAmount: e.target.value})}
                                    placeholder="0.00"
                                  />
                                </Col>
                              </Row>
                            </Col>
                            
                            <Col xs={12}>
                              <div className="d-flex gap-2">
                                <Button type="submit" variant="primary">
                                  <FontAwesomeIcon icon={faSearch} className="me-2" />
                                  <Trans>Search</Trans>
                                </Button>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  onClick={() => {
                                    setAdvancedSearchForm({
                                      categories: [],
                                      subcategories: [],
                                      description: "",
                                      minDate: "",
                                      maxDate: "",
                                      minAmount: "",
                                      maxAmount: ""
                                    });
                                    if (onAdvancedSearch) {
                                      onAdvancedSearch({});
                                    }
                                  }}
                                >
                                  <Trans>Clear</Trans>
                                </Button>
                              </div>
                            </Col>
                          </Row>
                        </Form>
                      </Card.Body>
                    </Card>
                  </div>
                </Collapse>
              </Col>
            </Row>
          </>
        )}
        {!isWidget && (
          <Row className='filter-stats'>
            <Col className='text-center small'>
              <Trans>Showing</Trans>{' '}{paginationStartIdx+1}{' - '}{Math.min(paginationEndIdx, slicedMovements.length)}{' '}<Trans id='movementsListFilterStats.of'>of</Trans>{' '}{slicedMovements.length}{' '}<Trans>filtered out of</Trans>{' '}{nMovementsInDateRange}
            </Col>
          </Row>
        )}
        { !isMobile ?
          <Table responsive="sm">
            <MovementsListTableHeader fields={fields} sort={sort} onSort={switchSorting} compact={compact}/>
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
                  <MovementsListTableItem key={movement.id} movement={movement} fields={fields} edit={() => onEdit(movement)} compact={compact} />
                  )}
                  )
              )}
            </tbody>
          </Table> : slicedMovements.filter((movement, index) => index>=paginationStartIdx &&
index<paginationEndIdx).map((movement) => {
            const direction_color_class = (movement.amount >= 0 ? " earnings" : " expenses");
            const isFutureMovement = new Date(movement.date) > new Date();
            const futureClass = isFutureMovement ? " future-movement" : "";

            return <ListGroup key={`movement_${movement.id}`} variant='flush' className='movement-list'>
              <ListGroup.Item className={`border-bottom item${futureClass}`} onClick={() => onEdit(movement)}>
                <div className='d-flex'>
                  <div className={`me-auto category ${direction_color_class}
fw-bold`}>{categories.find((cat)=>cat.id===movement.category)?.category}</div>
                  <div className='date small text-secondary'>{format(movement.date, i18n)}</div>
                </div>
                <div className='d-flex'>
                  <div className='description small me-auto'>{movement.description}</div>
                  <div className={`amount
${direction_color_class}`}>{parseFloat(movement.amount).toFixed(2)}&nbsp;€</div>
                </div>
              </ListGroup.Item>
            </ListGroup>
          })
        }
      </>
    );
}

export default MovementsList
