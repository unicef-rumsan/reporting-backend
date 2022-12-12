const { reportApi, scripts, sourceApi } = require("./_common");

const beneficiariesMapping = (list) => {
  return list.map((item) => ({
    id: item.id,
    name: item.name,
    gender: item.gender,
    phone: item.phone,
    age: +item.extras?.age,
    child: +item.extras?.child,
    group: item.extras?.group,
    numOfAdults: +item.extras?.adult,
    numOfChildren: +item.extras?.child,
    walletAddress: item.wallet_address,
    projects: item.projects,
    agency: item.agency,
    ward: item.extras?.ward,
    familySize: +item.extras?.family_size,
    below5Count: +item.extras?.below5_count,
    below5Male: +item.extras?.below5_male,
    below5Female: +item.extras?.below5_female,
    below5_other: +item.extras?.below5_other,
    readSms: item.extras?.read_sms,
    hasPhone: item.extras?.phone_has,
    hasBank: item.extras?.bank_has,
    noLand: item.extras?.no_land,
    bank_withdraw: item.extras?.bank_withdraw,
    dailyWage: item.extras?.daily_wage,
    disability: item.extras?.disability,
    consentPicture: item.extras?.consent_picture,
    bankAccountNumber: item?.extras?.bank_account,
    mobilizer: item?.extras?.mobilizer,
  }));
};

const script = {
  async migrateBeneficiary() {
    console.log("Fetching Beneficaries");
    try {
      const beneficiaries = await sourceApi.get("/reports/beneficiaries");
      const beneficiaryData = beneficiariesMapping(beneficiaries.data);

      await reportApi.post("/beneficiaries/bulk", beneficiaryData);

      console.log("Beneficiaries bulk created");
    } catch (err) {
      console.error("Beneficiary Error: ", err?.response?.data);
    }
  },
};

(async () => {
  await scripts.migrateBeneficiary();
})();
