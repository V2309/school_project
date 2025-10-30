// @/components/scores/ScoreLineChart.tsx

"use client";

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface ChartData {
  name: string;
  [key: string]: number | string;
}

interface ScoreLineChartProps {
  data: ChartData[];
}

export default function ScoreLineChart({ data }: ScoreLineChartProps) {
  return (
    // Đặt chiều cao cố định cho biểu đồ
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }} 
            interval={0} // Hiển thị tất cả các nhãn
            // angle={-15} // Nghiêng nhãn nếu quá dài
            // textAnchor="end"
          />
          <YAxis 
            domain={[0, 10]} // Giả sử thang điểm 10
            tick={{ fontSize: 12 }} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #cccccc',
              borderRadius: '8px' 
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="Điểm TB" // Khớp với key trong `chartData`
            stroke="#3b82f6" // Màu xanh blue
            strokeWidth={2}
            activeDot={{ r: 8 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}