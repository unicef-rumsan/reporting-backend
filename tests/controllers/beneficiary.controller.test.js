const { db } = require("../jest.setup");
const BeneficiaryController = require("../../modules/beneficiary/beneficiary.controller");
const beneficiaryC = new BeneficiaryController({ db });

const BeneficiaryToBeCreated = {
  id: "0x064e0f1cf92b93af161e42f60bc5cb1fac0a0cdb2d2727c274ce70f64f35dadf",
  name: "Kelli Rempel",
  walletAddress: "0x6e18753B910F2FD118f3E0A69c18F31DD81995A5",
  gender: "M",
  phone: "9814719844",
  age: 41,
  child: 2,
  group: "G",
  noOfAdults: 4,
  noOfChildren: 5,
};

const BeneficiaryToBeUpdated = {
  id: "0x064e0f1cf92b93af161e42f69bc5cb1fac0a0cdb2d2727c274ce70f64f35dadf",
  name: "Kelli Rempel Update",
  walletAddress: "0x6e18753B910F2FD118f3E0A69c18F31DD81995A6",
  gender: "F",
  phone: "9814719844",
  age: 41,
  child: 2,
  group: "G",
  noOfAdults: 3,
  noOfChildren: 6,
};
const BulkAdd = [
  {
    id: "0x064e0f1cf92b93af161e42f69bc5cb1fac0a0cdb2d2727c274ce70f64f35dadf",
    name: "Kelli Rempel Update",
    walletAddress: "0x6e18753B910F2FD118f3E0A69c18F31DD81995A6",
    gender: "F",
    phone: "9814719844",
    age: 41,
    child: 2,
    group: "G",
    noOfAdults: 3,
    noOfChildren: 6,
  },
  {
    id: "0x064e0f1cf92b93af161e42f69bc5cb1fac0a0cdb2d2727c274ce70f64f35dadf",
    name: "Kelli Rempel Update",
    walletAddress: "0x6e18753B910F2FD118f3E0A69c18F31DD81995A6",
    gender: "F",
    phone: "9814719844",
    age: 41,
    child: 2,
    group: "G",
    noOfAdults: 3,
    noOfChildren: 6,
  },
];

describe("Beneficiary Controller Test Cases", () => {
  it("should create a new Beneficiary", async () => {
    const beneficiary = await beneficiaryC.add(BeneficiaryToBeCreated);
    expect(beneficiary.name).toBe(BeneficiaryToBeCreated.name);
  });


  it("should update a new beneficiary", async () => {
    const beneficiary = await beneficiaryC.add(BeneficiaryToBeUpdated);
    console.log(beneficiary);
    expect(beneficiary.name).toBe(BeneficiaryToBeUpdated.name);
  });


  // it("should bulk add ", async () => {
  //   const beneficiary = await beneficiaryC.bulkAdd(BulkAdd);
  //   console.log(beneficiary);
  //   expect(beneficiary[0].name).toBe(BulkAdd[0].name);
  // });

  it("should list beneficiary", async () => {
    const beneficiaryList = await beneficiaryC.list();
    expect(Array.isArray(beneficiaryList)).toBe(true);
  });


  it("should getbyid", async () => {
    const beneficiaryGet = await beneficiaryC.getById(
      BeneficiaryToBeCreated.id
    );
    expect(beneficiaryGet.id).toBe(BeneficiaryToBeCreated.id);
  });


  it("should get count by group", async () => {
    const beneficiaryCount = await beneficiaryC.getBeneficiaryCountByGroup();
    const data = beneficiaryCount[0].dataValues;
    console.log(data);

    expect(data.count).toBe("2");
  });
  

  it("should get count by gender", async () => {
    const beneficiaryCount = await beneficiaryC.getBeneficiaryCountByGender();
    const data = beneficiaryCount[0].dataValues;
    console.log(data);
    expect(data.count).toBe("1");
  });
});
