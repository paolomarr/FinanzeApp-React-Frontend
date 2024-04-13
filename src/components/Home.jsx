import MovementsList from "./MovementsList";
import MovementsHistory from "./MovementsHistory";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import fetchMovements from "../queries/fetchMovements";
import mutateMovement from "../queries/mutateMovement";
import { Navigate, useNavigate } from "react-router-dom";
import { t } from "@lingui/macro"
import TimeSpanSlider from "./TimeSpanSlider";
import { add, interval, sub, startOfMonth, startOfYear, endOfYear } from "date-fns";
import { intervalToDuration} from "date-fns";
import { format, formatDuration } from "../_lib/format_locale"
import { useLingui } from "@lingui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faBolt } from "@fortawesome/free-solid-svg-icons";
import FixedBottomRightButton from "./FixedBottomRightButton";
import MovementModal from "./MovementModal"
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import MovementsStats from "./MovementStats";

const CustomRanges = {
  currentMonth: {range: {min: startOfMonth(new Date()), max: new Date()}, name: t`Current month`},
  last3: {range: {min: sub(new Date(), {months:3}), max: new Date()}, name: t`Last 3 months`},
  last6: {range: {min: sub(new Date(), {months:6}), max: new Date()}, name: t`Last 6 months`},
  last12: {range: {min: sub(new Date(), {months:12}), max: new Date()}, name: t`Last year`},
  pastYear: {range: {min: startOfYear(sub(new Date(), {years:1})), max: endOfYear(sub(new Date(), {years:1}))}, name: t`Past year`},
};
const MovementSummary = ({data, slice, onSetRange}) => {
  const {i18n} = useLingui();
  const today = new Date();
  // const past_year_start = new Date(today.getFullYear() - 1, 0, 1);
  // const past_year_end = add(past_year_start, {years:1});
  let outcomes = 0;
  let incomes = 0;
  let nMovements = 0;
  let minDate = today;
  let maxDate = 0;
  if(data){
    for (const movement of data.movements) {
      const mDate = new Date(movement.date);
      if(slice){
        if(mDate < slice.minDate || mDate > slice.maxDate){
          continue;
        }
      }
      minDate = Math.min(minDate, mDate);
      maxDate = Math.max(maxDate, mDate);
      nMovements+=1;
      if(movement.amount > 0){
        incomes += movement.abs_amount;
      }else if(movement.amount < 0){
        outcomes += movement.abs_amount;
      }
    }
  }
  const savingRate = incomes>0 ? (incomes-outcomes)/incomes : 0;
  let duration = intervalToDuration({start:minDate, end: maxDate});
  ["years", "months", "days"].forEach((key) => {
    if(!duration[key] || duration.key<=0){
      delete duration.key;
    }
  });
  return (
    <>
      <div className="movement-stats">
        <div className="d-flex flex-row align-items-center justify-content-center my-2">
          <div>{nMovements} {t`movements in`} {formatDuration(duration, i18n, ["years", "months", "days"])}</div>
          <UncontrolledDropdown className="px-1">
            <DropdownToggle caret={false} color="">
              <FontAwesomeIcon icon={faBolt} size="lg" className="text-secondary"/>
            </DropdownToggle>
            <DropdownMenu>
              { Object.keys(CustomRanges).map((rangeKey)=> {
                const range = CustomRanges[rangeKey];
                return <DropdownItem key={rangeKey} onClick={() => onSetRange(range.range)}>{range.name}</DropdownItem>
                })
              }
            </DropdownMenu>
          </UncontrolledDropdown>
        </div>
        <div className="movement-stats text-center row justify-content-center my-2">
          <div className="col-12 col-md-3">{t`Outcomes`}: {parseFloat(outcomes).toFixed(2)}€</div>
          <div className="col-12 col-md-3">{t`Incomes`}: {parseFloat(incomes).toFixed(2)}€</div>
          <div className="col-12 col-md-3"><b>{t`Saving rate`}: {parseFloat(savingRate*100).toFixed(1)}%</b></div>
        </div> 
      </div>
    </>
  )
};
const Home = () => {
    const {i18n} = useLingui();
    const queryclient = useQueryClient();
    const navigate = useNavigate();

    const persistedDataSliceStringyfied = sessionStorage.getItem("Home.dataSlice");
    let persistedDataSlice = null;
    if(persistedDataSliceStringyfied){
      persistedDataSlice = JSON.parse(persistedDataSliceStringyfied);
    }
    const [dataSlice, setDataSlice] = useState(persistedDataSlice ?? {
      minDate: sub(new Date(), {months:3}),
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
          return false
        } else{ 
          return failureCount-1
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
          return false
        } else{ 
          return failureCount-1
        }
      }, 
    });
    const reverseDataMovements = (data) => {
      let ascMovements = data.movements?.toSorted((a,b)=> a.date>b.date ? 1 : -1); // reversed because movements come date desc-ordered
      return {...data, movements: ascMovements};
    };
    const movementResults = useQuery({
      queryKey: ["movements", "all"],
      queryFn: fetchMovements,
      retry: (failureCount, error) => {
        if(error.message === "forbidden"){
          queryclient.cancelQueries();
          navigate("/login");
          return false
        } else{ 
          return failureCount-1
        }
      },
      enabled: !!categoryResults.data && !!subcategoryResults.data,
      select: reverseDataMovements,
    });
    const mutation = useMutation({
      mutationFn: ({movement, _delete}) => {
        setShowModal({...showModal, errors: null});
        return mutateMovement({movement, _delete})
      },
      onSuccess: (result, {movement, _delete, _continue}) => {
        // remove movement from showModal object
        setShowModal({...showModal, show: _continue, movement: null, errors: {}})
        // update data
        queryclient.setQueryData(["movements", "all"], (oldData) => {
          if(_delete){ // it's been a DELETE
            const index = oldData.movements.findIndex((omovement)=> omovement.id === movement.id);
            if(index>=0){
              oldData.movements.splice(index, 1);
              return oldData;
            }
          }else if(movement.id){ // it's been a PUT
            const index = oldData.movements.findIndex((omovement)=> omovement.id === movement.id);
            if(index>=0){
              oldData.movements.splice(index, 1, result);
              return oldData;
            }  
          }else{ // it's been a POST
            oldData.movements.push(result);
            return reverseDataMovements(oldData);
          }
        });
      },
      onError: (error, variables, context) => {
        console.log(variables);
        console.log(context);
        setShowModal({...showModal, errors: error.cause})
      }
    });
    
    if (movementResults.isLoading) {
      return (
        <div className="loading-pane justify-content-center text-center">
          <FontAwesomeIcon icon={faSpinner} spinPulse size="2xl"/>
        </div>
      );
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
    const onSliderChange = (changeResult) => {
      if(dataSlice?.minDate == changeResult.minValue && dataSlice?.maxDate == changeResult.maxValue){
        return;
      }
      let newDataSlice = { minDate: changeResult.minValue, maxDate: changeResult.maxValue};
      sessionStorage.setItem("Home.dataSlice", JSON.stringify(newDataSlice));
      setDataSlice(newDataSlice);
    };
    
    return (
      <>
        <h3 className="text-center">
          {t({id: "date.from", message: "From"})} {format(dataSlice.minDate, i18n)}{' '} 
          {t({id: "date.to", message: "to"})} {format(dataSlice.maxDate, i18n)}
        </h3>
        <MovementSummary data={movementResults.data} slice={dataSlice} onSetRange={(range) => onSliderChange({min: dataSlice.minDate, max: dataSlice.maxDate, minValue: range.min, maxValue: range.max})}></MovementSummary>
        <TimeSpanSlider 
          min={new Date(movementResults.data.minDate)} 
          max={new Date(movementResults.data.maxDate)} 
          start={dataSlice.minDate} 
          end={dataSlice.maxDate} 
          steps={100} 
          onChange={onSliderChange} /> 
        <MovementsHistory data={movementResults.data} slice={dataSlice} categories={categoryResults.data}/>
        <MovementsStats data={movementResults.data} categories={categoryResults.data} slice={dataSlice}
        />
        <MovementsList 
          movements={movementResults.data.movements}
          slice={dataSlice}
          categories={categoryResults.data}
          subcategories={subcategoryResults.data}
          onEdit={(movement) => setShowModal({show: true, movement: movement})}/>
        <FixedBottomRightButton onClick={() => setShowModal({show:true, movement: null})} />
        <MovementModal showModal={showModal} toggleModal={toggleModal} onDataReady={(movement, todelete, tocontinue) => mutation.mutate({movement: movement, _delete: todelete, _continue: tocontinue})} />
      </>
    )
}

export default Home;