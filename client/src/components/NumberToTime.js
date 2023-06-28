const NumberToTime = (dateNum) => {
    let date = new Date(dateNum);
    let day = date.getDate();
    let month = Number(date.getMonth()) + 1;
    const year = date.getFullYear();
    let hours = date.getHours();
    let hoursOriginal = hours;
    let minutes = date.getMinutes();
    if (month < 10) {
        month = "0" + month;
    }
    if (day < 10) {
        day = "0" + day;
    }
    if (hours > 12) {
        hours = hours - 12;
    }
    if (hours < 10) {
        hours = "0" + hours;
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    let seconds = date.getSeconds();
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    if (hoursOriginal > 11) {
        hours = "PM-" + hours;
    } else {
        hours = "AM-" + hours;
    }

    return (
        year + "-" + month + "-" + day + "_" + hours + ":" + minutes + ":" + seconds
    );
};
export default NumberToTime;
