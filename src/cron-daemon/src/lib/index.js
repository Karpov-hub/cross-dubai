import Currency from "./Currency";
import MonthlyCommission from "./MonthlyCommission";
import VAT from "./VAT";
import Rates from "./Rates";
import Remove from "./Remove";
import Payments from "./Payments";
import ResetOrdersCounter from "./ResetOrdersCounter";
import ChangeOrderStatus from "./ChangeOrderStatus";
import ClearSequence from "./ClearSequence";
import FixingBalances from "./FixingBalances";
import SyncBalances from "./SyncBalances";
import InvoiceDataRecord from "./InvoiceDataRecord";
import UpdateContracts from "./UpdateContracts";
import RatesHistory from "./RatesHistory";
import DailyRateHistory from "./DailyRateHistory";
import DeactivateChainOfWallets from "./DeactivateChainOfWallets";
import GetLatestNetworkFees from "./GetLatestNetworkFees";
import ActivateSystemNotifications from "./ActivateSystemNotifications";

export default {
  DailyRateHistory,
  RatesHistory,
  Currency,
  MonthlyCommission,
  VAT,
  ActivateSystemNotifications,
  // Rates,
  Remove,
  // Payments, //not working
  ResetOrdersCounter,
  ChangeOrderStatus,
  ClearSequence,
  FixingBalances,
  SyncBalances,
  InvoiceDataRecord,
  UpdateContracts,
  DeactivateChainOfWallets,
  GetLatestNetworkFees
};
