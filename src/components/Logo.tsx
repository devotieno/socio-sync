import Image from 'next/image'

interface LogoProps {
  size?: number
  className?: string
  showText?: boolean
}

export default function Logo({ size = 32, className = '', showText = true }: LogoProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Image
        src="/icon-512.png"
        alt="SocialSync Logo"
        width={size}
        height={size}
        className="rounded-lg"
        priority={size >= 64} // Prioritize larger logos
      />
      {showText && (
        <span className="text-2xl font-bold text-gray-900">SocialSync</span>
      )}
    </div>
  )
}
