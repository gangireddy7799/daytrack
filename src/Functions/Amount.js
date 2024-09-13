class AmountCalculator {
  getAmountFromTime(amountPerHour, time) {
    const [hr, min, sec] = time.split(' : ');
    const totalAmount = parseFloat(amountPerHour * parseInt(hr)
      + (parseFloat(parseInt(min) / 60 * 100).toFixed(2) / 100) * amountPerHour
      + (parseFloat(parseInt(sec) / 60 * 100).toFixed(2) / 100) * (1 / 60 * 100) / 100 * amountPerHour).toFixed(2);
    const INR = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
    });
    return INR.format(totalAmount);
  }
}

const amountCalculator = new AmountCalculator();
export default amountCalculator;
