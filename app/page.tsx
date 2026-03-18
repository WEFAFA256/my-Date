"use client";

import React, { useState } from "react";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { CoreApp } from "./components/CoreApp";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  const handleOnboardingComplete = (data: any) => {
    setUser(data);
  };

  return (
    <main className="min-h-screen bg-bg-dark selection:bg-matcha selection:text-black">
       {user ? (
          <CoreApp user={user} />
       ) : (
          <OnboardingFlow onComplete={handleOnboardingComplete} />
       )}
    </main>
  );
}
