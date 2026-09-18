import Image from "next/image";

interface FeedbackDeckLogoProps {
  size?: number;
  className?: string;
}

export function FeedbackDeckLogo({ size = 32, className = "" }: FeedbackDeckLogoProps) {
  return (
    <Image
      src="/icon-192.png"
      alt="FeedbackDeck"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}