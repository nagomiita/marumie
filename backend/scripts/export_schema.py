from __future__ import annotations

import argparse
from pathlib import Path

from sqlalchemy import Enum as SAEnum
from sqlalchemy import create_mock_engine
from sqlalchemy.dialects import postgresql

import app.models.orm  # noqa: F401
from app.models.base import Base


def _format_table_name(table, include_schema: bool) -> str:
    if table.schema and (include_schema or table.schema != "public"):
        return f"{table.schema}.{table.name}"
    return table.name


def _format_default(column) -> str | None:
    if column.server_default is None:
        return None
    value = str(column.server_default.arg).strip()
    if not value:
        return None
    return f"`{value}`"


def _collect_enums(metadata) -> dict[str, list[str]]:
    enums: dict[str, list[str]] = {}
    for table in metadata.sorted_tables:
        for column in table.columns:
            if isinstance(column.type, SAEnum):
                enum_name = column.type.name or f"{table.name}_{column.name}_enum"
                enums.setdefault(enum_name, list(column.type.enums))
    return enums


def render_sql(metadata) -> str:
    statements: list[str] = []
    dialect = postgresql.dialect()

    def _capture(sql, *multiparams, **params) -> None:
        compiled = str(sql.compile(dialect=dialect)).rstrip()
        if not compiled.endswith(";"):
            compiled += ";"
        statements.append(compiled)

    engine = create_mock_engine("postgresql://", executor=_capture)
    metadata.create_all(engine)

    return "\n\n".join(statements).rstrip() + "\n"


def render_dbml(metadata, include_schema: bool) -> str:
    lines: list[str] = []
    enums = _collect_enums(metadata)
    dialect = postgresql.dialect()

    def _dbml_type(column) -> str:
        if isinstance(column.type, SAEnum):
            return column.type.name or f"{column.table.name}_{column.name}_enum"
        compiled = column.type.compile(dialect=dialect)
        if compiled in {"TIMESTAMP WITH TIME ZONE", "TIMESTAMP WITHOUT TIME ZONE"}:
            return "TIMESTAMP"
        return compiled

    def _dbml_note(value) -> str | None:
        if value is None:
            return None
        note = str(value).strip()
        if not note:
            return None
        return note.replace("'", "\\'")

    for enum_name, values in enums.items():
        lines.append(f"Enum {enum_name} {{")
        for value in values:
            lines.append(f"  {value}")
        lines.append("}")
        lines.append("")

    for table in metadata.sorted_tables:
        table_name = _format_table_name(table, include_schema)
        table_note = _dbml_note(table.comment)
        if table_note:
            lines.append(f"Table {table_name} [note: '{table_note}'] {{")
        else:
            lines.append(f"Table {table_name} {{")
        for column in table.columns:
            column_type = _dbml_type(column)
            attrs: list[str] = []
            if column.primary_key:
                attrs.append("pk")
            if not column.nullable:
                attrs.append("not null")
            if column.unique:
                attrs.append("unique")
            default = _format_default(column)
            if default:
                attrs.append(f"default: {default}")
            column_note = _dbml_note(column.comment)
            if column_note:
                attrs.append(f"note: '{column_note}'")

            if attrs:
                lines.append(f"  {column.name} {column_type} [{', '.join(attrs)}]")
            else:
                lines.append(f"  {column.name} {column_type}")

        if table.indexes:
            lines.append("  Indexes {")
            for index in sorted(table.indexes, key=lambda idx: idx.name or ""):
                columns = ", ".join(col.name for col in index.columns)
                attrs: list[str] = []
                if index.unique:
                    attrs.append("unique")
                if index.name:
                    attrs.append(f"name: '{index.name}'")
                if attrs:
                    lines.append(f"    ({columns}) [{', '.join(attrs)}]")
                else:
                    lines.append(f"    ({columns})")
            lines.append("  }")

        lines.append("}")
        lines.append("")

    refs: set[tuple[str, str]] = set()
    for table in metadata.sorted_tables:
        local_table = _format_table_name(table, include_schema)
        for column in table.columns:
            for foreign_key in column.foreign_keys:
                remote_table = _format_table_name(
                    foreign_key.column.table, include_schema
                )
                refs.add(
                    (
                        f"{local_table}.{column.name}",
                        f"{remote_table}.{foreign_key.column.name}",
                    )
                )

    for local, remote in sorted(refs):
        lines.append(f"Ref: {local} > {remote}")

    return "\n".join(lines).rstrip() + "\n"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Export SQLAlchemy schema to SQL/DBML."
    )
    parser.add_argument(
        "--format",
        choices=["sql", "dbml"],
        default="dbml",
        help="Output format.",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        default=Path("./docs/db/.dbml"),
        help="Write output to this path (default: ./docs/db/.dbml).",
    )
    parser.add_argument(
        "--include-schema",
        action="store_true",
        help="Include schema prefix in DBML table/refs.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    metadata = Base.metadata

    if args.format == "dbml":
        content = render_dbml(metadata, include_schema=args.include_schema)
    else:
        content = render_sql(metadata)

    if args.output:
        args.output.write_text(content, encoding="utf-8")
    else:
        print(content, end="")


if __name__ == "__main__":
    main()
