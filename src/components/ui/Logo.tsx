import Image from "next/image";
import LogoImage from "@/Logo.png";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className, width = 40, height = 40 }: LogoProps) {
  return (
    <Image
      src={LogoImage}
      alt="Oi! Lend Me Logo"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
