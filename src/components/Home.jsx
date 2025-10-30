import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import fetchMovements from "../queries/fetchMovements";
import mutateMovement from "../queries/mutateMovement";
import { Navigate, useNavigate } from "react-router-dom";
import { t } from "@lingui/macro"
import { sub, add } from "date-fns";
import FixedBottomRightButton from "./FixedBottomRightButton";
import MovementModal from "./MovementModal"
import LoadingDiv from "./LoadingDiv";
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';
import MovementsList from "./MovementsList";
import MovementsHistory from "./MovementsHistory";
import MovementsStats  from "./MovementStats";

// Recent Movements Widget
const RecentMovementsWidget = ({ movements, categories, subcategories, onEdit, onNavigate }) => {
  const recentMovements = movements?.slice(-5) || [];
  
  return (
    <Card className="h-100">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <Card.Title className="mb-0">{t`Recent Movements`}</Card.Title>
        <small>
          <button 
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/movements');
            }}
            className="border-0 bg-transparent text-primary text-decoration-underline"
          >
            {t`Show all`}
          </button>
        </small>
      </Card.Header>
      <Card.Body className="p-0">
        <MovementsList 
          movements={recentMovements}
          categories={categories}
          subcategories={subcategories}
          onEdit={onEdit}
          slice={null}
          isWidget={true}
          compact={true}
        />
      </Card.Body>
    </Card>
  );
};

// Stats Widget
const StatsWidget = ({ data, categories, monthsBack = 3 }) => {
  if (!data?.filtered?.movements) {
    return (
      <Card className="h-100">
        <Card.Header>
          <Card.Title className="mb-0">{t`Statistics`} ({t`Last ${monthsBack} months`})</Card.Title>
        </Card.Header>
        <Card.Body className="text-center align-content-center">
          <p>{t`No data available`}</p>
        </Card.Body>
      </Card>
    );
  }

  let outcomes = 0;
  let incomes = 0;
  
  for (const movement of data.filtered.movements) {
    if (movement.amount > 0) {
      incomes += movement.abs_amount;
    } else if (movement.amount < 0) {
      outcomes += movement.abs_amount;
    }
  }

  const savingRate = incomes > 0 ? (incomes - outcomes) / incomes : 0;
  const savingRateStrColorClass = savingRate > 0 ? "text-earnings" : "text-expenses";

  return (
    <Card className="h-100">
      <Card.Header>
        <Card.Title className="mb-0">{t`Statistics`} ({t`Last ${monthsBack} months`})</Card.Title>
      </Card.Header>
      <Card.Body>
        <div className="row text-center fs-3">
          <div className="col-12 col-md-6 mb-2 fw-bold">
            <div className="text-muted">{t`Incomes`}</div>
            <div className="text-earnings">+{parseFloat(incomes).toFixed(2)}€</div>
          </div>
          <div className="col-12 col-md-6 mb-2 fw-bold">
            <div className="text-muted">{t`Expenses`}</div>
            <div className="text-expenses">-{parseFloat(outcomes).toFixed(2)}€</div>
          </div>
          <div className="col-12 mb-2 fw-bold">
            <div className="text-muted">{t`Saving Rate`}</div>
            <div className={`${savingRateStrColorClass} fs-1`}>{parseFloat(savingRate * 100).toFixed(1)}%</div>
          </div>
        </div>
        <div>
          <MovementsHistory data={data} categories={categories} />
        </div>
        <div>
          <MovementsStats data={data} categories={categories}/>
        </div>
      </Card.Body>
    </Card>
  );
};

