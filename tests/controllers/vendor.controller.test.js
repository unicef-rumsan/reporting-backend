const { db } = require("../jest.setup");
const vendorController = require("../../modules/vendor/vendor.controller");

const vendorC = new vendorController({ db });

const addVendor = {
  id: "0x064e0f1cf92b93af161e42f60bc5cb1fac0a0cdv2d2727c274cu70f74f35dadf",
  name: "test",
  gender: "M",
  phone: "12345678",
  wallet_address: "0x5e18753B910F2FD118f3E0A69c18F31DD81995A5",
  gov_id: "dd12",
  agencies: [{ name: "test-agency", agec1: "test1", agec2: "test2" }],
};

const BulkAdd = [
  {
    id: "0x063e0f1cf92b93af161e42f60bc5cb1fac0a0cdb2d2727c274cu70f74f35dadf",
    name: "test",
    gender: "M",
    phone: "12345678",
    wallet_address: "0x5e18753B910F2FD118f3E0A69c18F31DD81995A5",
    gov_id: "dd12",
    agencies: [{ name: "test-agency", agec1: "test1", agec2: "test2" }],
  },
  {
    id: "0x064e9f1cf92b93af161e42f60bc5cb1fac0a0cdb2d2727c274cu70f74f35dadf",
    name: "test",
    gender: "M",
    phone: "12345678",
    wallet_address: "0x5e18753B910F2FD118f3E0A69c18F31DD81995A5",
    gov_id: "dd12",
    agencies: [{ name: "test-agency", agec1: "test1", agec2: "test2" }],
  },
  {
    id: "0x064e0t1cf92b93af161e42f60bc5cb1fac0a0cdb2d2727c274cu70f74f35dadf",
    name: "test",
    gender: "M",
    phone: "12345678",
    wallet_address: "0x5e18753B910F2FD118f3E0A69c18F31DD81995A5",
    gov_id: "dd12",
    agencies: [{ name: "test-agency", agec1: "test1", agec2: "test2" }],
  },
];

describe("vendorController test cases ", () => {
  it("vendor add", async () => {
    const vendor = await vendorC.add(addVendor);
    expect(vendor.name).toBe(addVendor.name);
  });

  it(" should bulk add vendor", async () => {
    const vendor = await vendorC.bulkAdd(BulkAdd);
    expect(vendor[0].name).toBe(BulkAdd[0].name);
    expect(vendor[0].id).toBe(BulkAdd[0].id);
  });

  it("should list vendor", async () => {
    const vendor = await vendorC.list();
    expect(Array.isArray(vendor)).toBe(true);
  });

  it("should getById vendor", async () => {
    const vendor = await vendorC.getById(addVendor.id);
    expect(vendor.id).toBe(addVendor.id);
  });
});
