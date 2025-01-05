import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ChartComponent = ({ data }) => {
  // Process the cleaned data to count the occurrences of each label
  const labelCounts = data.reduce((acc, { Label }) => {
    acc[Label] = (acc[Label] || 0) + 1;
    return acc;
  }, {});

  // Prepare the data for the chart
  const chartData = Object.entries(labelCounts).map(([label, count]) => ({
    name: label, // Label name
    count, // Number of comments with this label
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          label={{
            value: "Label",
            position: "bottom",
            offset: -20,
          }}
        />
        <YAxis
          label={{
            value: "Comments Nb",
            angle: -90,
            position: "insideLeft",
          }}
        />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ChartComponent;
