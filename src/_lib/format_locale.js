import { format as _format, formatDuration as _formatDuration } from "date-fns";
import { enGB, it } from "date-fns/locale";

const locales = { enGB, it }

export function format(date, formatString, options) {
    if(!formatString){
        formatString = "P";
    }

    return _format(date, formatString, {locale: locales[navigator.language],  ...options});
}
export function formatDuration(duration, options) {
    return _formatDuration(duration, {locale: locales[navigator.language],  ...options});
}
