#!/usr/bin/env python3
"""
CSV conversion utility for unifying financial institution CSV exports.
Extracted from the previous inline Python in convert_csv.sh for readability.
"""
import codecs
import csv
import json
import os
import re
import shutil
from datetime import datetime
from typing import Dict, List, Optional, Tuple

# ---------------------------------------------------------------------------
# Configuration helpers
# ---------------------------------------------------------------------------

def load_config(script_dir: str) -> Dict:
    config_path = os.path.join(script_dir, "config.json")
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)


def ensure_output_dir(output_dir: str) -> None:
    os.makedirs(output_dir, exist_ok=True)


# ---------------------------------------------------------------------------
# Parsing helpers
# ---------------------------------------------------------------------------

def detect_bank_type(filename: str, banks_config: Dict) -> Tuple[Optional[str], Optional[Dict]]:
    """Detect bank type based on filename patterns."""
    for bank_id, bank_config in banks_config.items():
        for pattern in bank_config.get("file_patterns", []):
            regex_pattern = pattern.replace("*", ".*")
            if re.match(regex_pattern, filename):
                return bank_id, bank_config
    return None, None


def parse_amount(amount_str: str) -> float:
    """Convert amount strings to numeric values."""
    if not amount_str:
        return 0
    amount_str = (
        amount_str.replace(",", "")
        .replace("¥", "")
        .replace(" ", "")
        .replace("\\", "")
    )
    try:
        return abs(float(amount_str))
    except Exception:
        return 0


def parse_date(date_str: str) -> str:
    """Normalize date strings into YYYY/MM/DD format."""
    if not date_str:
        return ""

    formats = ["%Y/%m/%d", "%Y-%m-%d", "%Y年%m月%d日", "%m/%d"]
    for fmt in formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            if fmt == "%m/%d":
                dt = dt.replace(year=datetime.now().year)
            return dt.strftime("%Y/%m/%d")
        except Exception:
            continue

    try:
        date_str_converted = (
            date_str.replace("年", "/").replace("月", "/").replace("日", "")
        )
        parts = date_str_converted.split("/")
        if len(parts) >= 3:
            year, month, day = map(int, parts[:3])
            return f"{year:04d}/{month:02d}/{day:02d}"
        if len(parts) == 2:
            current_year = datetime.now().year
            month, day = map(int, parts)
            return f"{current_year:04d}/{month:02d}/{day:02d}"
    except Exception:
        pass

    return date_str


def adjust_date_to_billing_month(date_str: str, target_year_month: str) -> str:
    """Adjust dates for billing month (for SAISON cards)."""
    if not date_str or not target_year_month:
        return date_str

    try:
        original_date = datetime.strptime(date_str, "%Y/%m/%d")
        target_year, target_month = map(int, target_year_month.split("-"))
        try:
            adjusted_date = original_date.replace(year=target_year, month=target_month)
        except ValueError:
            import calendar

            last_day = calendar.monthrange(target_year, target_month)[1]
            adjusted_day = min(original_date.day, last_day)
            adjusted_date = original_date.replace(year=target_year, month=target_month, day=adjusted_day)
        return adjusted_date.strftime("%Y/%m/%d")
    except Exception:
        return date_str


def categorize_transaction(description: str, description_detail: str, categories: Dict) -> str:
    """Infer account category from description."""
    combined_text = f"{description} {description_detail}".lower()

    for category_id, category_config in categories.items():
        if category_id == "default":
            continue
        for keyword in category_config.get("keywords", []):
            if keyword.lower() in combined_text:
                return category_config["account"]

    return categories["default"]["account"]


# ---------------------------------------------------------------------------
# Conversion
# ---------------------------------------------------------------------------

def convert_csv_file(
    input_path: str,
    bank_config: Dict,
    categories: Dict,
    year_month: str,
) -> List[Dict]:
    """Convert a single CSV file to unified format."""
    encoding = bank_config.get("encoding", "utf-8")
    columns = bank_config["columns"]
    account_name = bank_config.get("account_name", "普通預金")
    is_credit_card = bank_config.get("is_credit_card", False)
    adjust_date = bank_config.get("adjust_date_to_billing_month", False)

    transactions = []

    try:
        with codecs.open(input_path, "r", encoding=encoding, errors="ignore") as f:
            reader = csv.DictReader(f)
            for row in reader:
                date = parse_date(row.get(columns["date"], ""))
                if not date:
                    continue
                if adjust_date:
                    date = adjust_date_to_billing_month(date, year_month)

                description = row.get(columns["description"], "")
                description_detail = row.get(columns["description_detail"], "")
                debit_amount = parse_amount(row.get(columns["debit"], ""))
                credit_amount = parse_amount(row.get(columns["credit"], ""))
                full_description = f"{description} {description_detail}".strip()

                if is_credit_card:
                    if debit_amount > 0:
                        category = categorize_transaction(
                            description, description_detail, categories
                        )
                        transactions.append(
                            {
                                "date": date,
                                "category": category,
                                "amount": debit_amount,
                                "type": "支出",
                                "payment_method": account_name,
                                "description": full_description,
                            }
                        )
                else:
                    if debit_amount > 0:
                        category = categorize_transaction(
                            description, description_detail, categories
                        )
                        transactions.append(
                            {
                                "date": date,
                                "category": category,
                                "amount": debit_amount,
                                "type": "支出",
                                "payment_method": account_name,
                                "description": full_description,
                            }
                        )
                    elif credit_amount > 0:
                        category = categorize_transaction(
                            description, description_detail, categories
                        )
                        transactions.append(
                            {
                                "date": date,
                                "category": category,
                                "amount": credit_amount,
                                "type": "収入",
                                "payment_method": account_name,
                                "description": full_description,
                            }
                        )
    except Exception as e:
        print(f"Error reading {input_path}: {e}")
        return []

    return transactions


