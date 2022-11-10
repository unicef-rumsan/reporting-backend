const { db } = require("../jest.setup");
const cacheController = require("../../modules/cache_claimAcquiredERC20/cache.controllers");

const cacheC = new cacheController({ db });

const addCache = {
  id: "0x064e9f1cf92b93af161e42f60bc5cb1fac0a0cdb2d2727c274ce70f64f35dadf",
  txHash: "0x0b18753B910F2FD118f3E0A69c18F31DD81995A5",
  blockNumber: "4e0g1cf92b93ff161e42f60bc5cb1fac0a0cdb2d2727c274ce70f64f35dadf",
  vendor: "test",
  amount: 90889900,
  phone: "9873662",
  ward: 2,
  timestamp: "2018-02-27 15:35:20.311",
  year: "2022",
  method: "sms",
  mode: "online",
};

const BulkAdd = [
  {
    id: "0x064e9f1cf92b93af161e42f60bc5cb1fac0a0cdb2d2727c274ce70f64f35dadf",
    txHash: "0x0b18753B910F2FD118f3E0A69c18F31DD81995A5",
    blockNumber:
      "4e0g1cf92b93ff161e42f60bc5cb1fac0a0cdb2d2727c274ce70f64f35dadf",
    vendor: "test",
    amount: 90889900,
    phone: "9873662",
    ward: 2,
    timestamp: "2018-02-27 15:35:20.311",
    year: "2022",
    method: "sms",
    mode: "online",
  },
  {
    id: "0x064e9f1cf92b93af161e42f60bc5cb1fac0a0cdb2d2727c274ce70f64f35dadf",
    txHash: "0x0b18753B910F2FD118f3E0A69c18F31DD81995A5",
    blockNumber:
      "4e0g1cf92b93ff161e42f60bc5cb1fac0a0cdb2d2727c274ce70f64f35dadf",
    vendor: "test",
    amount: 90889900,
    phone: "9873662",
    ward: 2,
    timestamp: "2018-02-27 15:35:20.311",
    year: "2022",
    method: "sms",
    mode: "online",
  },
  {
    id: "0x064e9f1cf92b93af161e42f60bc5cb1fac0a0cdb2d2727c274ce70f64f35dadf",
    txHash: "0x0b18753B910F2FD118f3E0A69c18F31DD81995A5",
    blockNumber:
      "4e0g1cf92b93ff161e42f60bc5cb1fac0a0cdb2d2727c274ce70f64f35dadf",
    vendor: "test",
    amount: 90889900,
    phone: "9873662",
    ward: 2,
    timestamp: "2018-02-27 15:35:20.311",
    year: "2022",
    method: "sms",
    mode: "online",
  },
];

describe("cache clam test cases ", () => {
  it("should add cache", async () => {
    const cache = await cacheC.add(addCache);
    expect(cache.txHash).toBe(addCache.txHash);
  });
});
