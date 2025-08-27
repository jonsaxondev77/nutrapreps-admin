"use client";
import React from "react";
import { ukRegionsMill } from '@react-jvectormap/ukregions';
import dynamic from "next/dynamic";

const VectorMap = dynamic(
  () => import("@react-jvectormap/core").then((mod) => mod.VectorMap),
  { ssr: false }
);

// Define approximate coordinates for major North West cities
const markers = [
    { latLng: [53.4808, -2.2426], name: "Manchester" },
    { latLng: [53.4084, -2.9916], name: "Liverpool" },
    { latLng: [53.454, -2.746], name: "St Helens" },
    { latLng: [53.544, -2.631], name: "Wigan" },
    { latLng: [53.456, -2.633], name: "Newton-le-Willows" },
    { latLng: [53.390, -2.596], name: "Warrington" },
    { latLng: [53.5448, -2.1121], name: "Oldham" },
    { latLng: [53.6151, -2.1583], name: "Rochdale" },
    { latLng: [53.6931, -2.6966], name: "Leyland" },
    { latLng: [53.6543, -2.6324], name: "Chorley" },
    { latLng: [53.6465, -2.9984], name: "Southport" },
    { latLng: [53.8142, -3.0502], name: "Blackpool" },
];

const NorthWestMap = () => {
  return (
    <VectorMap
      map={ ukRegionsMill  }
      backgroundColor="transparent"
      zoomOnScroll={false}
      focusOn={{
        lat: 53.483002,
        lng:-2.293100,
        x: 0,
        y: 0,
        scale: 6, 
      }}
      regionStyle={{
        initial: { fill: "#D0D5DD" },
        hover: { fill: "#465fff" },
      }}
      markerStyle={{
          initial: { fill: "#465FFF", r: 5 },
      }}
      markers={markers}
    />
  );
};

export default NorthWestMap;