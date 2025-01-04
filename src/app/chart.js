import React from "react";
import {
  LineChart,
  Line,
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
      <LineChart data={chartData}>
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
            value: "Comments Number",
            angle: -90,
            position: "insideLeft",
          }}
        />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="count" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ChartComponent;
