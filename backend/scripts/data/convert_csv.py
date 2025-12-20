#!/usr/bin/env python3
"""
CSV変換スクリプト
各銀行・クレジットカードの明細CSVを統一フォーマットに変換
"""

from __future__ import annotations

import codecs
import csv
import json
import os
import re
import unicodedata
from dataclasses import dataclass, field
from datetime import datetime
from typing import TypedDict


@dataclass
class BankColumns:
    date: str
    description: str
    description_detail: str
    debit: str
    credit: str
    balance: str | None = None


@dataclass
class BankConfig:
    id: str
    name: str
    encoding: str
    columns: BankColumns
    file_patterns: list[str] = field(default_factory=list)
    account_name: str = "普通預金"
    is_credit_card: bool = False
    adjust_date_to_billing_month: bool = False
    exclude_keywords: list[str] = field(default_factory=list)
    fieldnames: list[str] | None = None
    skip_rows: int = 0
    ignore_description_keywords: list[str] = field(default_factory=list)


@dataclass
class CategoryConfig:
    id: str
    name: str
    keywords: list[str] = field(default_factory=list)


@dataclass
class OutputConfig:
    encoding: str
    columns: list[str]


@dataclass
class AppConfig:
    banks: list[BankConfig]
    categories: list[CategoryConfig]
    output: OutputConfig


class Transaction(TypedDict):
    date: str
    category: str
    amount: float
    type: str
    payment_method: str
    description: str


def detect_bank_type(
    filename: str, banks_config: list[BankConfig]
) -> tuple[str | None, BankConfig | None]:
    """ファイル名から銀行タイプを判定"""
    for bank_config in banks_config:
        for pattern in bank_config.file_patterns:
            regex_pattern = pattern.replace("*", ".*")
            if re.match(regex_pattern, filename):
                return bank_config.id, bank_config
    return None, None


def normalize_text(value: str | None) -> str:
    """半角/全角などを正規化"""
    if not value:
        return ""
    normalized = unicodedata.normalize("NFKC", value)
    normalized = replace_katakana_hyphen(normalized)
    return normalize_small_katakana(normalized)


def replace_katakana_hyphen(value: str) -> str:
    """カタカナ語中の '-' を長音記号に置換"""
    if "-" not in value:
        return value

    chars = list(value)
    result: list[str] = []
    length = len(chars)

    for index, char in enumerate(chars):
        if char == "-":
            prev_char = chars[index - 1] if index > 0 else ""
            next_char = chars[index + 1] if index + 1 < length else ""
            if is_katakana(prev_char) and (not next_char or is_katakana(next_char)):
                result.append("ー")
                continue
        result.append(char)

    return "".join(result)


def is_katakana(char: str) -> bool:
    if not char:
        return False
    code_point = ord(char)
    # 全角カタカナ + 半角カタカナの範囲
    return (0x30A0 <= code_point <= 0x30FF) or (0xFF66 <= code_point <= 0xFF9F)


def normalize_small_katakana(value: str) -> str:
    """小書きカタカナを大きいカタカナにそろえる"""
    small_to_large = {
        "ァ": "ア",
        "ィ": "イ",
        "ゥ": "ウ",
        "ェ": "エ",
        "ォ": "オ",
        "ッ": "ツ",
        "ャ": "ヤ",
        "ュ": "ユ",
        "ョ": "ヨ",
        "ヮ": "ワ",
        "ヵ": "カ",
        "ヶ": "ケ",
    }
    if not any(char in value for char in small_to_large):
        return value
    return "".join(small_to_large.get(char, char) for char in value)


def remove_excluded_terms(text: str | None, exclusions: list[str] | None) -> str:
    """指定された語句を取り除いた正規化済みテキストを返す"""
    normalized_text = normalize_text(text)
    if not exclusions or not normalized_text:
        return normalized_text

    filtered = normalized_text
    for exclusion in exclusions:
        normalized_exclusion = normalize_text(exclusion)
        if not normalized_exclusion:
            continue
        filtered = filtered.replace(normalized_exclusion, " ")
    return " ".join(filtered.split())


