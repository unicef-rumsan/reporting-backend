const Collection = require("../modules/collection/collection.controller");

const collectionToBeCreated = {
  name: "John Doe",
  description: "Description of the Collection",
  profileImage: "",
  coverImage: "",
  walletAddress: "0xba51dd6bc2eDd368DD824F61F406b0B0330029E5",
};

let collection;
describe("Collection Module Test", () => {
  it("should add a Collection", async () => {
    collection = await Collection.add({
      payload: collectionToBeCreated,
    });
    expect(collection.name).toBe(collectionToBeCreated.name);
    expect(collection.description).toBe(collectionToBeCreated.description);
    expect(collection.profileImage).toBe(collectionToBeCreated.profileImage);
    expect(collection.email).toBe(collectionToBeCreated.email);
    expect(collection.walletAddress).toBe(collectionToBeCreated.walletAddress);
  });

  it("should list all collection", async () => {
    const collectionsList = await Collection.list({
      query: {},
    });
    expect(collectionsList.total).toBeGreaterThan(0);
  });

  it("should get an collection by id", async () => {
    const params = {
      id: collection?.id,
    };
    const result = await Collection.getById({ params });
    expect(result.id).toBe(collection.id);
  });

  it("should update collection", async () => {
    const req = {
      params: {
        id: collection?.id,
      },
      payload: {
        name: "updated name",
      },
    };

    const result = await Collection.update(req);
    console.log("result :>> ", result);
    expect(result).toBe(true);
  });

  it("should delete collection", async () => {
    const params = {
      id: collection?.id,
    };
    const result = await Collection.remove({ params });
    expect(result).toBe(1);
  });
});
