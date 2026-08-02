import Svg, { Path, Rect, Line } from "react-native-svg";

interface ReelsIconProps {
  size?: number;
  color?: string;
}

export default function ReelsIcon({
  size = 24,
  color = "#111111",
}: ReelsIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Outer rounded rectangle */}
      <Rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="4"
        stroke={color}
        strokeWidth="2"
      />
      {/* Top film-strip line */}
      <Line
        x1="2"
        y1="7"
        x2="22"
        y2="7"
        stroke={color}
        strokeWidth="2"
      />
      {/* Play triangle */}
      <Path
        d="M10 9.5L16 12L10 14.5V9.5Z"
        fill={color}
      />
      {/* Top-left corner mark */}
      <Path
        d="M6 2V5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M2 6H5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Bottom-right corner mark */}
      <Path
        d="M18 22V19"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M22 18H19"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}