def apply_exclusions(text: str, exclusions: list[str] | None) -> str:
    """指定された文字列をテキストから除去"""
    if not exclusions:
        return text
    filtered = text
    for exclusion in exclusions:
        normalized_exclusion = normalize_text(exclusion).lower()
        if not normalized_exclusion:
            continue
        filtered = filtered.replace(normalized_exclusion, " ")
    return filtered


def prepare_descriptions(
    raw_description: str,
    raw_description_detail: str,
    exclusions: list[str] | None,
) -> tuple[str, str, str]:
    """カテゴリ判定と出力に用いる摘要をまとめて生成"""
    description = remove_excluded_terms(text=raw_description, exclusions=exclusions)
    description_detail = remove_excluded_terms(
        text=raw_description_detail, exclusions=exclusions
    )
    full_description = f"{description} {description_detail}".strip()
    return description, description_detail, full_description


def create_transaction(
    *,
    date: str,
    category: str,
    amount: float,
    entry_type: str,
    payment_method: str,
    description: str,
) -> Transaction:
    return {
        "date": date,
        "category": category,
        "amount": amount,
        "type": entry_type,
        "payment_method": payment_method,
        "description": description,
    }


def should_record_transaction(amount: float) -> bool:
    return amount is not None and amount > 0


def should_ignore_description(
    description: str, detail: str, ignore_keywords: list[str]
) -> bool:
    if not ignore_keywords:
        return False
    combined = f"{description} {detail}".lower()
    for keyword in ignore_keywords:
        normalized = normalize_text(keyword).lower()
        if normalized and normalized in combined:
            return True
    return False


def append_transaction_if_needed(
    *,
    transactions: list[Transaction],
    amount: float,
    entry_type: str,
    description: str,
    description_detail: str,
    full_description: str,
    categories: list[CategoryConfig],
    default_category: str,
    exclude_keywords: list[str] | None,
    payment_method: str,
    date: str,
) -> None:
    if not should_record_transaction(amount):
        return

    category = categorize_transaction(
        description=description,
        description_detail=description_detail,
        categories=categories,
        default_category=default_category,
        exclude_keywords=exclude_keywords,
    )
    transactions.append(
        create_transaction(
            date=date,
            category=category,
            amount=amount,
            entry_type=entry_type,
            payment_method=payment_method,
            description=full_description,
        )
    )


def parse_amount(amount_str: str | None) -> float:
    """金額文字列を数値に変換"""
    if not amount_str or amount_str == "":
        return 0
    # カンマ、円記号、スペースを削除
    amount_str = (
        amount_str.replace(",", "").replace("¥", "").replace(" ", "").replace("\\", "")
    )
    try:
        return abs(float(amount_str))
    except:
        return 0


def parse_date(date_str: str) -> str:
    """日付文字列を統一フォーマットに変換"""
    if not date_str:
        return ""

    # 各種日付フォーマットを試す
    formats = [
        "%Y/%m/%d",
        "%Y-%m-%d",
        "%Y年%m月%d日",
        "%Y%m%d",
        "%m/%d",  # M/D形式（今年と仮定）
    ]

    for fmt in formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            # M/D形式の場合は現在の年を設定
            if fmt == "%m/%d":
                current_year = datetime.now().year
                dt = dt.replace(year=current_year)
            return dt.strftime("%Y/%m/%d")
        except:
            continue

    # 標準的な変換を試みる
    try:
        # "2025年1月1日"のような形式
        date_str_converted = (
            date_str.replace("年", "/").replace("月", "/").replace("日", "")
        )
        parts = date_str_converted.split("/")
        if len(parts) >= 3:
            year = int(parts[0])
            month = int(parts[1])
            day = int(parts[2])
            return f"{year:04d}/{month:02d}/{day:02d}"
        elif len(parts) == 2:
            # M/D形式の場合は現在の年を使用
            current_year = datetime.now().year
            month = int(parts[0])
            day = int(parts[1])
            return f"{current_year:04d}/{month:02d}/{day:02d}"
    except:
        pass

    return date_str


