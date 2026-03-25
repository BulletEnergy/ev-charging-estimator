'use client';

import type { EquipmentType } from '@/lib/map/types';

/**
 * Inline SVG icons for each equipment type. Designed to be recognizable
 * at small sizes on a satellite map and inside the compact toolbar.
 */

function L3SuperchargerIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Tall pedestal body */}
      <rect x="7" y="3" width="10" height="16" rx="2" fill="#1E3A5F" />
      {/* Screen */}
      <rect x="9" y="5" width="6" height="5" rx="1" fill="#60A5FA" />
      {/* Cable holster */}
      <path d="M17 14 C19 14, 19 17, 17 17" stroke="#F59E0B" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Connector nozzle */}
      <rect x="16.5" y="16.5" width="3" height="2" rx="0.5" fill="#F59E0B" />
      {/* Lightning bolt on screen */}
      <path d="M13 6 L11 9 L13 9 L11 12" stroke="#FDE047" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Base */}
      <rect x="6" y="19" width="12" height="2" rx="1" fill="#0F172A" />
    </svg>
  );
}

function L2ChargerIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Wall-mount box */}
      <rect x="6" y="4" width="12" height="14" rx="2" fill="#2563EB" />
      {/* Screen/indicator */}
      <rect x="8" y="6" width="8" height="4" rx="1" fill="#93C5FD" />
      {/* Cable coming out bottom */}
      <path d="M12 18 L12 20 C12 21, 14 21, 14 20 L14 19" stroke="#374151" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Plug connector */}
      <circle cx="14" cy="19" r="1.5" fill="#374151" />
      <circle cx="14" cy="19" r="0.5" fill="#93C5FD" />
      {/* LED indicator */}
      <circle cx="12" cy="12" r="1.5" fill="#34D399" />
      {/* Mount bracket */}
      <rect x="5" y="3" width="14" height="1.5" rx="0.5" fill="#64748B" />
    </svg>
  );
}

function TransformerIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Transformer box */}
      <rect x="4" y="6" width="16" height="12" rx="1" fill="#6B7280" />
      {/* Cooling fins */}
      <rect x="2" y="8" width="2" height="8" rx="0.5" fill="#9CA3AF" />
      <rect x="20" y="8" width="2" height="8" rx="0.5" fill="#9CA3AF" />
      {/* High voltage symbol */}
      <path d="M13 8 L11 12 L13 12 L11 16" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Bushings on top */}
      <circle cx="8" cy="5" r="1.5" fill="#DC2626" />
      <circle cx="16" cy="5" r="1.5" fill="#DC2626" />
      {/* Base pad */}
      <rect x="3" y="18" width="18" height="2" rx="0.5" fill="#374151" />
    </svg>
  );
}

function SwitchgearIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Cabinet */}
      <rect x="4" y="3" width="16" height="18" rx="1" fill="#4B5563" />
      {/* Door line */}
      <line x1="12" y1="4" x2="12" y2="20" stroke="#374151" strokeWidth="0.5" />
      {/* Breaker rows */}
      <rect x="6" y="6" width="4" height="2" rx="0.5" fill="#1F2937" />
      <rect x="6" y="10" width="4" height="2" rx="0.5" fill="#1F2937" />
      <rect x="6" y="14" width="4" height="2" rx="0.5" fill="#1F2937" />
      <rect x="14" y="6" width="4" height="2" rx="0.5" fill="#1F2937" />
      <rect x="14" y="10" width="4" height="2" rx="0.5" fill="#1F2937" />
      <rect x="14" y="14" width="4" height="2" rx="0.5" fill="#1F2937" />
      {/* Status LEDs */}
      <circle cx="8" cy="7" r="0.7" fill="#34D399" />
      <circle cx="8" cy="11" r="0.7" fill="#34D399" />
      <circle cx="8" cy="15" r="0.7" fill="#F59E0B" />
      {/* Handle */}
      <rect x="11" y="17" width="2" height="1" rx="0.5" fill="#9CA3AF" />
    </svg>
  );
}

function UtilityMeterIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Meter body (round) */}
      <circle cx="12" cy="12" r="8" fill="#E5E7EB" stroke="#6B7280" strokeWidth="1" />
      {/* Glass dome */}
      <circle cx="12" cy="11" r="5.5" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="0.5" />
      {/* Spinning disk */}
      <ellipse cx="12" cy="13" rx="4" ry="1" fill="#374151" opacity="0.3" />
      {/* Digital readout */}
      <rect x="8.5" y="8" width="7" height="3" rx="0.5" fill="#1F2937" />
      <text x="12" y="10.5" textAnchor="middle" fill="#34D399" fontSize="2.5" fontFamily="monospace">kWh</text>
      {/* Conduit connections */}
      <rect x="10" y="20" width="1.5" height="2" fill="#6B7280" />
      <rect x="12.5" y="20" width="1.5" height="2" fill="#6B7280" />
    </svg>
  );
}

function MeterRoomIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Building/room outline */}
      <rect x="3" y="5" width="18" height="15" rx="1" fill="#78716C" />
      {/* Roof */}
      <path d="M2 5 L12 1 L22 5" fill="#57534E" stroke="#44403C" strokeWidth="0.5" />
      {/* Door */}
      <rect x="9" y="12" width="6" height="8" rx="0.5" fill="#44403C" />
      <circle cx="13.5" cy="16" r="0.7" fill="#D4D4D8" />
      {/* High voltage sign */}
      <rect x="8" y="6" width="8" height="4" rx="0.5" fill="#FDE047" />
      <path d="M13 6.5 L11 8.5 L13 8.5 L11 10.5" stroke="#DC2626" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Ventilation */}
      <rect x="4" y="7" width="2" height="0.5" fill="#A8A29E" />
      <rect x="4" y="8.5" width="2" height="0.5" fill="#A8A29E" />
      <rect x="4" y="10" width="2" height="0.5" fill="#A8A29E" />
    </svg>
  );
}

function JunctionBoxIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Box */}
      <rect x="5" y="5" width="14" height="14" rx="1.5" fill="#6B7280" stroke="#4B5563" strokeWidth="0.5" />
      {/* Cover plate screws */}
      <circle cx="7" cy="7" r="0.8" fill="#9CA3AF" />
      <circle cx="17" cy="7" r="0.8" fill="#9CA3AF" />
      <circle cx="7" cy="17" r="0.8" fill="#9CA3AF" />
      <circle cx="17" cy="17" r="0.8" fill="#9CA3AF" />
      {/* Conduit knockouts */}
      <circle cx="12" cy="5" r="1.5" fill="#4B5563" />
      <circle cx="12" cy="19" r="1.5" fill="#4B5563" />
      <circle cx="5" cy="12" r="1.5" fill="#4B5563" />
      <circle cx="19" cy="12" r="1.5" fill="#4B5563" />
      {/* Wire connections inside */}
      <line x1="9" y1="10" x2="15" y2="10" stroke="#DC2626" strokeWidth="1" />
      <line x1="9" y1="12" x2="15" y2="12" stroke="#1F2937" strokeWidth="1" />
      <line x1="9" y1="14" x2="15" y2="14" stroke="#34D399" strokeWidth="1" />
    </svg>
  );
}

function BollardIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Bollard post */}
      <rect x="8" y="3" width="8" height="16" rx="4" fill="#F59E0B" />
      {/* Reflective stripe */}
      <rect x="8" y="8" width="8" height="3" rx="0" fill="#FBBF24" />
      <rect x="8.5" y="8.5" width="7" height="2" rx="0" fill="#FDE68A" opacity="0.6" />
      {/* Top cap */}
      <ellipse cx="12" cy="3.5" rx="4" ry="1.5" fill="#D97706" />
      {/* Base plate */}
      <rect x="6" y="19" width="12" height="2" rx="1" fill="#374151" />
      {/* Anchor bolts */}
      <circle cx="8" cy="20" r="0.7" fill="#6B7280" />
      <circle cx="16" cy="20" r="0.7" fill="#6B7280" />
    </svg>
  );
}

function PanelIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="2" width="16" height="20" rx="1.5" fill="#2563EB" />
      <rect x="6" y="4" width="12" height="16" rx="1" fill="#1E40AF" />
      {/* Breaker rows */}
      <rect x="7" y="5" width="4" height="1.5" rx="0.3" fill="#60A5FA" />
      <rect x="7" y="8" width="4" height="1.5" rx="0.3" fill="#60A5FA" />
      <rect x="7" y="11" width="4" height="1.5" rx="0.3" fill="#60A5FA" />
      <rect x="7" y="14" width="4" height="1.5" rx="0.3" fill="#60A5FA" />
      <rect x="13" y="5" width="4" height="1.5" rx="0.3" fill="#60A5FA" />
      <rect x="13" y="8" width="4" height="1.5" rx="0.3" fill="#60A5FA" />
      <rect x="13" y="11" width="4" height="1.5" rx="0.3" fill="#60A5FA" />
      <rect x="13" y="14" width="4" height="1.5" rx="0.3" fill="#60A5FA" />
      {/* Main breaker */}
      <rect x="9" y="17" width="6" height="2" rx="0.5" fill="#DC2626" />
    </svg>
  );
}

function DisconnectIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="5" y="4" width="14" height="16" rx="1.5" fill="#6366F1" />
      {/* Handle */}
      <rect x="10" y="1" width="4" height="4" rx="1" fill="#4F46E5" />
      {/* Switch position indicator */}
      <circle cx="12" cy="10" r="3" fill="#312E81" />
      <path d="M12 7 L12 10" stroke="#A5B4FC" strokeWidth="2" strokeLinecap="round" />
      {/* Labels */}
      <rect x="7" y="15" width="4" height="1" rx="0.3" fill="#A5B4FC" />
      <rect x="13" y="15" width="4" height="1" rx="0.3" fill="#A5B4FC" />
      {/* Base */}
      <rect x="4" y="20" width="16" height="2" rx="0.5" fill="#374151" />
    </svg>
  );
}

function ConcretePadIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Pad surface */}
      <rect x="2" y="8" width="20" height="12" rx="1" fill="#A8A29E" />
      <rect x="3" y="9" width="18" height="10" rx="0.5" fill="#D6D3D1" />
      {/* Texture lines */}
      <line x1="7" y1="9" x2="7" y2="19" stroke="#A8A29E" strokeWidth="0.5" />
      <line x1="12" y1="9" x2="12" y2="19" stroke="#A8A29E" strokeWidth="0.5" />
      <line x1="17" y1="9" x2="17" y2="19" stroke="#A8A29E" strokeWidth="0.5" />
      <line x1="3" y1="14" x2="21" y2="14" stroke="#A8A29E" strokeWidth="0.5" />
      {/* Dimension arrows */}
      <path d="M4 6 L20 6" stroke="#78716C" strokeWidth="0.8" markerEnd="url(#arr)" markerStart="url(#arr)" />
      <text x="12" y="5" textAnchor="middle" fill="#78716C" fontSize="3" fontFamily="sans-serif">pad</text>
    </svg>
  );
}

function EvSignIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Post */}
      <rect x="11" y="12" width="2" height="10" fill="#6B7280" />
      {/* Sign face */}
      <rect x="4" y="2" width="16" height="11" rx="1.5" fill="#22C55E" />
      <rect x="5" y="3" width="14" height="9" rx="1" fill="#16A34A" />
      {/* EV text */}
      <text x="12" y="9" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold" fontFamily="sans-serif">EV</text>
      {/* Lightning bolt */}
      <path d="M12 3.5 L11 5.5 L13 5.5" stroke="#FDE047" strokeWidth="0.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function WheelStopIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Wheel stop block */}
      <rect x="2" y="14" width="20" height="5" rx="1.5" fill="#A3A3A3" />
      <rect x="3" y="15" width="18" height="3" rx="1" fill="#D4D4D4" />
      {/* Reflective stripe */}
      <rect x="3" y="15.5" width="18" height="1" fill="#FDE047" opacity="0.6" />
      {/* Anchor bolts */}
      <circle cx="6" cy="19.5" r="1" fill="#737373" />
      <circle cx="18" cy="19.5" r="1" fill="#737373" />
      {/* Ground line */}
      <line x1="1" y1="21" x2="23" y2="21" stroke="#A3A3A3" strokeWidth="0.5" />
    </svg>
  );
}

function LightingIcon({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* Pole */}
      <rect x="11" y="8" width="2" height="14" fill="#6B7280" />
      {/* Arm */}
      <path d="M13 8 L18 6" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
      {/* Light fixture */}
      <ellipse cx="18" cy="5.5" rx="3" ry="1.5" fill="#EAB308" />
      <ellipse cx="18" cy="5.5" rx="2" ry="1" fill="#FDE047" />
      {/* Light rays */}
      <line x1="18" y1="7.5" x2="16" y2="11" stroke="#FDE047" strokeWidth="0.5" opacity="0.5" />
      <line x1="18" y1="7.5" x2="18" y2="11" stroke="#FDE047" strokeWidth="0.5" opacity="0.5" />
      <line x1="18" y1="7.5" x2="20" y2="11" stroke="#FDE047" strokeWidth="0.5" opacity="0.5" />
      {/* Base plate */}
      <rect x="9" y="21" width="6" height="1.5" rx="0.5" fill="#374151" />
    </svg>
  );
}

const ICON_COMPONENTS: Record<EquipmentType, React.FC<{ size?: number; className?: string }>> = {
  charger_l2: L2ChargerIcon,
  charger_l3: L3SuperchargerIcon,
  transformer: TransformerIcon,
  switchgear: SwitchgearIcon,
  utility_meter: UtilityMeterIcon,
  meter_room: MeterRoomIcon,
  junction_box: JunctionBoxIcon,
  bollard: BollardIcon,
  panel: PanelIcon,
  disconnect: DisconnectIcon,
  concrete_pad: ConcretePadIcon,
  ev_sign: EvSignIcon,
  wheel_stop: WheelStopIcon,
  lighting: LightingIcon,
};

export function EquipmentIcon({
  type,
  size = 24,
  className,
}: {
  type: EquipmentType;
  size?: number;
  className?: string;
}) {
  const Component = ICON_COMPONENTS[type];
  return <Component size={size} className={className} />;
}

/**
 * Generates an SVG data URI for use in Mapbox markers (DOM elements).
 * Returns an inline SVG string that can be set as innerHTML.
 */
