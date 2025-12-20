#!/usr/bin/env python3
"""
config.public.json と config.private.json をマージして config.json を生成するスクリプト
"""

import copy
import json
import os


def merge_by_id(public_list, private_list, id_key="id"):
    merged = {item[id_key]: copy.deepcopy(item) for item in public_list}
    array_merge_keys = {
        "ignore_description_keywords",
        "exclude_keywords",
        "fieldnames",
        "keywords",
    }
    for p_item in private_list or []:
        pid = p_item[id_key]
        if pid in merged:
            for k, v in p_item.items():
                if k in array_merge_keys and isinstance(v, list):
                    orig = merged[pid].get(k, [])
                    # setで重複排除して結合
                    merged[pid][k] = list(set(orig) | set(v))
                else:
                    merged[pid][k] = copy.deepcopy(v)
        else:
            merged[pid] = copy.deepcopy(p_item)
    return list(merged.values())


def merge_config(public_path, private_path, output_path):
    with open(public_path, encoding="utf-8") as f:
        public = json.load(f)
    if os.path.exists(private_path):
        with open(private_path, encoding="utf-8") as f:
            private = json.load(f)
    else:
        private = {}

    merged = copy.deepcopy(public)
    merged["banks"] = merge_by_id(public.get("banks", []), private.get("banks", []))
    merged["categories"] = merge_by_id(
        public.get("categories", []), private.get("categories", [])
    )
    merged["output"] = {**public.get("output", {}), **private.get("output", {})}

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)
    print(f"Merged config written to: {output_path}")


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    public_path = os.path.join(script_dir, "config.public.json")
    private_path = os.path.join(script_dir, "config.private.json")
    output_path = os.path.join(script_dir, "config.json")
    merge_config(public_path, private_path, output_path)


if __name__ == "__main__":
    main()
