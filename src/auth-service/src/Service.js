import Base from "@lib/base";
import Captcha from "./lib/Captcha";
import Otp from "./lib/Otp";
import Server from "./lib/Server";
import Signin from "./lib/Signin";
import Signup from "./lib/Signup";
import GoogleAuth from "./lib/GoogleAuth";
import User from "./lib/User";
import Vat from "./lib/VatEU";
import Documents from "./lib/Documents";
import AuthOtp from "./lib/AuthOtp";

export default class Service extends Base {
  publicMethods() {
    return {
      resetServer: {
        realm: true,
        method: Server.reset
      },
      signup: {
        realm: true,
        method: Signup.signup,
        description: "Creating new user",
        schema: {
          type: "object",
          properties: {
            type: { type: "integer" },
            email: { type: "string" },
            first_name: { type: "string" },
            last_name: { type: "string" },
            middle_name: { type: "string" },
            birthday: { type: "string", format: "datetime" },
            country: { type: "string" },
            zip_addr1: { type: "string" },
            city_addr1: { type: "string" },
            street_addr1: { type: "string" },
            house_addr1: { type: "string" },
            apartment_addr1: { type: "string" },
            // password: { type: "string", minLength: 8 },
            token: { type: "string" },
            phone: { type: "string" },
            captcha: { type: "string" },
            citizenship: { type: "string" },
            gender: { type: "string" },
            legal_id: { type: "string" },
            person_function: { type: "string" }
          },
          required: [
            "type",
            "email",
            "first_name",
            "last_name",
            "middle_name",
            // "country",
            // "city_addr1",
            // "street_addr1",
            // "house_addr1",
            // "apartment_addr1",
            "birthday",
            // "password",
            "captcha"
          ]
        }
      },
      signin: {
        realm: true,
        method: Signin.signin,
        description: "Login",
        schema: {
          type: "object",
          properties: {
            login: { type: "string" },
            password: { type: "string" }
          },
          required: ["login", "password"]
        }
      },
      sendRestorePasswordCode: {
        realm: true,
        method: User.sendRestorePasswordCode,
        description: "send link to restore password",
        schema: {
          type: "object",
          properties: {
            email: { type: "string" }
          },
          required: ["email"]
        }
      },
      restorePassword: {
        realm: true,
        method: User.restorePassword,
        description: "restore password",
        schema: {
          type: "object",
          properties: {
            code: { type: "string" },
            new_password: { type: "string" }
          },
          required: ["code", "new_password"]
        }
      },
      checkGoogleAuth: {
        method: Signin.checkGoogleAuth,
        description: "checkGoogleAuth"
      },
      getCaptcha: {
        realm: true,
        method: Captcha.getCaptcha,
        description: "Getting captcha svg",
        schema: {
          type: "object",
          properties: {
            token: { type: "string" }
          },
          required: ["token"]
        }
      },
      checkCaptcha: {
        realm: true,
        method: Captcha.checkCaptcha,
        description: "Checking captcha text",
        schema: {
          type: "object",
          properties: {
            captcha: { type: "string" },
            token: { type: "string" }
          },
          required: ["token", "captcha"]
        }
      },
      permissedMethod: {
        realm: true,
        method: Server.permissedMethod,
        description: "Test permissions"
      },
      getServerByToken: {
        method: Server.getServerByToken,
        description: "Getting ServerId by authorization token"
      },
      getServerPermissions: {
        realm: true,
        method: Server.getServerPermissions,
        description: "Getting Server Permissions"
      },
      getPublicMethods: {
        method: Server.getPublicMethods,
        description: "Test public methods"
      },
      googleAuthGenerateQR: {
        realm: true,
        user: true,
        method: GoogleAuth.googleAuthGenerateQR,
        description: "googleAuthGenerateQR",
        schema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      googleAuthVerify: {
        realm: true,
        user: true,
        method: GoogleAuth.googleAuthVerify,
        description: "googleAuthVerify",
        schema: {
          type: "object",
          properties: {
            user_token: { type: "string" }
          },
          required: ["user_token"]
        }
      },
      enableDisableGoogleAuth: {
        realm: true,
        user: true,
        method: GoogleAuth.enableDisableGoogleAuth,
        description: "enableDisableGoogleAuth",
        schema: {
          type: "object",
          properties: {
            user_token: { type: "string" },
            status: { type: "boolean" }
          },
          required: ["user_token", "status"]
        }
      },
      getProfile: {
        realm: true,
        user: true,
        method: User.getProfile,
        description: "getProfile"
      },
      getAvatar: {
        realm: true,
        user: true,
        method: User.getAvatar,
        description: "getAvatar"
      },
      avatarUpload: {
        realm: true,
        user: true,
        method: User.avatarUpload,
        description: "avatarUpload",
        schema: {
          type: "object",
          properties: {
            files: {
              type: "array",
              items: {
                name: { type: "string" },
                data: { type: "string" }
              }
            }
          },
          required: ["files"]
        }
      },
      changePassword: {
        realm: true,
        user: true,
        otp: true,
        method: User.changePassword,
        description: "changePassword",
        schema: {
          type: "object",
          properties: {
            password: { type: "string" },
            new_password: { type: "string" }
          },
          required: ["password", "new_password"]
        }
      },
      changeSecretQuestion: {
        realm: true,
        user: true,
        method: User.changeSecretQuestion,
        description: "changeSecretQuestion",
        schema: {
          type: "object",
          properties: {
            secret_question: { type: "string" },
            secret_answer: { type: "string" }
          },
          required: ["secret_question", "secret_answer"]
        }
      },
      otp: {
        realm: true,
        user: false,
        method: Otp.setOtp,
        description: "Set OTP",
        schema: {
          type: "object",
          properties: {
            userId: { type: "string" }
          },
          required: ["userId"]
        }
      },
      checkOtp: {
        realm: true,
        user: true,
        method: Otp.check,
        description: "Checking one time password",
        schema: {
          type: "object",
          properties: {
            otp: { type: "string" }
          },
          required: ["otp"]
        }
      },
      resendOtp: {
        realm: true,
        user: true,
        method: Otp.resendOtp,
        description: "Resend one time password"
      },
      getUserByEmail: {
        realm: true,
        method: User.getByEmail,
        description: "Get user by e-mail",
        schema: {
          type: "object",
          properties: {
            email: { type: "string" }
          },
          required: ["email"]
        }
      },
      getUserKycStatus: {
        realm: true,
        description: "Get user kyc",
        method: User.getKyc,
        schema: {
          type: "object",
          properties: {
            id: { type: "string" }
          },
          required: ["id"]
        }
      },
      saveIP: {
        realm: true,
        user: true,
        method: User.saveIP,
        description: "add or delete IP",
        schema: {
          type: "array"
        }
      },
      updateProfile: {
        realm: true,
        user: true,
        method: User.updateProfile,
        description: "update user profile",
        schema: {
          type: "object",
          properties: {
            first_name: { type: "string" },
            last_name: { type: "string" }
          }
        }
      },
      changeToCorporate: {
        realm: true,
        user: true,
        method: User.changeToCorporate,
        description: "change to corporate"
      },
      getReferals: {
        realm: true,
        user: true,
        method: User.getReferals,
        description: "get referals",
        schema: {
          type: "object",
          properties: {
            start: { type: "integer" },
            limit: { type: "integer" }
          }
        }
      },
      activate: {
        realm: true,
        method: Signup.activate,
        description: "activate profile",
        schema: {
          type: "object",
          properties: {
            user_id: { type: "string" },
            code: { type: "string" }
          },
          required: ["user_id", "code"]
        }
      },
      acceptCookie: {
        realm: true,
        user: true,
        method: User.acceptCookie,
        description: "accept cookie"
      },
      verifyPhone: {
        realm: true,
        user: false,
        method: Signup.verifyPhone,
        description: "Phone verification: send code",
        schema: {
          type: "object",
          properties: {
            phone: { type: "string" },
            captcha: { type: "string" },
            token: { type: "string" }
          },
          required: ["phone", "captcha", "token"]
        }
      },
      checkPhoneCode: {
        realm: true,
        user: false,
        method: Signup.checkPhoneCode,
        description: "Phone verification: check code",
        schema: {
          type: "object",
          properties: {
            code: { type: "string" },
            user_id: { type: "string" },
            token: { type: "string" }
          },
          required: ["code", "user_id", "token"]
        }
      },
      verifyEmail: {
        realm: true,
        user: false,
        method: Signup.verifyEmail,
        description: "Email verification: send code",
        schema: {
          type: "object",
          properties: {
            email: { type: "string" },
            captcha: { type: "string" },
            token: { type: "string" }
          },
          required: ["email", "captcha", "token"]
        }
      },
      checkEmailCode: {
        realm: true,
        user: false,
        method: Signup.checkEmailCode,
        description: "Email verification: check code",
        schema: {
          type: "object",
          properties: {
            code: { type: "string" },
            user_id: { type: "string" },
            token: { type: "string" }
          },
          required: ["code", "user_id", "token"]
        }
      },
      verifyPassword: {
        realm: true,
        user: false,
        method: Signup.verifyPassword,
        description: "Password verification",
        schema: {
          type: "object",
          properties: {
            password: { type: "string" },
            user_id: { type: "string" },
            token: { type: "string" }
          },
          required: ["password", "user_id", "token"]
        }
      },

      uploadDocument: {
        realm: true,
        user: true,
        method: Documents.uploadDocument,
        description: "Upload document",
        schema: {
          type: "object",
          properties: {
            type: { type: "string" },
            status: { type: "integer" },
            files: {
              type: "array",
              items: {
                name: { type: "string" },
                code: { type: "string" }
              }
            }
          },
          required: ["type"]
        }
      },
      getUserDocuments: {
        realm: true,
        user: true,
        method: Documents.getUserDocuments,
        description: "Get user documents"
      },
      updateDocument: {
        realm: true,
        user: true,
        method: Documents.updateDocument,
        description: "Update document from admin portal",
        schema: {
          type: "object",
          properties: {
            id: { type: "string" },
            type: { type: "string" },
            status: { type: "integer" },
            files: {
              type: "array",
              items: {
                name: { type: "string" },
                code: { type: "string" }
              }
            }
          },
          required: ["id", "type", "status", "files"]
        }
      },
      didUserSignedFramedAgreement: {
        realm: true,
        user: true,
        method: User.didUserSignedFramedAgreement,
        description: "Did user signed framed agreement"
      },
      changePhone: {
        realm: true,
        user: true,
        otp: true,
        method: User.changePhone,
        description: "Change phone number",
        schema: {
          type: "object",
          properties: {
            new_phone: { type: "string" }
          },
          required: ["new_phone"]
        }
      },
      confirmPassword: {
        realm: true,
        user: true,
        method: User.confirmPassword,
        description: "Confirm user password",
        schema: {
          type: "object",
          properties: {
            password: { type: "string" }
          },
          required: ["password"]
        }
      },
      sendNewEmailVerifyLink: {
        realm: true,
        user: true,
        otp: true,
        method: User.sendNewEmailVerifyLink,
        description: "Send link to verify new email",
        schema: {
          type: "object",
          properties: {
            new_email: { type: "string" }
          },
          required: ["new_email"]
        }
      },
      changeEmail: {
        realm: true,
        method: User.changeEmail,
        description: "Change email",
        schema: {
          type: "object",
          properties: {
            code: { type: "string" }
          },
          required: ["code"]
        }
      },
      getWhiteListCountries: {
        realm: true,
        method: User.getWhiteListCountries,
        description: "Get white list countries",
        schema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      setPassword: {
        realm: true,
        user: true,
        method: Signin.setPassword,
        description: "Phone verification: send code",
        schema: {
          type: "object",
          properties: {
            password: { type: "string" }
          },
          required: ["password"]
        }
      },
      sendTempPassToUser: {
        realm: true,
        method: Signin.sendTempPassToUser,
        description: "Generating and sending temporary password to user",
        schema: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string" }
          },
          required: ["id", "email"]
        }
      },
      checkVAT: {
        realm: true,
        description: "Check VAT number",
        method: Vat.checkVAT,
        schema: {
          type: "object",
          properties: {
            vat_num: { type: "string" },
            country_code: { type: "string" }
          },
          required: ["vat_num", "country_code"]
        }
      },
      checkMultipleVATs: {
        realm: true,
        description: "Check multiple VATs numbers from merchants",
        method: Vat.checkMultipleVATs,
        schema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      signout: {
        realm: true,
        user: true,
        method: Signin.signout,
        description: "Sign out from UI",
        schema: {
          type: "object",
          properties: {
            token: { type: "string" }
          },
          required: ["token"]
        }
      },
      getSystemNotifications: {
        realm: true,
        description: "Geting system notifications",
        method: User.getSystemNotifications,
        schema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      getUserSession: {
        private: true,
        description: "Login under client",
        method: User.getUserSession,
        schema: {
          type: "object",
          properties: {
            user_id: { type: "string" }
          },
          required: ["user_id"]
        }
      },
      closeUserSessions: {
        private: true,
        description: "Close all user sessions",
        method: User.closeUserSessions,
        schema: {
          type: "object",
          properties: {
            user_id: { type: "string" }
          },
          required: ["user_id"]
        }
      },
      setPermanentPassword: {
        realm: true,
        description: "Set permanent user password and send session token",
        method: Signin.setPermanentPassword,
        schema: {
          type: "object",
          properties: {
            otp_token: { type: "string" },
            password: { type: "string" }
          },
          required: ["otp_token", "password"]
        }
      },
      checkAuthOtp: {
        realm: true,
        description: "Check OTP on authorization",
        method: AuthOtp.checkAuthOtp,
        schema: {
          type: "object",
          properties: {
            otp: { anyOf: [{ type: "integer" }, { type: "string" }] },
            otp_token: { type: "string" }
          },
          required: ["otp", "otp_token"]
        }
      },
      resendAuthOtp: {
        realm: true,
        description: "Resend OTP on authorization",
        method: AuthOtp.resendAuthOtp,
        schema: {
          type: "object",
          properties: {
            otp_token: { type: "string" },
            channel: { type: "string" }
          },
          required: ["otp_token", "channel"]
        }
      },
      comparePasswords: {
        realm: true,
        user: true,
        method: User.comparePasswords,
        description: "Compare passwords before change",
        schema: {
          type: "object",
          properties: {
            password: { type: "string" }
          },
          required: ["password"]
        }
      },
      changeOtpChannel: {
        realm: true,
        user: true,
        method: Otp.changeOtpChannel,
        description: "Change OTP channel",
        schema: {
          type: "object",
          properties: {
            channel: { type: "string" }
          },
          required: ["channel"]
        }
      },
      checkEmailForExist: {
        realm: true,
        user: true,
        method: User.checkEmailForExist,
        description: "Check email before change",
        schema: {
          type: "object",
          properties: {
            new_email: { type: "string" }
          },
          required: ["new_email"]
        }
      },
      updateSystemNotificationsStatus: {
        private: true,
        method: User.updateSystemNotificationsStatus,
        schema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      sendMessageToRecipients: {
        private: true,
        method: User.sendMessageToRecipients,
        schema: {
          type: "object",
          properties: {
            letter_data: { type: ["object", "array"] },
            sorce: { type: "string" }
          },
          required: []
        }
      },
      sendNotificationToTheUser: {
        private: true,
        method: User.sendNotificationToTheUser,
        schema: {
          type: "object",
          properties: {
            code: { type: "string" },
            recipient: { type: "string" },
            body: { type: "object" }
          }
        },
        required: ["code", "recipient"]
      },

      getSystemNotificationsList: {
        user: true,
        realm: true,
        method: User.getSystemNotificationsList,
        description: "Get list of user's system notifications",
        schema: {
          type: "object",
          properties: {
            start: { anyOf: [{ type: "integer" }, { type: "string" }] },
            limit: { anyOf: [{ type: "integer" }, { type: "string" }] }
          }
        }
      },
      markAsReadedSystemNotificationsList: {
        user: true,
        realm: true,
        method: User.markAsReadedSystemNotificationsList,
        description: "Mark system notifications as readed",
        schema: {
          type: "object",
          properties: {
            list: {
              type: "array",
              items: {
                type: "string"
              }
            }
          },
          required: ["list"]
        }
      },
      removeSystemNotifications: {
        private: true,
        method: User.removeSystemNotifications,
        description: "System method for bulk deleting system notifications",
        schema: {
          type: "object",
          properties: {
            parent_id: { type: "array" }
          },
          required: ["parent_id"]
        }
      },
      removeSystemNotification: {
        user: true,
        realm: true,
        method: User.removeSystemNotification,
        description: "Delete system notification",
        schema: {
          type: "object",
          properties: {
            notification_id: { type: "string" }
          },
          required: ["notification_id"]
        }
      },
      getTelegramChannels: {
        user: true,
        realm: true,
        method: User.getTelegramChannels,
        description: "Get user's telegram channels",
        schema: {
          type: "object",
          properties: {},
          required: []
        }
      }
    };
  }
}