// Categories Chart Widget
const SpendingCategoriesWidget = ({ data, categories }) => {
  // filter only expenses-type categories and set a new 'amount' field
  const expenseCategories = categories.filter((cat) => cat.direction === -1).map((cat) => {
    return {
      ...cat,
      amount: 0,
      percent: function(total){
        return this.amount / total;
      },
    }
  });
  var total = 0;
  // loop over data.filtered.movements and sum by categories, piling up into expenseCategories
  for (const movement of data.filtered.movements) {
    const cat = expenseCategories.find((cat) => cat.id === movement.category);
    if (cat) {
      cat.amount += movement.abs_amount;
      total += movement.abs_amount;
    }
  }
  
  const percent_cutoff = 0.05;

  return (
    <Card className="h-100">
      <Card.Header>
        <Card.Title className="mb-0">{t`Spending by Category`}</Card.Title>
      </Card.Header>
      <Card.Body>
        <ListGroup  variant='flush' className='movement-list'>
        {expenseCategories.filter(cat => cat.percent(total) >= percent_cutoff).toSorted((a, b) => b.amount - a.amount).map((cat) => {
          return (
              <ListGroup.Item key={`${cat.category}`} className='border-bottom item'>
                <div className="row align-items-center">
                  <div className="col-8">
                    <div className="category fw-bold">{cat.category}</div>
                    <div className='small me-auto'>{cat.amount.toFixed(2)}&nbsp;€</div>
                  </div>
                  <div className="col-4 text-end">
                    <div className="amount expenses">{parseFloat(cat.amount*100/total).toFixed(2)}%</div>
                  </div>
                </div>
                
              </ListGroup.Item>
            )
          })
        }
      </ListGroup>
      </Card.Body>
    </Card>
  );
};
const Home = () => {
  const queryclient = useQueryClient();
  const navigate = useNavigate();
  const monthsBack = 3;

  const [dataSlice] = useState({
    minDate: sub(new Date(), {months: monthsBack}),
    maxDate: new Date(),
  });

  const [showModal, setShowModal] = useState({
    movement: null,
    show: false,
    errors: null,
  });

  const toggleModal = () => {
    const show = !showModal.show;
    setShowModal({...showModal, show: show});
  };

  const categoryResults = useQuery({
    queryKey: ["categories"],
    queryFn: fetchMovements,
    retry: (failureCount, error) => {
      if(error.message === "forbidden"){
        queryclient.cancelQueries();
        navigate("/login");
        return false;
      } else{ 
        return failureCount-1;
      }
    }, 
  });

  const subcategoryResults = useQuery({
    queryKey: ["subcategories"],
    queryFn: fetchMovements,
    retry: (failureCount, error) => {
      if(error.message === "forbidden"){
        queryclient.cancelQueries();
        navigate("/login");
        return false;
      } else{ 
        return failureCount-1;
      }
    }, 
  });

  const movementResults = useQuery({
    queryKey: ["movements", {
      all: true, 
      datefrom: dataSlice.minDate, 
      dateto: add(dataSlice.maxDate, {days: 1}),
      sort_field: "date",
    }],
    queryFn: fetchMovements,
    retry: (failureCount, error) => {
      if(error.message === "forbidden"){
        queryclient.cancelQueries();
        navigate("/login");
        return false;
      } else{ 
        console.log(`'movements query error: ${error.message}`);
        return failureCount-1;
      }
    },
    enabled: !!categoryResults.data && !!subcategoryResults.data,
  });

  const mutation = useMutation({
    mutationFn: ({movement, _delete}) => {
      setShowModal({...showModal, errors: null});
      return mutateMovement({movement, _delete});
    },
    onSuccess: (result, {_continue}) => {
      setShowModal({...showModal, show: _continue, movement: null, errors: {}})
      queryclient.invalidateQueries(["movements"]);
    },
    onError: (error, variables, context) => {
      console.log(variables);
      console.log(context);
      setShowModal({...showModal, errors: error.cause})
    }
  });
  
  if (movementResults.isLoading) {
    return <LoadingDiv />
  }

  if (movementResults.isError) {
    switch (movementResults.error.message) {
      case "forbidden":
        console.log("Unable to fetch: unauthenticated");
        break;
      default:
        console.log("Unable to fetch: unknown error");
        break;
    }
    return (
      <Navigate to="/login" />
    )
  }

  return (
    <Container fluid>
      
      <Row className="g-3">
        {/* Stats Widget */}
        <Col xs={12} xl={5}>
          <StatsWidget 
            data={movementResults.data} 
            categories={categoryResults.data}
            monthsBack={monthsBack}
          />
        </Col>
        
        {/* Recent Movements Widget */}
        <Col xs={12} xl={7}>
          <RecentMovementsWidget 
            movements={movementResults.data?.filtered?.movements}
            categories={categoryResults.data}
            subcategories={subcategoryResults.data}
            onEdit={(movement) => setShowModal({show: true, movement: movement})}
            onNavigate={(path) => navigate(path)}
          />
        </Col>
      </Row>

      {/* Categories Chart Widget */}
      {/* <Row className="g-3 mt-3">
        <Col xs={12}>
          <SpendingCategoriesWidget 
            data={movementResults.data} 
            categories={categoryResults.data}
          />
        </Col>
      </Row> */}

      <FixedBottomRightButton onClick={() => setShowModal({show:true, movement: null})} />
      <MovementModal 
        showModal={showModal}
        onMovementUpdate={(newMovement)=>setShowModal({...showModal, movement:newMovement})}
        toggleModal={toggleModal} 
        onDataReady={(movement, todelete, tocontinue) => mutation.mutate({movement: movement, _delete: todelete, _continue: tocontinue})} />
    </Container>
  )
}

export default Home;
