function getDifferentObject(array1 = [{}], array2 = [{}], key = "") {
  return array1.filter((object1) => {
    return !array2.some((object2) => {
      return object1[key] === object2[key];
    });
  });
}

module.exports = getDifferentObject;
