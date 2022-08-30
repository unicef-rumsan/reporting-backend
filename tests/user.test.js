const userController = require("../modules/user/user.controllers");
const WalletUtils = require("../helpers/utils/wallet-utils");

const userToCreate = {
  email: `example${Math.floor(Math.random() * 100)}@example.com`,
  name: "Ram Parsad",
  username: `user${Math.floor(Math.random() * 100)}`,
};

const auth_signature =
  "1657002446156.0xc1dc0fa038c68d98f80434a536b3f399d2ae99384c2f4b3ff873b77b19a58ee4.0xcf977302c031aaeead082a32ada5d3a4b6bfae9e3e6217e3ee3e601132f59ab303667800cb64bfdb6868b946bfd542f69abb86708c1982b921ffc90c3c782d761b";
// const walletAddress = async (auth_signature) =>
// await WalletUtils.getAddressFromSignature(auth_signature);

describe("User Controller tests", function () {
  // it("should add a user", async () => {
  //   const user = await userController.register({
  //     payload: { ...userToCreate },
  //   });
  //   expect(user.email).toBe(userToCreate.email);
  //   expect(user.name).toBe(userToCreate.name);
  //   expect(user.username).toBe(userToCreate.username);
  // });

  it("should register a user with a wallet address", async () => {
    const user = await userController.walletRegister({
      payload: { ...userToCreate, auth_signature },
    });
    // console.log("user", user);
    // const walletAddressGiven = await walletAddress(auth_signature);
    // expect(user.wallet_address).toBe(await walletAddress(walletAddressGiven));
    expect(user.wallet_address).toBeDefined();
  });

  it("should login a user using wallet address", async () => {
    const user = await userController.walletLogin({
      payload: {
        auth_signature,
      },
      headers: {},
    });
    expect(user.token).toBeDefined();
  });
});
