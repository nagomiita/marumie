from __future__ import annotations

from abc import ABC

from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase

from ..core.settings import get_settings

settings = get_settings()
DB_SCHEMA = settings.db_schema

NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    """
    SQLAlchemy DeclarativeBase

    制約の命名規則を統一します。
    各ORMクラスは __tablename__ を明示的に設定する必要があります。
    """

    metadata = MetaData(naming_convention=NAMING_CONVENTION)


class AbstractTableClass(ABC):
    """
    テーブル定義の抽象基底クラス

    全てのテーブル定義クラスは以下の属性を持つ必要があります：
    - __tablename__: テーブル名
    - __table_args__: テーブル引数（インデックス、制約、コメントなど）
    """

    __tablename__: str
    __table_args__: tuple | dict


class RequireInnerClassesMeta(type):
    """
    内部クラスの存在を強制するメタクラス

    このメタクラスを使用すると、指定した内部クラス（デフォルト: Columns）の
    定義を強制できます。

    Example:
        >>> class MyTable(metaclass=RequireInnerClassesMeta):
        ...     class Columns:
        ...         pass
    """

    REQUIRED_CLASSES = ["Columns"]

    def __new__(mcs, name, bases, namespace):
        if bases:  # 基底クラス以外の場合にチェック
            missing_classes = []
            for required_class in mcs.REQUIRED_CLASSES:
                if required_class not in namespace:
                    missing_classes.append(required_class)

            if missing_classes:
                raise TypeError(
                    f"{name} must define the following inner classes: "
                    f"{', '.join(missing_classes)}"
                )

        return super().__new__(mcs, name, bases, namespace)