def adjust_date_to_billing_month(date_str: str, target_year_month: str) -> str:
    """利用日を引き落とし月に調整（SAISON_CARD/SAISON_GOLD用）"""
    if not date_str or not target_year_month:
        return date_str

    try:
        # 元の日付を解析
        original_date = datetime.strptime(date_str, "%Y/%m/%d")

        # 目標年月を解析（YYYY-MM形式）
        target_year, target_month = map(int, target_year_month.split("-"))

        # 日付を調整（年月を目標に変更、日はそのまま）
        # ただし、その月に存在しない日付の場合は月末にする
        try:
            adjusted_date = original_date.replace(year=target_year, month=target_month)
        except ValueError:
            # 31日の日付を30日以下の月に調整する場合など
            import calendar

            last_day = calendar.monthrange(target_year, target_month)[1]
            adjusted_day = min(original_date.day, last_day)
            adjusted_date = original_date.replace(
                year=target_year, month=target_month, day=adjusted_day
            )

        return adjusted_date.strftime("%Y/%m/%d")
    except:
        return date_str


def categorize_transaction(
    description: str,
    description_detail: str,
    categories: list[CategoryConfig],
    default_category: str,
    exclude_keywords: list[str] | None = None,
) -> str:
    """摘要からカテゴリIDを推定"""
    normalized_description = normalize_text(description)
    normalized_detail = normalize_text(description_detail)
    combined_text = f"{normalized_description} {normalized_detail}".lower()
    combined_text = apply_exclusions(combined_text, exclude_keywords)

    for category in categories:
        if category.id == "default":
            continue
        for keyword in category.keywords:
            normalized_keyword = normalize_text(keyword).lower()
            if normalized_keyword in combined_text:
                return category.id

    return default_category


def convert_csv_file(
    input_path: str,
    bank_config: BankConfig,
    categories: list[CategoryConfig],
    default_category: str,
    year_month: str,
) -> list[Transaction]:
    """CSVファイルを統一フォーマットに変換"""
    encoding = bank_config.encoding or "utf-8"
    columns = bank_config.columns
    account_name = bank_config.account_name
    is_credit_card = bank_config.is_credit_card
    adjust_date = bank_config.adjust_date_to_billing_month

    transactions: list[Transaction] = []
    exclude_keywords = bank_config.exclude_keywords

    # ファイルを読み込み
    try:
        with codecs.open(input_path, "r", encoding=encoding, errors="ignore") as f:
            if bank_config.skip_rows > 0:
                for _ in range(bank_config.skip_rows):
                    next(f, None)

            if bank_config.fieldnames:
                reader = csv.DictReader(f, fieldnames=bank_config.fieldnames)
            else:
                reader = csv.DictReader(f)

            for row in reader:
                # 各列の値を取得
                date = parse_date(date_str=row.get(columns.date, ""))
                if not date:
                    continue

                # 日付調整（SAISON_CARD/SAISON_GOLD用）
                if adjust_date:
                    date = adjust_date_to_billing_month(
                        date_str=date, target_year_month=year_month
                    )

                raw_description = row.get(columns.description, "")
                raw_description_detail = row.get(columns.description_detail, "")

                # 借方・貸方の金額を取得
                debit_amount = parse_amount(amount_str=row.get(columns.debit, ""))
                credit_amount = parse_amount(amount_str=row.get(columns.credit, ""))

                # 摘要を結合
                description, description_detail, full_description = (
                    prepare_descriptions(
                        raw_description=raw_description,
                        raw_description_detail=raw_description_detail,
                        exclusions=exclude_keywords,
                    )
                )

                if should_ignore_description(
                    description=description,
                    detail=description_detail,
                    ignore_keywords=bank_config.ignore_description_keywords,
                ):
                    continue

                # 勘定科目を判定
                if is_credit_card:
                    append_transaction_if_needed(
                        transactions=transactions,
                        amount=debit_amount,
                        entry_type="支出",
                        description=description,
                        description_detail=description_detail,
                        full_description=full_description,
                        categories=categories,
                        default_category=default_category,
                        exclude_keywords=exclude_keywords,
                        payment_method=account_name,
                        date=date,
                    )
                else:
                    append_transaction_if_needed(
                        transactions=transactions,
                        amount=debit_amount,
                        entry_type="支出",
                        description=description,
                        description_detail=description_detail,
                        full_description=full_description,
                        categories=categories,
                        default_category=default_category,
                        exclude_keywords=exclude_keywords,
                        payment_method=account_name,
                        date=date,
                    )

                    append_transaction_if_needed(
                        transactions=transactions,
                        amount=credit_amount,
                        entry_type="収入",
                        description=description,
                        description_detail=description_detail,
                        full_description=full_description,
                        categories=categories,
                        default_category=default_category,
                        exclude_keywords=exclude_keywords,
                        payment_method=account_name,
                        date=date,
                    )
    except Exception as e:
        print(f"Error reading {input_path}: {e}")
        return []

    return transactions


