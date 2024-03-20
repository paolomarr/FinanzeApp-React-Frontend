import { msg } from "@lingui/macro";

const durationItems = () => {
    return [
        {unit: "years", localised: msg`years`},
        {unit: "months", localised: msg`months`},
        {unit: "days", localised: msg`days`},
        {unit: "hours", localised: msg`hours`},
        {unit: "minutes", localised: msg`minutes`},
        {unit: "seconds", localised: msg`seconds`},
    ]
};
export function formatDuration(duration, i18n, fields) {
    let got_first = false;
    let output_components = [];
    if(!fields){ // default to a date-only format
        fields = ["years", "months", "days"];
    }
    for (const item of durationItems()) {
        if(fields.indexOf(item.unit)<0){
            continue;
        }
        const val = duration[item.unit];
        const translated = i18n._(item.localised);
        if(got_first){
            output_components.push(`${val ?? 0} ${translated}`);
        }else if(val > 0){
            got_first = true;
            output_components.push(`${val} ${translated}`);
        }
    }
    // loop backward to "trim" 0-values from tail
    for(let i = output_components.length-1; i>0; i--){
        const val = output_components[i];
        if(val.indexOf("0")===0){
            output_components.pop();
        }
    }
    return output_components.join(", ");
}
export function format(date, i18n, options) {
    // if(!formatString){
    //     formatString = "P";
    // }
    // const locale = i18n.locale;
    // return _format(date, formatString, {locale: locale,  ...options});
    return i18n.date(date, options);
}
