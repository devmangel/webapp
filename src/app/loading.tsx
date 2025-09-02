"use client";

import Spinner from "./components/shared/Spinner";

export default function Loading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spinner
        height={150}
        width={150}
        visible={true}
      />
    </div>
  );
}
