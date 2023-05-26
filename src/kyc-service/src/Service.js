import Base from "@lib/base";
import FileProvider from "@lib/fileprovider";
import KYC from "./lib/kyc_methods";

export default class Service extends Base {
  publicMethods() {
    return {
      serviceDescription: {},
      checkPushedFile: {
        realm: true,
        method: this.checkPushedFile,
        description: "checkPushedFile",
        schema: {
          type: "object",
          properties: {
            files: {
              type: "array",
              items: {
                name: { type: "string" },
                data: { type: "string" },
              },
            },
          },
          required: ["files"],
        },
      },
      pushFile: {
        method: this.pushFile,
        description: "push file method",
        schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            data: { type: "string" },
          },
          required: ["name", "data"],
        },
      },
      pullFile: {
        method: this.pullFile,
        description: "pull file method",
        schema: {
          type: "object",
          properties: {
            code: { type: "string" },
          },
          required: ["code"],
        },
      },
      delFile: {
        method: this.delFile,
        description: "delete file method",
        schema: {
          type: "object",
          properties: {
            code: { type: "string" },
          },
          required: ["code"],
        },
      },
      acceptFile: {
        method: this.acceptFile,
        description: "accept files method",
      },
      statusFile: {
        method: this.statusFile,
        description: "status files method",
        schema: {
          type: "object",
          properties: {
            code: { type: "string" },
          },
          required: ["code"],
        },
      },
      watermarkFile: {
        method: this.watermarkFile,
        description: "watermark files method",
        schema: {
          type: "object",
          properties: {
            code: { type: "string" },
          },
          required: ["code"],
        },
      },
      saveProfileKYC: {
        realm: true,
        user: true,
        method: KYC.saveProfileKYC,
        description: "save profile data method",
        schema: {
          type: "object",
          properties: {
            first_name: { type: "string" },
            middle_name: { type: "string" },
            last_name: { type: "string" },
            issue_date: { type: "string" },
            doc_num: { type: "integer" },
            doc_type: { type: "string" },
            files: {
              type: "array",
              items: {
                name: { type: "string" },
                data: { type: "string" },
              },
            },
          },
          required: [
            "first_name",
            "middle_name",
            "last_name",
            "issue_date",
            "doc_num",
            "doc_type",
            "files",
          ],
        },
      },
      saveAddressKYC: {
        realm: true,
        user: true,
        method: KYC.saveAddressKYC,
        description: "save address data method",
        schema: {
          type: "object",
          properties: {
            country: { type: "string" },
            state: { type: "string" },
            city: { type: "string" },
            zip_code: { type: "integer" },
            address_type: { type: "string" },
            doc_type: { type: "string" },
            issue_date: { type: "string" },
            files: {
              type: "array",
              items: {
                name: { type: "string" },
                data: { type: "string" },
              },
            },
          },
          required: [
            "country",
            "state",
            "city",
            "zip_code",
            "address_type",
            "doc_type",
            "issue_date",
            "files",
          ],
        },
      },
      saveCompanyKYC: {
        realm: true,
        user: true,
        method: KYC.saveCompanyKYC,
        description: "save company data method",
        schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            registrar_name: { type: "string" },
            tax_number: { type: "integer" },
            business_type: { type: "string" },
            registration_number: { type: "integer" },
            registration_country: { type: "string" },
            registration_date: { type: "string" },
            years_in_business: { type: "integer" },
            numbers_of_employees: { type: "string" },
            incorporation_form: { type: "string" },
            date_of_last_financial_activity_report: { type: "string" },
            use_trade_licence: { type: "string" },
            directors: { type: "string" },
            shareholders: { type: "string" },
            beneficial_owner: { type: "string" },
            phone: { type: "string" },
            files: {
              type: "array",
              items: {
                name: { type: "string" },
                data: { type: "string" },
              },
            },
          },
          required: [
            "name",
            "registrar_name",
            "tax_number",
            "business_type",
            "registration_number",
            "registration_country",
            "registration_date",
            "years_in_business",
            "numbers_of_employees",
            "incorporation_form",
            "date_of_last_financial_activity_report",
            "use_trade_licence",
            "directors",
            "shareholders",
            "beneficial_owner",
            "phone",
            "files",
          ],
        },
      },
      rejectProfileKYC: {
        realm: true,
        user: true,
        method: KYC.rejectProfileKYC,
        description: "reject profile method",
        schema: {
          type: "object",
          properties: {
            id: { type: "string" },
            user_kyc_id: { type: "string" },
          },
          required: ["id", "user_kyc_id"],
        },
      },
      rejectAddressKYC: {
        realm: true,
        user: true,
        method: KYC.rejectAddressKYC,
        description: "reject address method",
        schema: {
          type: "object",
          properties: {
            id: { type: "string" },
            user_kyc_id: { type: "string" },
          },
          required: ["id", "user_kyc_id"],
        },
      },
      rejectCompanyKYC: {
        realm: true,
        user: true,
        method: KYC.rejectCompanyKYC,
        description: "reject company method",
        schema: {
          type: "object",
          properties: {
            id: { type: "string" },
            user_kyc_id: { type: "string" },
          },
          required: ["id", "user_kyc_id"],
        },
      },
      resolveProfileKYC: {
        realm: true,
        user: true,
        method: KYC.resolveProfileKYC,
        description: "resolve profile method",
        schema: {
          type: "object",
          properties: {
            id: { type: "string" },
            user_kyc_id: { type: "string" },
          },
          required: ["id", "user_kyc_id"],
        },
      },
      resolveAddressKYC: {
        realm: true,
        user: true,
        method: KYC.resolveAddressKYC,
        description: "resolve address method",
        schema: {
          type: "object",
          properties: {
            id: { type: "string" },
            user_kyc_id: { type: "string" },
          },
          required: ["id", "user_kyc_id"],
        },
      },
      resolveCompanyKYC: {
        realm: true,
        user: true,
        method: KYC.resolveCompanyKYC,
        description: "resolve company method",
        schema: {
          type: "object",
          properties: {
            id: { type: "string" },
            user_kyc_id: { type: "string" },
          },
          required: ["id", "user_kyc_id"],
        },
      },
      legalConfirmation: {
        realm: true,
        user: true,
        method: KYC.legalConfirmation,
        description: "legalConfirmation",
      },
      generateVerificationCode: {
        realm: true,
        user: true,
        method: KYC.generateVerificationCode,
        description: "generateVerificationCode",
      },
      verifyPhone: {
        realm: true,
        user: true,
        method: KYC.verifyPhone,
        description: "verifyPhone",
        schema: {
          type: "object",
          properties: { code: { type: "string" } },
          required: ["code"],
        },
      },
      sendCode: {
        realm: true,
        user: true,
        method: KYC.sendCode,
        description: "sendCode",
      },
      verifyEmail: {
        realm: true,
        user: true,
        method: KYC.verifyEmail,
        description: "verifyEmail",
      },
      getPublicMethods: {
        realm: true,
        description: "getPublicMethods",
      },
    };
  }

  async pushFile(data) {
    return await FileProvider.push(data, 300);
  }
  async pullFile(code) {
    return await FileProvider.pull(code);
  }
  async delFile(code) {
    return await FileProvider.del(code);
  }
  async acceptFile(code) {
    return await FileProvider.accept(code);
  }
  async statusFile(code) {
    return await FileProvider.status(code);
  }
  async watermarkFile(code) {
    return await FileProvider.watermarkFile(code);
  }

  // needed for integration test
  async checkPushedFile(data) {
    //console.log("checkPushedFile:");

    return { files: data.files };
  }
}
