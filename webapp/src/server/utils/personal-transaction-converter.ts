import type { PersonalTransaction } from "@/types/personal-transaction";
import type { DisplayTransaction } from "@/types/display-transaction";

export function convertPersonalToDisplayTransactions(
  personalTransactions: PersonalTransaction[],
): DisplayTransaction[] {
  return personalTransactions.map(convertPersonalToDisplayTransaction);
}

export function convertPersonalToDisplayTransaction(
  transaction: PersonalTransaction,
): DisplayTransaction {
  const date = new Date(transaction.date);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const yearmonth = `${year}.${month}`;

  const amount =
    transaction.type === "income" ? transaction.amount : -transaction.amount;

  return {
    id: transaction.id,
    date: date, // Use the converted Date object
    yearmonth,
    transactionType: transaction.type,
    category: transaction.category,
    subcategory: transaction.subcategory,
    account: transaction.category,
    label: transaction.payment_method,
    shortLabel: transaction.payment_method.substring(0, 10), // 短縮ラベル
    friendly_category: transaction.category,
    description: transaction.description,
    absAmount: Math.abs(transaction.amount),
    amount,
  };
}

export function formatPersonalTransactionAmount(
  amount: number,
  locale: string = "ja-JP",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "JPY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function categorizePersonalTransaction(
  transaction: PersonalTransaction,
): "income" | "expense" {
  return transaction.type;
}
