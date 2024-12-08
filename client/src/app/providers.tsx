"use client";

// global state: a component that sets up the Redux store context for the application, making the store available to all child components.

import React from "react";
import StoreProvider from "@/state/redux";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return <StoreProvider>{children}</StoreProvider>;
};

export default Providers;
