import Link from "next/link";
import Image from "next/image";
import { TrendingUp } from "lucide-react";
import { systemHealthData } from "@/data/dashboardData";

export default function SystemHealth() {
  const { brainStatus, connectedDevices, totalTokens } = systemHealthData;

  return (
    <div
      className="rounded-2xl p-8 border border-white/10"
      style={{
        width: "680px",
        height: "430px",
        background: "#FCFCFC29",
        borderRadius: "16px",
      }}
    >
      <h2 className="text-xl font-semibold mb-6">System Health</h2>

      <Link href={brainStatus.link} className="block mb-3">
        <div
          className="rounded-lg p-4 flex items-center justify-between hover:brightness-110 active:brightness-105 transition-all cursor-pointer"
          style={{
            background: "#F3CEFF85",
            borderRadius: "8px",
            height: "53px",
          }}
        >
          <div className="flex items-center gap-3">
            <Image src="/brain.svg" alt="Brain" width={20} height={20} className="w-5 h-5" />
            <span className="text-zinc-900 font-medium">Brain Status</span>
          </div>
          <div className="font-semibold flex gap-1" style={{ color: brainStatus.statusColor }}>
            <Image src="/right.svg" alt="Brain" width={20} height={20} className="w-5 h-5" />
            {brainStatus.status}
          </div>
        </div>
      </Link>

      <div
        className="rounded-lg p-4 mb-3 flex items-center justify-between"
        style={{
          background: "#F3CEFF85",
          borderRadius: "8px",
          height: "53px",
        }}
      >
        <div className="flex items-center gap-3">
          <Image src="/device.svg" alt="Device" width={20} height={20} className="w-5 h-5" />
          <span className="text-zinc-900 font-medium">Connected Devices</span>
        </div>
        <span className="text-2xl font-bold text-zinc-900">{connectedDevices}</span>
      </div>

      <div
        className="rounded-lg p-4"
        style={{
          background: "#F3CEFF85",
          borderRadius: "8px",
        }}
      >
        <div className="text-zinc-900 text-sm mb-2">Total tokens today</div>
        <div className="flex items-center gap-2">
          <span className="text-4xl font-bold text-zinc-900">{totalTokens.count}</span>
          <div className="flex items-center text-[#045900] font-semibold">
            <TrendingUp className="w-5 h-5" />
            <span>{totalTokens.percentage}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
