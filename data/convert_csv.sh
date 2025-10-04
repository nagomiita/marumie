#!/bin/bash

# CSV変換スクリプト
# 各銀行・クレジットカードの明細CSVを統一フォーマットに変換

# スクリプトのディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INPUT_DIR="$SCRIPT_DIR/input"
OUTPUT_DIR="$SCRIPT_DIR/output"
CONFIG_FILE="$SCRIPT_DIR/config.yaml"

# 出力ディレクトリを作成
mkdir -p "$OUTPUT_DIR"

# Pythonスクリプトを生成して実行
python3 << 'EOF'
import csv
import os
import yaml
import re
from datetime import datetime
from pathlib import Path
import codecs

# 設定ファイルを読み込み
script_dir = os.path.dirname(os.path.abspath(__file__)) if '__file__' in globals() else os.getcwd()
config_path = os.path.join(script_dir, 'config.yaml')

with open(config_path, 'r', encoding='utf-8') as f:
    config = yaml.safe_load(f)

input_dir = os.path.join(script_dir, 'input')
output_dir = os.path.join(script_dir, 'output')

# 出力ディレクトリを作成
os.makedirs(output_dir, exist_ok=True)

def detect_bank_type(filename, banks_config):
    """ファイル名から銀行タイプを判定"""
    for bank_id, bank_config in banks_config.items():
        for pattern in bank_config.get('file_patterns', []):
            # ワイルドカードを正規表現に変換
            regex_pattern = pattern.replace('*', '.*')
            if re.match(regex_pattern, filename):
                return bank_id, bank_config
    return None, None

def parse_amount(amount_str):
    """金額文字列を数値に変換"""
    if not amount_str or amount_str == '':
        return 0
    # カンマ、円記号、スペースを削除
    amount_str = amount_str.replace(',', '').replace('¥', '').replace(' ', '').replace('\\', '')
    try:
        return abs(float(amount_str))
    except:
        return 0

def parse_date(date_str):
    """日付文字列を統一フォーマットに変換"""
    if not date_str:
        return ""
    
    # 各種日付フォーマットを試す
    formats = [
        '%Y/%m/%d',
        '%Y-%m-%d',
        '%Y年%m月%d日',
        '%m/%d',     # M/D形式（今年と仮定）
    ]
    
    for fmt in formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            # M/D形式の場合は現在の年を設定
            if fmt == '%m/%d':
                current_year = datetime.now().year
                dt = dt.replace(year=current_year)
            return dt.strftime('%Y/%m/%d')
        except:
            continue
    
    # 標準的な変換を試みる
    try:
        # "2025年1月1日"のような形式
        date_str_converted = date_str.replace('年', '/').replace('月', '/').replace('日', '')
        parts = date_str_converted.split('/')
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

def adjust_date_to_billing_month(date_str, target_year_month):
    """利用日を引き落とし月に調整（SAISON_CARD/SAISON_GOLD用）"""
    if not date_str or not target_year_month:
        return date_str
    
    try:
        # 元の日付を解析
        original_date = datetime.strptime(date_str, '%Y/%m/%d')
        
        # 目標年月を解析（YYYY-MM形式）
        target_year, target_month = map(int, target_year_month.split('-'))
        
        # 日付を調整（年月を目標に変更、日はそのまま）
        # ただし、その月に存在しない日付の場合は月末にする
        try:
            adjusted_date = original_date.replace(year=target_year, month=target_month)
        except ValueError:
            # 31日の日付を30日以下の月に調整する場合など
            import calendar
            last_day = calendar.monthrange(target_year, target_month)[1]
            adjusted_day = min(original_date.day, last_day)
            adjusted_date = original_date.replace(year=target_year, month=target_month, day=adjusted_day)
        
        return adjusted_date.strftime('%Y/%m/%d')
    except:
        return date_str

def categorize_transaction(description, description_detail, categories):
    """摘要から勘定科目を推定"""
    combined_text = f"{description} {description_detail}".lower()
    
    for category_id, category_config in categories.items():
        if category_id == 'default':
            continue
        for keyword in category_config.get('keywords', []):
            if keyword.lower() in combined_text:
                return category_config['account']
    
    return categories['default']['account']

