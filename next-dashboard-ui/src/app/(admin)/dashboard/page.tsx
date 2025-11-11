// app/page.tsx
"use client"; // Cần thiết vì Recharts sử dụng client-side hooks

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, DollarSign, CreditCard, Activity } from "lucide-react";

// Dữ liệu mẫu cho biểu đồ đường (Line Chart)
const userGrowthData = [
  { name: "Tháng 1", users: 400 },
  { name: "Tháng 2", users: 300 },
  { name: "Tháng 3", users: 500 },
  { name: "Tháng 4", users: 780 },
  { name: "Tháng 5", users: 600 },
  { name: "Tháng 6", users: 900 },
];

// Dữ liệu mẫu cho biểu đồ cột (Bar Chart)
const monthlyRevenueData = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3000 },
  { month: "Mar", revenue: 2000 },
  { month: "Apr", revenue: 2780 },
  { month: "May", revenue: 1890 },
  { month: "Jun", revenue: 2390 },
];

/**
 * Component cho một thẻ thống kê (Stat Card)
 */
interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType; // Kiểu cho component icon
}

function StatCard({ title, value, description, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

/**
 * Trang Dashboard chính
 */
export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">

      {/* 1. Phần Thẻ Thống Kê */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Số lượng học sinh"
          value="$45,231.89"
          description="+20.1% so với tháng trước"
          icon={DollarSign}
        />
        <StatCard
          title="Số lượng giáo viên"
          value="+2,350"
          description="+180.1% so với tháng trước"
          icon={Users}
        />
        <StatCard
          title="Tổng lớp học"
          value="+12,234"
          description="+19% so với tháng trước"
          icon={CreditCard}
        />
        <StatCard
          title="Tỷ lệ Hoạt động"
          value="73%"
          description="+5% so với tuần trước"
          icon={Activity}
        />
      </div>

      {/* 2. Phần Biểu Đồ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Biểu đồ Cột */}
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu hàng tháng</CardTitle>
          </CardHeader>
          <CardContent>
            {/* ResponsiveContainer làm cho biểu đồ tự co giãn */}
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Biểu đồ Đường */}
        <Card>
          <CardHeader>
            <CardTitle>Tăng trưởng người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#82ca9d"
                  name="Người dùng"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}