function findMatchingObject(array, obj) {
  if (!Array.isArray(array)) {
    throw new Error("The first argument should be an array.");
  }
  if (!obj || typeof obj !== "object") {
    throw new Error("The second argument should be an object.");
  }
  const keys = Object.keys(obj);
  return array.find(function (item) {
    return keys.every(function (key) {
      return item.hasOwnProperty(key) && item[key] === obj[key];
    });
  });
}

const array = [
  { phone: "1234567890", name: "John", ward: 10 },
  { phone: "8234567890", name: "John", ward: 1 },
];

const obj = {
  ward: 10,
};

console.log(findMatchingObject(array, obj));

module.exports = {
  findMatchingObject,
};
