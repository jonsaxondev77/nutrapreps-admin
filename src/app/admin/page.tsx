import type { Metadata } from "next";
import React from "react";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Nutrapreps Admin Area",
  description: "This is the home of the Nutrapreps Admin Area",
};

export default function Ecommerce() {

  return (
    <DashboardClient/>
  );
}
