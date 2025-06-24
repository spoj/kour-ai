export const createClassString = (val: { [key: string]: boolean }) => {
  const resultClassString = [];
  for (const v in Object.entries(val)) {
    resultClassString.push(v[1] ? v[0] : "");
  }
  return resultClassString.join(" ");
};
