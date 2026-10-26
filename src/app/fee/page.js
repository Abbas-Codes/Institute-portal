"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { TrendingUp } from "lucide-react";
import "./fee-status.css";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  Tooltip as ReTooltip,
} from "recharts";

const feeData = [
  { month: "January", paid: 5000 },
  { month: "February", paid: 5000 },
  { month: "March", paid: 3000 },
  { month: "April", paid: 0 },
  { month: "May", paid: 2000 },
  { month: "June", paid: 5000 },
  { month: "July", paid: 0 },
  { month: "August", paid: 4000 },
  { month: "September", paid: 4500 },
  { month: "October", paid: 5000 },
];

const FeeStatusPage = () => {
  const totalFee = 50000;
  const paidFee = feeData.reduce((sum, item) => sum + item.paid, 0);
  const remainingFee = totalFee - paidFee;

  return (
    <main className="fee-page">
      <div className="w-full max-w-5xl space-y-5">
        <Card className="fee-card">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Fee overview</CardTitle>
            <CardDescription>Overview of your fee payments</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
              <div className="fee-metric">
                <p>Total fee</p>
                <p>Rs. {totalFee.toLocaleString()}</p>
              </div>
              <div className="fee-metric">
                <p>Paid</p>
                <p>Rs. {paidFee.toLocaleString()}</p>
              </div>
              <div className="fee-metric">
                <p>Remaining</p>
                <p>Rs. {remainingFee.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly payments</CardTitle>
            <CardDescription>Payment activity throughout the year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={feeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <ReTooltip />
                  <Line
                    type="monotone"
                    dataKey="paid"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <div className="fee-trend">
            Activity summary <TrendingUp className="w-4 h-4" />
          </div>
        </Card>
      </div>
    </main>
  );
};

export default FeeStatusPage;
