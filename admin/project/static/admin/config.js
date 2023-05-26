__CONFIG__ = {
  FirstRedirect: "Crm.modules.finance.view.DashboardGrid",

  LoginUrl: "/Crm.Admin.login/",

  LoginTwoFactorUrl: "/Crm.Admin.loginStepTwo/",

  MainToolbar: "main.MainToolbar",

  LogoText: D.t("Payment system"),

  NavigationTree: [
    {
      text: "Finance",
      iconCls: "x-fa fa-tachometer-alt",
      children: [
        {
          text: "Dashboard",
          view: "Crm.modules.finance.view.DashboardGrid",
          iconCls: "x-fa fa-tachometer-alt"
        },
        {
          text: "Reports settings",
          view: "Crm.modules.finance.view.ReportSettingsGrid",
          iconCls: "x-fa fa-cog"
        }
      ]
    },
    {
      text: "Orders",
      iconCls: "x-fa fa-money-bill-alt",
      children: [
        {
          text: "Currency exchange orders",
          view: "Crm.modules.orders.view.WCNOrderGrid",
          iconCls: "x-fa fa-money-bill-wave"
        },
        {
          text: "Orders",
          view: "Crm.modules.orders.view.OrdersGrid",
          iconCls: "x-fa fa-money-bill"
        },
        {
          text: "Inner transfer",
          view:
            "Crm.modules.independentTransfers.view.IndependentNotApprovedTransfersGrid",
          iconCls: "x-fa fa-exchange-alt"
        }
      ]
    },
    {
      text: "Transfers",
      iconCls: "x-fa fa-money-bill-alt",
      rowCls: "nav-tree-badge nav-tree-badge-new",
      children: [
        {
          text: "Transfers (old)",
          iconCls: "x-fa fa-money-bill-alt",
          view: "Crm.modules.transfers.view.TransfersGrid"
        },
        {
          text: "Transfers",
          iconCls: "x-fa fa-money-bill-alt",
          view: "Crm.modules.transfers.view.SimpleTransfersGrid"
        },
        {
          text: "Transfers by plan",
          iconCls: "x-fa fa-money-bill-alt",
          view: "Crm.modules.transfers.view.TransfersByPlanGrid"
        },
        {
          text: "Deposit Imports",
          view: "Crm.modules.depositImports.view.depositImportsGrid",
          iconCls: "x-fa fa-download"
        },
        {
          text: "Manual crypto transfer",
          view: "Crm.modules.crypto.view.SendForm",
          withoutHashChange: true,
          iconCls: "x-fa fa-money-bill-alt"
        },
        {
          text: "Daily balance report",
          view: "Crm.modules.dailyBalances.view.dailyBalancesGrid",
          iconCls: "x-fa fa-list"
        },
        {
          text: "Approved transfers",
          view: "Crm.modules.transfers.view.ApprovedTransfersGrid",
          iconCls: "x-fa fa-check-circle"
        }
      ]
    },
    {
      text: "Clients",
      view: "Crm.modules.accountHolders.view.ActiveUsersGrid",
      iconCls: "x-fa fa-users"
    },
    {
      text: "All clients",
      view: "Crm.modules.accountHolders.view.UsersGrid",
      iconCls: "x-fa fa-users"
    },
    {
      text: "Merchants",
      view: "Crm.modules.merchants.view.ViewMerchantsGrid",
      iconCls: "x-fa fa-users"
    },
    // {
    //   text: "NIL",
    //   view: "Crm.modules.nil.view.TXHistoryGrid",
    //   iconCls: "x-fa fa-bank"
    // },
    {
      text: "NIL",
      iconCls: "x-fa fa-dollar-sign",
      rowCls: "nav-tree-badge nav-tree-badge-new",
      children: [
        {
          text: "Transactions History",
          iconCls: "x-fa fa-history",
          view: "Crm.modules.nil.view.TXHistoryGrid"
        },
        {
          text: "Rates History",
          iconCls: "x-fab fa-stack-exchange",
          view: "Crm.modules.nilRatesHistory.view.NilRatesHistoryForm"
        },
        {
          text: "Logs",
          iconCls: "x-fa fa-eye",
          view: "Crm.modules.nilLogs.view.nilLogsGrid"
        }
      ]
    },

    {
      text: "Tariffs",
      iconCls: "x-fa fa-list",
      children: [
        {
          text: "Plans",
          view: "Crm.modules.tariffs.view.PlansGrid",
          iconCls: "x-fa fa-list"
        },
        /* {
          text: "Base tariffs",
          view: "Crm.modules.tariffs.view.EasySettingsGrid",
          iconCls: "x-fa fa-list"
        },*/
        {
          text: "Tariffs",
          view: "Crm.modules.tariffs.view.TariffsGrid",
          iconCls: "x-fa fa-list"
        },
        {
          text: "Triggers",
          view: "Crm.modules.tariffs.view.TriggersGrid",
          iconCls: "x-fa fa-bell"
        },
        {
          text: "Views",
          view: "Crm.modules.viewset.view.ViewsetGrid",
          iconCls: "x-fa fa-eye"
        },
        {
          text: "Tests",
          view: "Crm.modules.tariffs.view.TestsGrid",
          iconCls: "x-fa fa-wrench"
        },
        {
          text: "Accounts plan",
          view: "Crm.modules.accountsPlan.view.PlansGrid",
          iconCls: "x-fa fa-wrench"
        }
      ]
    },
    {
      text: "Reports",
      iconCls: "x-fa fa-folder",
      children: [
        {
          text: "Data record",
          iconCls: "x-fa fa-list",
          view: "Crm.modules.reports.view.ReportsGrid"
        },
        {
          text: "Reports queue",
          iconCls: "x-fa fa-list",
          view: "Crm.modules.reports.view.ReportsQueueGrid"
        }
      ]
    },
    {
      text: "Directories",
      iconCls: "x-fa fa-puzzle-piece",
      children: [
        {
          text: "Realms",
          view: "Crm.modules.realm.view.RealmGrid",
          iconCls: "x-fa fa-venus-mars"
        },
        {
          text:"Managers",
          view:"Crm.modules.managers.view.ManagersGrid",
          iconCls:"x-fa fa-user-tie"
        },
        // {
        //   text: "Departments",
        //   view: "Crm.modules.merchants.view.RealmDepartmentGrid",
        //   iconCls: "x-fa fa-list"
        // },
        // {
        //   text: "Banks",
        //   view: "Crm.modules.banks.view.BanksGrid",
        //   iconCls: "x-fa fa-university"
        // },
        // {
        //   text: "Directory Banks",
        //   view: "Crm.modules.banks.view.DirectoryBanksGrid",
        //   iconCls: "x-fa fa-list"
        // },
        // {
        //   text: "Accounts",
        //   view: "Crm.modules.accounts.view.AccountsGrid",
        //   iconCls: "x-fa fa-credit-card"
        // },
        {
          text: "Accounts & Addresses",
          view: "Crm.modules.accounts.view.AccountsWithGasGrid",
          iconCls: "x-fa fa-credit-card"
        },
        {
          text: "All addresses",
          view: "Crm.modules.allAddresses.view.AllAddressesGrid",
          iconCls: "x-fa fa-credit-card"
        },
        // {
        //   text: "VAT",
        //   view: "Crm.modules.vat.view.VatLogsForm",
        //   iconCls: "x-fa fa-check",
        //   withoutHashChange: true
        // },
        {
          text: "Off-system addresses",
          view: "Crm.modules.nonCustodialWallets.view.WalletsGrid",
          iconCls: "x-fa fa-credit-card"
        },
        {
          text: "Chain of wallets",
          view: "Crm.modules.chainOfWallets.view.WalletsGrid",
          iconCls: "x-fa fa-link"
        },
        {
          text: "Currency",
          iconCls: "x-fa fa-dollar-sign",
          children: [
            {
              text: "Currency list",
              iconCls: "x-fa fa-list",
              view: "Crm.modules.currency.view.CurrencyGrid"
            },
            {
              text: "Currency rates",
              iconCls: "x-fa fa-dollar-sign",
              view: "Crm.modules.currency.view.CurrencyRateGrid"
            }
          ]
        } /*,
        {
          text: "Tech accounts",
          view: "Crm.modules.accounts.view.RealmAccountsGrid",
          iconCls: "x-fa fa-credit-card"
        }*/
      ]
    },

    /*{
      text: "KYC",
      iconCls: "x-fa fa-check",
      children: [
        {
          text: "Address",
          view: "Crm.modules.kyc.view.AddressGrid",
          iconCls: "x-fa fa-list"
        },
        {
          text: "Company",
          view: "Crm.modules.kyc.view.CompanyGrid",
          iconCls: "x-fa fa-list"
        },
        {
          text: "Profile",
          view: "Crm.modules.kyc.view.ProfileGrid",
          iconCls: "x-fa fa-user"
        }
      ]
    },*/

    {
      text: "Support",
      view: "Crm.modules.support.view.SupportGrid",
      iconCls: "x-fa fa-question"
    },
    {
      text: "Settings",
      iconCls: "x-fa fa-wrench",
      children: [
        {
          text: "Admins",
          view: "Crm.modules.users.view.UsersGrid",
          iconCls: "x-fa fa-users"
        },
        {
          text: "Groups",
          view: "Crm.modules.users.view.GroupsGrid",
          iconCls: "x-fa fa-users-cog"
        },
        {
          text: "Client roles",
          view: "Crm.modules.clientRoles.view.ClientRolesGrid",
          iconCls: "x-fa fa-users-cog"
        },
        {
          text: "Workflow settings",
          view: "Crm.modules.signset.view.SignsetGrid",
          iconCls: "x-fa fa-briefcase"
        },
        {
          text: "Logs",
          view: "Crm.modules.logs.view.LogsGrid",
          iconCls: "x-fa fa-eye"
        },
        {
          text: "Admin actions logs",
          view: "Crm.modules.adminLogs.view.adminLogsGrid",
          iconCls: "x-fa fa-eye"
        },
        {
          text: "User actions logs",
          view: "Crm.modules.userLogs.view.UserLogsGrid",
          iconCls: "x-fa fa-eye"
        },

        // {
        //   text: "Report templates",
        //   view:
        //     "Crm.modules.reportTemplatesManager.view.reportTemplatesManagerGrid",
        //   iconCls: "x-fa fa-file-o"
        // },
        // {
        //   text: "Invoices templates",
        //   view: "Crm.modules.invoiceTemplates.view.InvoiceTemplatesGrid",
        //   iconCls: "x-fa fa-list"
        // },
        // {
        //   text: "Telegram channels",
        //   view: "Crm.modules.telegram.view.TelegramChannelGrid",
        //   iconCls: "x-fa fa-list"
        // },
        {
          text: "Letters templates",
          view: "Crm.modules.letterTemplates.view.letterTemplatesGrid",
          iconCls: "x-fa fa-envelope"
        },
        {
          text: "Transporters",
          view: "Crm.modules.transporters.view.TransporterGrid",
          iconCls: "x-fa fa-list"
        },
        {
          text: "Business type",
          view: "Crm.modules.businessTypes.view.BusinessTypesGrid",
          iconCls: "x-fa fa-list"
        },
        {
          text: "Document type",
          view: "Crm.modules.docTypes.view.docTypesGrid",
          iconCls: "x-fa fa-file-alt"
        },
        {
          text: "Contractors",
          view: "Crm.modules.contractors.view.ContractorsGrid",
          iconCls: "x-fa fa-users"
        },
        {
          text: "System notifications",
          view: "Crm.modules.systemNotifications.view.systemNotificationsGrid",
          iconCls: "x-fa fa-bell"
        }
      ]
    }
  ],
  downloadFileLink:
    location.protocol == "http:"
      ? location.protocol + "//" + location.hostname + ":8012/download"
      : location.protocol + "//" + location.hostname + "/download"
};
