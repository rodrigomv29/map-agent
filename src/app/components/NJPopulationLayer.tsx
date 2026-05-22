"use client";

import { Circle } from "@react-google-maps/api";

// NJ county seats / geographic centers with population density (people/sq mi, 2020 Census)
const NJ_COUNTIES = [
  { name: "Hudson",     lat: 40.7282, lng: -74.0776, density: 51599 },
  { name: "Essex",      lat: 40.7794, lng: -74.2477, density: 6356  },
  { name: "Union",      lat: 40.6614, lng: -74.2676, density: 5300  },
  { name: "Bergen",     lat: 40.9584, lng: -74.0743, density: 3875  },
  { name: "Passaic",    lat: 40.9157, lng: -74.3671, density: 2848  },
  { name: "Middlesex",  lat: 40.4397, lng: -74.2590, density: 2847  },
  { name: "Camden",     lat: 39.8001, lng: -75.0119, density: 2339  },
  { name: "Mercer",     lat: 40.2815, lng: -74.7024, density: 1703  },
  { name: "Monmouth",   lat: 40.2171, lng: -74.1234, density: 1322  },
  { name: "Morris",     lat: 40.8543, lng: -74.5543, density: 1026  },
  { name: "Somerset",   lat: 40.5604, lng: -74.6099, density: 919   },
  { name: "Ocean",      lat: 39.8604, lng: -74.2546, density: 868   },
  { name: "Gloucester", lat: 39.7101, lng: -75.1477, density: 600   },
  { name: "Burlington", lat: 39.8845, lng: -74.7146, density: 483   },
  { name: "Atlantic",   lat: 39.4601, lng: -74.6377, density: 286   },
  { name: "Sussex",     lat: 41.1300, lng: -74.6873, density: 275   },
  { name: "Warren",     lat: 40.8620, lng: -74.9973, density: 268   },
  { name: "Hunterdon",  lat: 40.5681, lng: -74.9133, density: 265   },
  { name: "Cape May",   lat: 39.0846, lng: -74.8999, density: 229   },
  { name: "Cumberland", lat: 39.3298, lng: -75.0588, density: 195   },
  { name: "Salem",      lat: 39.5748, lng: -75.3488, density: 130   },
];

const MAX_DENSITY = Math.max(...NJ_COUNTIES.map((c) => c.density));

// Log-scale ratio so Hudson's extreme outlier doesn't flatten all other counties
function densityRatio(density: number): number {
  return Math.log(density) / Math.log(MAX_DENSITY);
}

// Interpolate yellow → orange → red based on log-scaled ratio
function densityToColor(density: number): string {
  const t = densityRatio(density);
  let r: number, g: number;
  if (t < 0.5) {
    const s = t * 2;
    r = 255;
    g = Math.round(255 - s * 115); // 255 → 140
  } else {
    const s = (t - 0.5) * 2;
    r = 255;
    g = Math.round(140 - s * 140); // 140 → 0
  }
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}00`;
}

// 3 km (sparse) → 20 km (dense) radius in meters
function densityToRadius(density: number): number {
  return 3000 + densityRatio(density) * 17000;
}

export interface NJCounty {
  name: string;
  density: number;
}

export const NJ_COUNTY_LIST: NJCounty[] = NJ_COUNTIES.map(({ name, density }) => ({
  name,
  density,
}));

interface NJPopulationLayerProps {
  visible: boolean;
}

export function NJPopulationLayer({ visible }: NJPopulationLayerProps) {
  if (!visible) return null;

  return (
    <>
      {NJ_COUNTIES.map((county) => {
        const color = densityToColor(county.density);
        const opacity = 0.3 + densityRatio(county.density) * 0.55;
        return (
          <Circle
            key={county.name}
            center={{ lat: county.lat, lng: county.lng }}
            radius={densityToRadius(county.density)}
            options={{
              fillColor: color,
              fillOpacity: opacity,
              strokeColor: color,
              strokeOpacity: 0.4,
              strokeWeight: 1,
            }}
          />
        );
      })}
    </>
  );
}
