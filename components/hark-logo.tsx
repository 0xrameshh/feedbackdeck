import Image from "next/image";

interface HarkLogoProps {
  size?: number;
  className?: string;
}

export function HarkLogo({ size = 32, className = "" }: HarkLogoProps) {
  return (
    <Image
      src="/icon-192.png"
      alt="Hark"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}