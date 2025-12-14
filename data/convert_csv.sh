#!/bin/bash

# CSV変換スクリプト
# 各銀行・クレジットカードの明細CSVを統一フォーマットに変換

# スクリプトのディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_SCRIPT="$SCRIPT_DIR/convert_csv.py"

# Pythonスクリプトが存在するかチェック
if [ ! -f "$PYTHON_SCRIPT" ]; then
    echo "Error: Python script not found at $PYTHON_SCRIPT"
    exit 1
fi

# Pythonスクリプトを実行
python3 "$PYTHON_SCRIPT"

echo "CSV変換が完了しました。output/ディレクトリを確認してください。"