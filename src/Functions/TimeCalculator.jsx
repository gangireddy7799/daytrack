// Remove the React import
class TimeCalculator {
  inBetween(activemillies, comparewith = Date.now()) {
    const millis = Math.abs(comparewith - activemillies);
    let sec = Math.floor((millis / 1000) % 60),
        min = Math.floor((millis / (1000 * 60)) % 60),
        hr = Math.floor((millis / (1000 * 60 * 60)) % 24);
    hr = hr < 10 ? "0" + hr : hr;
    min = min < 10 ? "0" + min : min;
    sec = sec < 10 ? "0" + sec : sec;
    return (' ' + hr + ' : ' + min + ' : ' + sec);
  }

  secondsToTime(seconds) {
    if (seconds === 86400) return ' 24 : 00 : 00';
    let sec = Math.floor(seconds % 60),
        min = Math.floor((seconds / 60) % 60),
        hr = Math.floor((seconds / (60 * 60)) % 24);
    hr += 24 * Math.floor((seconds / (60 * 60)) / 24);
    hr = hr < 10 ? "0" + hr : hr;
    min = min < 10 ? "0" + min : min;
    sec = sec < 10 ? "0" + sec : sec;
    return (' ' + hr + ' : ' + min + ' : ' + sec);
  }

  timeToSeconds(time) {
    const arr = time.split(' : ');
    return parseInt(arr[2]) + (parseInt(arr[1]) * 60) + (parseInt(arr[0]) * 3600);
  }

  percentOfDay(seconds) {
    return parseFloat((seconds / 86400) * 100).toFixed(2);
  }

  percentToHrs(percent) {
    const secs = (percent / 100) * 86400;
    return this.secondsToTime(secs);
  }

  getTomorrow(date) {
    let dt = new Date(date);
    let nextDay = new Date(date);
    nextDay.setDate(dt.getDate() + 1);
    return nextDay.getTime();
  }

  getYesterday(date, days = 1) {
    let dt = new Date(date);
    let beforeDay = new Date(date);
    beforeDay.setDate(dt.getDate() - days);
    return this.formateDate(beforeDay).split('/').join('-');
  }

  formateDate(date) {
    const format = new Intl.DateTimeFormat('en-us');
    return format.format(date);
  }

  formated() {
    return new Intl.DateTimeFormat('en-us');
  }

  monthFirst(date) {
    const splitedDate = date.split('-');
    return splitedDate[1] + '-' + splitedDate[0] + '-' + splitedDate[2];
  }

  isToday(date) {
    return (this.formateDate(new Date())).split('/').join('-') === date;
  }
}

const timeCalculator = new TimeCalculator();
export default timeCalculator;