export function getEquipmentSvgHtml(type: EquipmentType, size = 28): string {
  const svgMap: Record<EquipmentType, string> = {
    charger_l3: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
      <rect x="7" y="3" width="10" height="16" rx="2" fill="#1E3A5F"/>
      <rect x="9" y="5" width="6" height="5" rx="1" fill="#60A5FA"/>
      <path d="M17 14 C19 14,19 17,17 17" stroke="#F59E0B" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <rect x="16.5" y="16.5" width="3" height="2" rx="0.5" fill="#F59E0B"/>
      <path d="M13 6 L11 9 L13 9 L11 12" stroke="#FDE047" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <rect x="6" y="19" width="12" height="2" rx="1" fill="#0F172A"/>
    </svg>`,
    charger_l2: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
      <rect x="6" y="4" width="12" height="14" rx="2" fill="#2563EB"/>
      <rect x="8" y="6" width="8" height="4" rx="1" fill="#93C5FD"/>
      <path d="M12 18 L12 20 C12 21,14 21,14 20 L14 19" stroke="#374151" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <circle cx="14" cy="19" r="1.5" fill="#374151"/><circle cx="14" cy="19" r="0.5" fill="#93C5FD"/>
      <circle cx="12" cy="12" r="1.5" fill="#34D399"/>
      <rect x="5" y="3" width="14" height="1.5" rx="0.5" fill="#64748B"/>
    </svg>`,
    transformer: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="6" width="16" height="12" rx="1" fill="#6B7280"/>
      <rect x="2" y="8" width="2" height="8" rx="0.5" fill="#9CA3AF"/>
      <rect x="20" y="8" width="2" height="8" rx="0.5" fill="#9CA3AF"/>
      <path d="M13 8 L11 12 L13 12 L11 16" stroke="#FDE047" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <circle cx="8" cy="5" r="1.5" fill="#DC2626"/><circle cx="16" cy="5" r="1.5" fill="#DC2626"/>
      <rect x="3" y="18" width="18" height="2" rx="0.5" fill="#374151"/>
    </svg>`,
    switchgear: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="1" fill="#4B5563"/>
      <line x1="12" y1="4" x2="12" y2="20" stroke="#374151" stroke-width="0.5"/>
      <rect x="6" y="6" width="4" height="2" rx="0.5" fill="#1F2937"/>
      <rect x="6" y="10" width="4" height="2" rx="0.5" fill="#1F2937"/>
      <rect x="6" y="14" width="4" height="2" rx="0.5" fill="#1F2937"/>
      <rect x="14" y="6" width="4" height="2" rx="0.5" fill="#1F2937"/>
      <rect x="14" y="10" width="4" height="2" rx="0.5" fill="#1F2937"/>
      <rect x="14" y="14" width="4" height="2" rx="0.5" fill="#1F2937"/>
      <circle cx="8" cy="7" r="0.7" fill="#34D399"/>
      <circle cx="8" cy="11" r="0.7" fill="#34D399"/>
      <circle cx="8" cy="15" r="0.7" fill="#F59E0B"/>
    </svg>`,
    utility_meter: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" fill="#E5E7EB" stroke="#6B7280" stroke-width="1"/>
      <circle cx="12" cy="11" r="5.5" fill="#DBEAFE" stroke="#93C5FD" stroke-width="0.5"/>
      <rect x="8.5" y="8" width="7" height="3" rx="0.5" fill="#1F2937"/>
      <rect x="10" y="20" width="1.5" height="2" fill="#6B7280"/>
      <rect x="12.5" y="20" width="1.5" height="2" fill="#6B7280"/>
    </svg>`,
    meter_room: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="15" rx="1" fill="#78716C"/>
      <path d="M2 5 L12 1 L22 5" fill="#57534E" stroke="#44403C" stroke-width="0.5"/>
      <rect x="9" y="12" width="6" height="8" rx="0.5" fill="#44403C"/>
      <circle cx="13.5" cy="16" r="0.7" fill="#D4D4D8"/>
      <rect x="8" y="6" width="8" height="4" rx="0.5" fill="#FDE047"/>
      <path d="M13 6.5 L11 8.5 L13 8.5 L11 10.5" stroke="#DC2626" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>`,
    junction_box: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="5" width="14" height="14" rx="1.5" fill="#6B7280" stroke="#4B5563" stroke-width="0.5"/>
      <circle cx="7" cy="7" r="0.8" fill="#9CA3AF"/><circle cx="17" cy="7" r="0.8" fill="#9CA3AF"/>
      <circle cx="7" cy="17" r="0.8" fill="#9CA3AF"/><circle cx="17" cy="17" r="0.8" fill="#9CA3AF"/>
      <circle cx="12" cy="5" r="1.5" fill="#4B5563"/><circle cx="12" cy="19" r="1.5" fill="#4B5563"/>
      <line x1="9" y1="10" x2="15" y2="10" stroke="#DC2626" stroke-width="1"/>
      <line x1="9" y1="12" x2="15" y2="12" stroke="#1F2937" stroke-width="1"/>
      <line x1="9" y1="14" x2="15" y2="14" stroke="#34D399" stroke-width="1"/>
    </svg>`,
    bollard: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
      <rect x="8" y="3" width="8" height="16" rx="4" fill="#F59E0B"/>
      <rect x="8" y="8" width="8" height="3" fill="#FBBF24"/>
      <ellipse cx="12" cy="3.5" rx="4" ry="1.5" fill="#D97706"/>
      <rect x="6" y="19" width="12" height="2" rx="1" fill="#374151"/>
      <circle cx="8" cy="20" r="0.7" fill="#6B7280"/><circle cx="16" cy="20" r="0.7" fill="#6B7280"/>
    </svg>`,
    panel: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="2" width="16" height="20" rx="1.5" fill="#2563EB"/>
      <rect x="6" y="4" width="12" height="16" rx="1" fill="#1E40AF"/>
      <rect x="7" y="5" width="4" height="1.5" rx="0.3" fill="#60A5FA"/>
      <rect x="7" y="8" width="4" height="1.5" rx="0.3" fill="#60A5FA"/>
      <rect x="13" y="5" width="4" height="1.5" rx="0.3" fill="#60A5FA"/>
      <rect x="13" y="8" width="4" height="1.5" rx="0.3" fill="#60A5FA"/>
      <rect x="9" y="17" width="6" height="2" rx="0.5" fill="#DC2626"/>
    </svg>`,
    disconnect: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="4" width="14" height="16" rx="1.5" fill="#6366F1"/>
      <rect x="10" y="1" width="4" height="4" rx="1" fill="#4F46E5"/>
      <circle cx="12" cy="10" r="3" fill="#312E81"/>
      <path d="M12 7 L12 10" stroke="#A5B4FC" stroke-width="2" stroke-linecap="round"/>
      <rect x="4" y="20" width="16" height="2" rx="0.5" fill="#374151"/>
    </svg>`,
    concrete_pad: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="8" width="20" height="12" rx="1" fill="#A8A29E"/>
      <rect x="3" y="9" width="18" height="10" rx="0.5" fill="#D6D3D1"/>
      <line x1="7" y1="9" x2="7" y2="19" stroke="#A8A29E" stroke-width="0.5"/>
      <line x1="12" y1="9" x2="12" y2="19" stroke="#A8A29E" stroke-width="0.5"/>
      <line x1="17" y1="9" x2="17" y2="19" stroke="#A8A29E" stroke-width="0.5"/>
    </svg>`,
    ev_sign: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
      <rect x="11" y="12" width="2" height="10" fill="#6B7280"/>
      <rect x="4" y="2" width="16" height="11" rx="1.5" fill="#22C55E"/>
      <rect x="5" y="3" width="14" height="9" rx="1" fill="#16A34A"/>
      <text x="12" y="9" text-anchor="middle" fill="white" font-size="6" font-weight="bold">EV</text>
    </svg>`,
    wheel_stop: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="14" width="20" height="5" rx="1.5" fill="#A3A3A3"/>
      <rect x="3" y="15" width="18" height="3" rx="1" fill="#D4D4D4"/>
      <rect x="3" y="15.5" width="18" height="1" fill="#FDE047" opacity="0.6"/>
      <circle cx="6" cy="19.5" r="1" fill="#737373"/><circle cx="18" cy="19.5" r="1" fill="#737373"/>
    </svg>`,
    lighting: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
      <rect x="11" y="8" width="2" height="14" fill="#6B7280"/>
      <path d="M13 8 L18 6" stroke="#6B7280" stroke-width="1.5" stroke-linecap="round"/>
      <ellipse cx="18" cy="5.5" rx="3" ry="1.5" fill="#EAB308"/>
      <ellipse cx="18" cy="5.5" rx="2" ry="1" fill="#FDE047"/>
      <rect x="9" y="21" width="6" height="1.5" rx="0.5" fill="#374151"/>
    </svg>`,
  };

  return svgMap[type] ?? '';
}
