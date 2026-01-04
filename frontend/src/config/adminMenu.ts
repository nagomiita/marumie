import type { LucideIcon } from "lucide-react";
import { Building2, Receipt, Upload, FolderTree, Users } from "lucide-react";

export interface AdminMenuItem {
  title: string;
  description: string;
  href: string;
  color: string;
  icon: LucideIcon;
}

export const adminMenuItems: AdminMenuItem[] = [
  {
    title: "組織管理",
    description: "組織の作成・編集・削除",
    href: "/admin/organizations",
    color: "blue",
    icon: Building2,
  },
  {
    title: "トランザクション",
    description: "取引データの管理",
    href: "/admin/transactions",
    color: "green",
    icon: Receipt,
  },
  {
    title: "CSVアップロード",
    description: "データのインポート",
    href: "/admin/csv-upload",
    color: "purple",
    icon: Upload,
  },
  {
    title: "カテゴリ管理",
    description: "カテゴリの作成・編集",
    href: "/admin/categories",
    color: "indigo",
    icon: FolderTree,
  },
  {
    title: "ユーザー管理",
    description: "ユーザーの作成・編集",
    href: "/admin/users",
    color: "yellow",
    icon: Users,
  },
];
