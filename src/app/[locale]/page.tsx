import React from "react";
import HomeClient from "../components/home/homeClient";
import { GoogleSignInButton, GitHubSignInButton } from "../components/auth/SignInButton";
import SignOutButton from "../components/auth/SignOutButton";
import { getCurrentSession, isAuthenticated } from "../lib/auth";

// This page handles localized routes like /en, /es, etc.
export default async function LocaleHomePage() {
  // Server-side authentication check
  const session = await getCurrentSession();
  const authenticated = await isAuthenticated();

  return (
    <div className="">

    </div>
  );
}
