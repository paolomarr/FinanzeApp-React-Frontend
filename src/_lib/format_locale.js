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
    return i18n.date(date, options);
}
export function format_UTC_ISO_date(date) {
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth()+1).toString().padStart(2, "0");
    const day = date.getUTCDate().toString().padStart(2, "0");
    const hour = date.getUTCHours().toString().padStart(2, "0");
    const minute = date.getUTCMinutes().toString().padStart(2, "0");
    // const second = date.getUTCSecond();
    return `${year}-${month}-${day}T${hour}:${minute}`;
}
export function format_ISO_date(date) {
    const year = date.getFullYear();
    const month = (date.getMonth()+1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");
    // const second = date.getUTCSecond();
    return `${year}-${month}-${day}T${hour}:${minute}`;
}
export function format_currency(value, symbol='€') {
    let fixedTwoDigits = parseFloat(value).toFixed(2);
    return `${fixedTwoDigits}${symbol}`;
}