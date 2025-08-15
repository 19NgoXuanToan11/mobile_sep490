import React from "react";
import { Redirect } from "expo-router";

export default function IndexScreen() {
  // Always redirect to Welcome first, then Welcome will navigate to Onboarding
  return <Redirect href="/(public)/welcome" />;
}
