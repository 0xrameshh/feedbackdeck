import Image from "next/image";

interface SujhavLogoProps {
  size?: number;
  className?: string;
}

export function SujhavLogo({ size = 32, className = "" }: SujhavLogoProps) {
  return (
    <Image
      src="/icon-192.png"
      alt="Sujhav"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}