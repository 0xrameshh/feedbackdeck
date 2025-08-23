import Image from "next/image";

interface FeedbackStarLogoProps {
  size?: number;
  className?: string;
}

export function FeedbackStarLogo({ size = 32, className = "" }: FeedbackStarLogoProps) {
  return (
    <Image
      src="/icon-192.png"
      alt="FeedbackStar"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}