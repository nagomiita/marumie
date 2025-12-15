#!/bin/bash

# CSV変換スクリプト
# 各銀行・クレジットカードの明細CSVを統一フォーマットに変換

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INPUT_DIR="$SCRIPT_DIR/input"
OUTPUT_DIR="$SCRIPT_DIR/output"
CONFIG_FILE="$SCRIPT_DIR/config.json"

mkdir -p "$OUTPUT_DIR"

python3 "$SCRIPT_DIR/convert_csv.py"

echo "CSV変換が完了しました。output/ディレクトリを確認してください。"
