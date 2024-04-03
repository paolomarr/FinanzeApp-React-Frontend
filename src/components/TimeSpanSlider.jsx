import { useState } from 'react';
import MultiRangeSlider from "multi-range-slider-react";
import { format } from '../_lib/format_locale'
import { eachMonthOfInterval, eachWeekOfInterval, eachDayOfInterval, intervalToDuration } from 'date-fns' 
import { useMediaQuery } from 'react-responsive'
import { useLingui } from '@lingui/react';
import { colors } from '../constants';

const TimeSpanSlider = ({min, max, start, end, steps, onChange}) => {
    const {i18n} = useLingui();
    const nSteps = steps;
    const [step] = useState((end - start)/nSteps);

    const isMobile = useMediaQuery({ query: '(max-width: 576px)' })
    const nLabels = isMobile ? 5 : 10;

    const initialInterval = {start: min, end: max};
    const initialDuration = intervalToDuration(initialInterval);
    let eachFunction = null;
    let dateFormatOptions = {year: "numeric", month: "2-digit", day: "2-digit"};
    if(initialDuration.years > 0){
      eachFunction = eachMonthOfInterval;
      if(isMobile){
        dateFormatOptions.year = "2-digit";
        dateFormatOptions.day = undefined;
      }
    }else if(initialDuration.months > 0){
      eachFunction = eachWeekOfInterval;
    }else{
      eachFunction = eachDayOfInterval;
    }
    const _labels = eachFunction(initialInterval).map((date)=>{return format(date, i18n, dateFormatOptions);});
    let labels;
    const multiples = parseInt(_labels.length/nLabels);
    if(multiples>1){ // 2 * nLabels or more
      labels = _labels.filter((label, index)=> index % multiples == 0 );
    }else{
      labels = _labels;
    }
    // const [, setCurrentChange] = useState({min: min, max: max, minValue: start, maxValue: end});

    const handleInput = (changeResult) => {
      if(onChange){
        onChange(changeResult);
      }
    };

    return <MultiRangeSlider 
              min={min}
              max={max}
              step={step}
              minValue={start}
              maxValue={end}
              minCaption={format(start, i18n)}
              maxCaption={format(end, i18n)}
              ruler={true}
              onInput={(e)=>{
                handleInput(e);
              }}
              labels={labels}
              style={{border: 'none', boxShadow: 'none'}}
              barInnerColor={colors.secondary_800}
            />
};

export default TimeSpanSlider
