function getValue(item, field) {
  return field ? item[field] : item;
}

function min(arr, field) {
  if (!arr.length) return null;
  let x,
    min = getValue(arr[0], field);
  for (let item of arr) {
    x = getValue(item, field);
    if (x < min) min = x;
  }
  return min;
}

function max(arr, field) {
  if (!arr.length) return null;
  let x,
    max = getValue(arr[0], field);
  for (let item of arr) {
    x = getValue(item, field);
    if (x > max) max = x;
  }
  return max;
}

function average(arr, field) {
  if (!arr.length) return null;
  return sum(arr, field) / arr.length;
}

function sum(arr, field) {
  if (!arr.length) return null;
  let sum = 0;
  for (let item of arr) {
    sum += getValue(item, field);
  }
  return sum;
}

function getSumAmout(arr, currency) {
  let amount = 0;
  if (!arr || !Array.isArray(arr)) return 0;
  arr.forEach(item => {
    if (item.currency == currency) amount += item.amount;
  });
  return amount;
}

export default {
  min,
  max,
  average,
  sum,
  getSumAmout
};
