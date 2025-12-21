export interface AdminMenuItem {
  title: string;
  description: string;
  href: string;
  color: string;
}

export const adminMenuItems: AdminMenuItem[] = [
  {
    title: "組織管理",
    description: "組織の作成・編集・削除",
    href: "/admin/organizations",
    color: "blue",
  },
  {
    title: "トランザクション",
    description: "取引データの管理",
    href: "/admin/transactions",
    color: "green",
  },
  {
    title: "CSVアップロード",
    description: "データのインポート",
    href: "/admin/csv-upload",
    color: "purple",
  },
  {
    title: "カテゴリ管理",
    description: "カテゴリの作成・編集",
    href: "/admin/categories",
    color: "indigo",
  },
  {
    title: "ユーザー管理",
    description: "ユーザーの作成・編集",
    href: "/admin/users",
    color: "yellow",
  },
];
