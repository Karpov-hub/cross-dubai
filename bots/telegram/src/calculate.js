exports.getCalcs = function (params) {
  params = params.split(",");

  params = params.map((element) => {
    element = element.trim();
    return parseFloat(element);
  });

  if (!params || params.length < 4) return false;

  const p = params[0] * params[1];
  const b = params[0] * params[2];
  const d1 = p - b - params[3];

  console.log(`П: ${p}\nБ: ${b}\nД1: ${d1}`);

  return `П: ${p}\nБ: ${b}\nД1: ${d1}`;
  return params;
};
