import Design01Ribbon from "./Design01Ribbon";
import Design02MinimalCentered from "./Design02MinimalCentered";
import Design03Editorial from "./Design03Editorial";
import Design04Neon from "./Design04Neon";
import Design05PaperCard from "./Design05PaperCard";
import Design06GradientGlass from "./Design06GradientGlass";
import Design07Terminal from "./Design07Terminal";
import Design08SplitScreen from "./Design08SplitScreen";
import Design09Marquee from "./Design09Marquee";
import Design10SparseGeometric from "./Design10SparseGeometric";
import Design11Bento from "./Design11Bento";
import Design12Typewriter from "./Design12Typewriter";
import Design13Newspaper from "./Design13Newspaper";
import Design14GlowOrb from "./Design14GlowOrb";
import Design15MinimalLine from "./Design15MinimalLine";
import Design16Badge from "./Design16Badge";
import Design17Construction from "./Design17Construction";
import Design18Layers from "./Design18Layers";
import Design19Spotlight from "./Design19Spotlight";
import Design20Brutalist from "./Design20Brutalist";

export const PRICING_DESIGNS = [
  { id: 1, name: "Ribbon", component: Design01Ribbon },
  { id: 2, name: "Minimal centered", component: Design02MinimalCentered },
  { id: 3, name: "Editorial", component: Design03Editorial },
  { id: 4, name: "Neon", component: Design04Neon },
  { id: 5, name: "Paper card", component: Design05PaperCard },
  { id: 6, name: "Gradient glass", component: Design06GradientGlass },
  { id: 7, name: "Terminal", component: Design07Terminal },
  { id: 8, name: "Split screen", component: Design08SplitScreen },
  { id: 9, name: "Marquee", component: Design09Marquee },
  { id: 10, name: "Sparse geometric", component: Design10SparseGeometric },
  { id: 11, name: "Bento", component: Design11Bento },
  { id: 12, name: "Typewriter", component: Design12Typewriter },
  { id: 13, name: "Newspaper", component: Design13Newspaper },
  { id: 14, name: "Glow orb", component: Design14GlowOrb },
  { id: 15, name: "Minimal line", component: Design15MinimalLine },
  { id: 16, name: "Badge", component: Design16Badge },
  { id: 17, name: "Construction", component: Design17Construction },
  { id: 18, name: "Layers", component: Design18Layers },
  { id: 19, name: "Spotlight", component: Design19Spotlight },
  { id: 20, name: "Brutalist", component: Design20Brutalist },
] as const;

export type DesignId = (typeof PRICING_DESIGNS)[number]["id"];
