const { db } = require("../jest.setup");
const BeneficiaryController = require("../../modules/beneficiary/beneficiary.controller");
const beneficiaryC = new BeneficiaryController({ db });

const BeneficiaryToBeCreated = {
  id: "0x064e0f1cf92b93af161e42f60bc5cb1fac0a0cdb2d2727c274ce70f64f35dadf",
  name: "Kelli Rempel",
  wallet_address: "0x6e18753B910F2FD118f3E0A69c18F31DD81995A5",
  gender: "M",
  phone: "9814719844",
  age: 41,
  child: 2,
  group: "G",
};

const BeneficiaryToBeUpdated = {
  name: "Kelli Rempel Update",
  wallet_address: "0x6e18753B910F2FD118f3E0A69c18F31DD81995A6",
  gender: "F",
  phone: "9814719844",
  age: 41,
  child: 2,
  group: "G",
};

describe("Beneficiary Controller Test Cases", () => {
  it("should create a new Beneficiary", async () => {
    const beneficiary = await beneficiaryC.add(BeneficiaryToBeCreated);
    expect(beneficiary.name).toBe(BeneficiaryToBeCreated.name);
  });
});