def write_unified_csv(transactions: List[Dict], output_path: str, output_config: Dict) -> None:
    columns = output_config["columns"]
    encoding = output_config.get("encoding", "utf-8")

    with open(output_path, "w", encoding=encoding, newline="") as f:
        writer = csv.writer(f)
        writer.writerow(columns)

        for trans in transactions:
            category_parts = trans["category"].split("/")
            main_category = category_parts[0] if category_parts else trans["category"]
            sub_category = category_parts[1] if len(category_parts) > 1 else ""

            row = [
                trans["date"],
                main_category,
                sub_category,
                int(trans["amount"]),
                trans["type"],
                trans["payment_method"],
                trans["description"],
                "",
            ]
            writer.writerow(row)


# ---------------------------------------------------------------------------
# Directory helpers
# ---------------------------------------------------------------------------

def infer_year_month_from_csv(csv_path: str, bank_config: Dict) -> Optional[str]:
    """Try to infer YYYY-MM from the first valid date row in the CSV."""
    encoding = bank_config.get("encoding", "utf-8")
    columns = bank_config.get("columns", {})
    date_column = columns.get("date")
    if not date_column:
        return None

    try:
        with codecs.open(csv_path, "r", encoding=encoding, errors="ignore") as f:
            reader = csv.DictReader(f)
            for row in reader:
                raw_date = row.get(date_column, "")
                normalized_date = parse_date(raw_date)
                if normalized_date:
                    try:
                        dt = datetime.strptime(normalized_date, "%Y/%m/%d")
                        return f"{dt.year:04d}-{dt.month:02d}"
                    except Exception:
                        continue
    except Exception:
        return None

    return None


def move_to_year_month(csv_path: str, target_year_month: str, base_dir: str) -> None:
    year, month = target_year_month.split("-")
    destination_dir = os.path.join(base_dir, year, month)
    os.makedirs(destination_dir, exist_ok=True)
    shutil.move(csv_path, os.path.join(destination_dir, os.path.basename(csv_path)))


def reorganize_input_structure(base_dir: str, banks_config: Dict) -> None:
    """Convert legacy YYYY-MM folders into YYYY/MM layout and auto-sort loose files."""
    # 1. Convert legacy YYYY-MM directories into nested YYYY/MM
    for entry in os.listdir(base_dir):
        entry_path = os.path.join(base_dir, entry)
        if os.path.isdir(entry_path) and re.fullmatch(r"\d{4}-\d{2}", entry):
            year, month = entry.split("-")
            year_dir = os.path.join(base_dir, year)
            month_dir = os.path.join(year_dir, month)

            os.makedirs(month_dir, exist_ok=True)

            for child in os.listdir(entry_path):
                shutil.move(
                    os.path.join(entry_path, child), os.path.join(month_dir, child)
                )

            shutil.rmtree(entry_path, ignore_errors=True)

    # 2. Auto-distribute loose CSV files placed directly under input/
    for entry in os.listdir(base_dir):
        entry_path = os.path.join(base_dir, entry)
        if os.path.isdir(entry_path) or not entry.lower().endswith(".csv"):
            continue

        _, bank_config = detect_bank_type(entry, banks_config)
        if not bank_config:
            continue

        target_year_month = infer_year_month_from_csv(entry_path, bank_config)
        if not target_year_month:
            # Fallback to file modified time
            modified = datetime.fromtimestamp(os.path.getmtime(entry_path))
            target_year_month = f"{modified.year:04d}-{modified.month:02d}"

        move_to_year_month(entry_path, target_year_month, base_dir)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def convert_all(input_dir: str, output_dir: str, config: Dict) -> None:
    ensure_output_dir(output_dir)

    banks_config = config["banks"]
    categories = config["categories"]
    output_config = config["output"]

    reorganize_input_structure(input_dir, banks_config)

    for year in sorted(os.listdir(input_dir)):
        year_path = os.path.join(input_dir, year)
        if not (os.path.isdir(year_path) and re.fullmatch(r"\d{4}", year)):
            continue

        for month in sorted(os.listdir(year_path)):
            if not re.fullmatch(r"\d{2}", month):
                continue

            year_month_dir = f"{year}-{month}"
            print(f"Processing {year_month_dir}...")

            input_month_dir = os.path.join(year_path, month)
            output_month_dir = os.path.join(output_dir, year, month)
            os.makedirs(output_month_dir, exist_ok=True)

            all_transactions: List[Dict] = []

            for csv_file in sorted(os.listdir(input_month_dir)):
                if not csv_file.endswith(".csv"):
                    continue

                bank_id, bank_config = detect_bank_type(csv_file, banks_config)
                if not bank_config:
                    print(f"  Unknown file format: {csv_file}")
                    continue

                print(f"  Processing {csv_file} as {bank_config['name']}...")
                input_path = os.path.join(input_month_dir, csv_file)
                transactions = convert_csv_file(
                    input_path, bank_config, categories, year_month_dir
                )
                all_transactions.extend(transactions)

            if all_transactions:
                all_transactions.sort(key=lambda x: x["date"])
                output_path = os.path.join(
                    output_month_dir, f"unified_{year_month_dir}.csv"
                )
                write_unified_csv(all_transactions, output_path, output_config)
                print(
                    f"  Output: {output_path} ({len(all_transactions)} transactions)"
                )
            else:
                print(f"  No transactions found for {year_month_dir}")


def main() -> None:
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_dir = os.path.join(script_dir, "input")
    output_dir = os.path.join(script_dir, "output")

    config = load_config(script_dir)
    convert_all(input_dir, output_dir, config)
    print("\nConversion completed!")


if __name__ == "__main__":
    main()