def write_unified_csv(
    transactions: list[Transaction], output_path: str, output_config: OutputConfig
) -> None:
    """統一フォーマットでCSVを出力"""
    columns = output_config.columns
    encoding = output_config.encoding

    with open(output_path, "w", encoding=encoding, newline="") as f:
        writer = csv.writer(f)

        # ヘッダーを書き込み
        writer.writerow(columns)

        # 取引データを書き込み
        for trans in transactions:
            # カテゴリとサブカテゴリを分離
            category_parts = trans["category"].split("/")
            main_category = category_parts[0] if category_parts else trans["category"]
            sub_category = category_parts[1] if len(category_parts) > 1 else ""

            row = [
                trans["date"],  # 日付
                main_category,  # カテゴリ
                sub_category,  # サブカテゴリ
                int(trans["amount"]),  # 金額
                trans["type"],  # 収支区分（収入/支出）
                trans["payment_method"],  # 支払方法
                trans["description"],  # 摘要
                "",  # メモ
            ]
            writer.writerow(row)


def load_config(script_dir: str) -> AppConfig:
    config_path = os.path.join(script_dir, "config.json")
    with open(config_path, encoding="utf-8") as f:
        raw = json.load(f)

    banks = [
        BankConfig(
            id=bank["id"],
            name=bank["name"],
            encoding=bank.get("encoding", "utf-8"),
            columns=BankColumns(**bank["columns"]),
            file_patterns=bank.get("file_patterns", []),
            account_name=bank.get("account_name", "普通預金"),
            is_credit_card=bank.get("is_credit_card", False),
            adjust_date_to_billing_month=bank.get(
                "adjust_date_to_billing_month", False
            ),
            exclude_keywords=bank.get("exclude_keywords", []),
            fieldnames=bank.get("fieldnames"),
            skip_rows=bank.get("skip_rows", 0),
            ignore_description_keywords=bank.get("ignore_description_keywords", []),
        )
        for bank in raw["banks"]
    ]

    categories = [
        CategoryConfig(
            id=category["id"],
            name=category["name"],
            keywords=category.get("keywords", []),
        )
        for category in raw["categories"]
    ]

    output = OutputConfig(
        encoding=raw["output"]["encoding"],
        columns=raw["output"]["columns"],
    )

    return AppConfig(banks=banks, categories=categories, output=output)


def extract_year_month_from_filename(filename: str) -> str | None:
    match = re.search(r"(20\d{2})(0[1-9]|1[0-2])", filename)
    if match:
        return f"{match.group(1)}-{match.group(2)}"
    return None