def convert_csv_file(input_path, output_path, bank_config, categories, year_month):
    """CSVファイルを統一フォーマットに変換"""
    encoding = bank_config.get('encoding', 'utf-8')
    columns = bank_config['columns']
    account_name = bank_config.get('account_name', '普通預金')
    is_credit_card = bank_config.get('is_credit_card', False)
    adjust_date = bank_config.get('adjust_date_to_billing_month', False)
    
    transactions = []
    
    # ファイルを読み込み
    try:
        with codecs.open(input_path, 'r', encoding=encoding, errors='ignore') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                # 各列の値を取得
                date = parse_date(row.get(columns['date'], ''))
                if not date:
                    continue
                    
                # 日付調整（SAISON_CARD/SAISON_GOLD用）
                if adjust_date:
                    date = adjust_date_to_billing_month(date, year_month)
                    
                description = row.get(columns['description'], '')
                description_detail = row.get(columns['description_detail'], '')
                
                # 借方・貸方の金額を取得
                debit_amount = parse_amount(row.get(columns['debit'], ''))
                credit_amount = parse_amount(row.get(columns['credit'], ''))
                
                # 摘要を結合
                full_description = f"{description} {description_detail}".strip()
                
                # 勘定科目を判定
                if is_credit_card:
                    # クレジットカードの場合は支出のみ
                    if debit_amount > 0:
                        category = categorize_transaction(description, description_detail, categories)
                        transactions.append({
                            'date': date,
                            'category': category,
                            'amount': debit_amount,
                            'type': '支出',
                            'payment_method': account_name,
                            'description': full_description
                        })
                else:
                    # 銀行口座の場合
                    if debit_amount > 0:
                        # 支出
                        category = categorize_transaction(description, description_detail, categories)
                        transactions.append({
                            'date': date,
                            'category': category,
                            'amount': debit_amount,
                            'type': '支出',
                            'payment_method': account_name,
                            'description': full_description
                        })
                    elif credit_amount > 0:
                        # 収入
                        category = categorize_transaction(description, description_detail, categories)
                        transactions.append({
                            'date': date,
                            'category': category,
                            'amount': credit_amount,
                            'type': '収入',
                            'payment_method': account_name,
                            'description': full_description
                        })
    except Exception as e:
        print(f"Error reading {input_path}: {e}")
        return []
    
    return transactions

def write_unified_csv(transactions, output_path):
    """統一フォーマットでCSVを出力"""
    columns = config['output']['columns']
    encoding = config['output']['encoding']
    
    with open(output_path, 'w', encoding=encoding, newline='') as f:
        writer = csv.writer(f)
        
        # ヘッダーを書き込み
        writer.writerow(columns)
        
        # 取引データを書き込み
        for trans in transactions:
            # カテゴリとサブカテゴリを分離
            category_parts = trans['category'].split('/')
            main_category = category_parts[0] if category_parts else trans['category']
            sub_category = category_parts[1] if len(category_parts) > 1 else ''
            
            row = [
                trans['date'],  # 日付
                main_category,  # カテゴリ
                sub_category,   # サブカテゴリ
                int(trans['amount']),  # 金額
                trans['type'],  # 収支区分（収入/支出）
                trans['payment_method'],  # 支払方法
                trans['description'],  # 摘要
                ''   # メモ
            ]
            writer.writerow(row)

# メイン処理
banks_config = config['banks']
categories = config['categories']

# input内のすべての年月ディレクトリを処理
for year_month_dir in sorted(os.listdir(input_dir)):
    if not os.path.isdir(os.path.join(input_dir, year_month_dir)):
        continue
    
    if not re.match(r'\d{4}-\d{2}', year_month_dir):
        continue
    
    print(f"Processing {year_month_dir}...")
    
    input_month_dir = os.path.join(input_dir, year_month_dir)
    output_month_dir = os.path.join(output_dir, year_month_dir)
    os.makedirs(output_month_dir, exist_ok=True)
    
    all_transactions = []
    
    # 各CSVファイルを処理
    for csv_file in sorted(os.listdir(input_month_dir)):
        if not csv_file.endswith('.csv'):
            continue
        
        # 銀行タイプを判定
        bank_id, bank_config = detect_bank_type(csv_file, banks_config)
        
        if not bank_config:
            print(f"  Unknown file format: {csv_file}")
            continue
        
        print(f"  Processing {csv_file} as {bank_config['name']}...")
        
        # CSVを変換
        input_path = os.path.join(input_month_dir, csv_file)
        transactions = convert_csv_file(input_path, None, bank_config, categories, year_month_dir)
        all_transactions.extend(transactions)
    
    # 統一フォーマットで出力
    if all_transactions:
        # 日付でソート
        all_transactions.sort(key=lambda x: x['date'])
        
        output_path = os.path.join(output_month_dir, f'unified_{year_month_dir}.csv')
        write_unified_csv(all_transactions, output_path)
        print(f"  Output: {output_path} ({len(all_transactions)} transactions)")
    else:
        print(f"  No transactions found for {year_month_dir}")

print("\nConversion completed!")
EOF

echo "CSV変換が完了しました。output/ディレクトリを確認してください。"