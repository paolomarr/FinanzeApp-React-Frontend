import { useState } from 'react';
import MultiRangeSlider from "multi-range-slider-react";
import { format } from '../_lib/format_locale'
import { eachMonthOfInterval, eachWeekOfInterval, eachDayOfInterval, intervalToDuration } from 'date-fns' 
import { useMediaQuery } from 'react-responsive'
import { useLingui } from '@lingui/react';

const TimeSpanSlider = ({min, max, start, end, steps, onChange}) => {
    const {i18n} = useLingui();
    const nSteps = steps;
    const [step] = useState((end - start)/nSteps);

    const isMobile = useMediaQuery({ query: '(max-width: 576px)' })
    const nLabels = isMobile ? 5 : 10;

    const initialInterval = {start: min, end: max};
    const initialDuration = intervalToDuration(initialInterval);
    let eachFunction = null;
    // let formatPattern = "P";
    if(initialDuration.years > 0){
      eachFunction = eachMonthOfInterval;
      // formatPattern = "MMM yyyy";
    }else if(initialDuration.months > 0){
      eachFunction = eachWeekOfInterval;
      // formatPattern = "dd MMM yyyy";
    }else{
      eachFunction = eachDayOfInterval;
      // formatPattern = "dd MMM";
    }
    const _labels = eachFunction(initialInterval).map((date)=>{return format(date, i18n);});
    let labels;
    const multiples = parseInt(_labels.length/nLabels);
    if(multiples>1){ // 2 * nLabels or more
      labels = _labels.filter((label, index)=> index % multiples == 0 );
    }else{
      labels = _labels;
    }
    const [currentChange, setCurrentChange] = useState({min: min, max: max, minValue: start, maxValue: end});

    const handleInput = (changeResult) => {
      if(changeResult.minValue != currentChange.minValue || changeResult.maxValue != currentChange.maxValue)
        setCurrentChange(changeResult);
        if(onChange){
          onChange(changeResult);
        }
    };

    return <MultiRangeSlider 
              min={min}
              max={max}
              step={step}
              minValue={currentChange.minValue}
              maxValue={currentChange.maxValue}
              minCaption={format(currentChange.minValue, i18n)}
              maxCaption={format(currentChange.maxValue, i18n)}
              ruler={true}
              onInput={(e)=>{
                handleInput(e);
              }}
              labels={labels}
              style={{border: 'none', boxShadow: 'none'}}
            />
};

export default TimeSpanSlider