def gather_transactions_by_month(
    *,
    input_dir: str,
    banks_config: list[BankConfig],
    categories: list[CategoryConfig],
    default_category: str,
) -> dict[str, list[Transaction]]:
    transactions_by_month: dict[str, list[Transaction]] = {}

    for bank_config in banks_config:
        bank_input_dir = os.path.join(input_dir, bank_config.id)
        if not os.path.isdir(bank_input_dir):
            print(f"Skipping {bank_config.id}: directory not found -> {bank_input_dir}")
            continue

        for csv_file in sorted(os.listdir(bank_input_dir)):
            if not csv_file.endswith(".csv"):
                continue

            year_month_hint = extract_year_month_from_filename(csv_file)
            if not year_month_hint:
                print(
                    f"  Cannot determine billing month from filename '{csv_file}' for {bank_config.name}"
                )

            print(
                f"Processing {csv_file} as {bank_config.name} ({year_month_hint or 'date-based'})..."
            )
            input_path = os.path.join(bank_input_dir, csv_file)
            transactions = convert_csv_file(
                input_path=input_path,
                bank_config=bank_config,
                categories=categories,
                default_category=default_category,
                year_month=year_month_hint or "",
            )
            if not transactions:
                continue
            for transaction in transactions:
                month_key = determine_month_from_transaction(
                    transaction=transaction, fallback_year_month=year_month_hint
                )
                transactions_by_month.setdefault(month_key, []).append(transaction)

    return transactions_by_month


def determine_month_from_transaction(
    *, transaction: Transaction, fallback_year_month: str | None
) -> str:
    date_str = transaction.get("date", "")
    try:
        date_obj = datetime.strptime(date_str, "%Y/%m/%d")
        return date_obj.strftime("%Y-%m")
    except Exception:
        pass
    if fallback_year_month:
        return fallback_year_month
    return "unknown"


def main() -> None:
    script_dir = os.path.dirname(os.path.abspath(__file__))
    config = load_config(script_dir)

    input_dir = os.path.join(script_dir, "input")
    output_dir = os.path.join(script_dir, "output")
    os.makedirs(output_dir, exist_ok=True)

    banks_config = config.banks
    categories = config.categories
    default_category = next(
        (category.name for category in categories if category.id == "default"),
        "未分類",
    )
    output_config = config.output

    transactions_by_month = gather_transactions_by_month(
        input_dir=input_dir,
        banks_config=banks_config,
        categories=categories,
        default_category=default_category,
    )

    if not transactions_by_month:
        print("No transactions found in input directories.")
        return

    # Collect all transactions for consolidated output
    all_transactions: list[Transaction] = []

    for year_month in sorted(transactions_by_month.keys()):
        month_transactions = transactions_by_month[year_month]
        if not month_transactions:
            continue

        month_transactions.sort(key=lambda x: x["date"])
        year, month = year_month.split("-")
        output_month_dir = os.path.join(output_dir, year, month)
        os.makedirs(output_month_dir, exist_ok=True)
        output_path = os.path.join(output_month_dir, f"unified_{year_month}.csv")

        write_unified_csv(
            transactions=month_transactions,
            output_path=output_path,
            output_config=output_config,
        )
        print(f"Output: {output_path} ({len(month_transactions)} transactions)")

        # Add to consolidated list
        all_transactions.extend(month_transactions)

    # Write consolidated output for all months
    if all_transactions:
        all_transactions.sort(key=lambda x: x["date"])
        consolidated_path = os.path.join(output_dir, "unified_all.csv")
        write_unified_csv(
            transactions=all_transactions,
            output_path=consolidated_path,
            output_config=output_config,
        )
        print(
            f"\nConsolidated output: {consolidated_path} ({len(all_transactions)} transactions)"
        )

    print("\nConversion completed!")


if __name__ == "__main__":
    main()
