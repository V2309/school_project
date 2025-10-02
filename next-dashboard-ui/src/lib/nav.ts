// lib/nav.ts
export type Role = "admin" | "teacher" | "student" | "parent";

export type NavItem = {
  label: string;
  href: string;
  visible: Role[];
};

export const topNavItems = [
  { label: "Lớp học", href: "/teacher/class",    visible: ["teacher"] as Role[] },
  { label: "Học liệu", href: "/teacher/materials", visible: ["teacher"] as Role[] },
  { label: "Lịch học", href: "/teacher/schedule",  visible: ["teacher"] as Role[] },

  { label: "Tổng quan", href: "/student/overview", visible: ["student"] as Role[] },
  { label: "Lớp học",   href: "/student/class",     visible: ["student"] as Role[] },
  { label: "Lịch học",  href: "/student/schedule",  visible: ["student"] as Role[] },
] as const; // readonly
