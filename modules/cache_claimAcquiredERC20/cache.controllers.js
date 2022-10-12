const { AbstractController } = require("@rumsan/core/abstract");
const { EVENTS } = require("../../constants/appConstants");
const WSService = require("@rumsan/core/services/webSocket");
const {
  TransactionClaimERCCacheModel,
  BeneficiaryModel,
} = require("../models");
const { Op } = require("sequelize");
const getDifferentObject = require("../../helpers/utils/getDifferentObject");

module.exports = class extends AbstractController {
  constructor(options) {
    super(options);
    options.listeners = {};
    this.table = TransactionClaimERCCacheModel;
    this.tblBeneficiaries = BeneficiaryModel;
  }

  registrations = {
    add: (req) => this.add(req.payload),
    list: (req) => this.list(),
    bulkAdd: (req) => this.bulkAdd(req.payload),
    listByTxHashes: (req) => this.listByTxHashes(req.payload.txHashes),
    update: (req) => this.update(req.params.txHash, req.payload),
  };

  async add(payload) {
    try {
      let transaction = await this.table.create(payload);
      const beneficiaries = await this.tblBeneficiaries.findOne({
        where: {
          phone: transaction.phone,
        },
        raw: true,
        nest: true,
      });

      transaction = JSON.parse(JSON.stringify(transaction));

      WSService.broadcast(
        {
          ...transaction,
          name: beneficiaries.name,
        },
        "rahat_claimed"
      );
    } catch (err) {
      console.log(err);
    }
  }

  async bulkAdd(payload) {
    try {
      const transactionsList = await this.table.findAll({
        order: [["createdAt", "DESC"]],
      });
      // WSService.broadcast(payload, "rahat_claimed");
      const filtered = getDifferentObject(payload, transactionsList, "txHash");

      if (filtered.length === 0 || !filtered.length) {
        return "No new transactions";
      } else {
        let saved = await this.table.bulkCreate(filtered);

        saved = JSON.parse(JSON.stringify(saved));
        // saved = await this._replaceWithBeneficiaryName(saved);

        WSService.broadcast(saved, "rahat_claimed");
        return `${filtered.length} new transactions added`;
      }
    } catch (err) {
      console.log(err);
    }
  }

  async _replaceWithBeneficiaryName(list) {
    const phonesList = list.map((item) => item.phone);
    const beneficiaryList = await this.tblBeneficiaries.findAll({
      where: {
        phone: {
          [Op.in]: phonesList,
        },
      },
      raw: true,
    });

    const beneficiaryMapped = list
      .map((list) =>
        beneficiaryList.map((benef) => {
          return {
            name: benef.name,
            ...list,
          };
        })
      )
      .flatMap((e) => e);

    return beneficiaryMapped;
  }

  async list() {
    const list = await this.table.findAll({
      limit: 10,
      raw: true,
      order: [["timestamp", "DESC"]],
    });
    const beneficiaryMapped = await this._replaceWithBeneficiaryName(list);

    return list;
    // return beneficiaryMapped;
  }

  async listByTxHashes(txHashes) {
    const list = await this.table.findAll({
      where: {
        txHash: {
          [Op.in]: txHashes,
        },
        [Op.or]: [
          {
            mode: "unavailable",
          },
          {
            method: "unavailable",
          },
          {
            ward: 0,
          },
        ],
      },
      raw: true,
    });
    // const beneficiaryMapped = await this._replaceWithBeneficiaryName(list);

    return list;
  }
  async update(txHash, updateData) {
    const transaction = await this.table.update(updateData, {
      where: {
        txHash,
      },
    });
    return transaction;
  }
};
