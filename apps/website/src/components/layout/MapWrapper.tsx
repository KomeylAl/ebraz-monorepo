"use client";

import dynamic from "next/dynamic";
import React from "react";

const ClinicMap = dynamic(() => import("@/components/layout/Map"), {
  ssr: false,
});

const MapWrapper = ({ lat, long }: { lat: number, long: number }) => {
  return <ClinicMap lat={lat} long={long}/>;
};

export default MapWrapper;
