import Image from 'next/image'

interface LogoProps {
  size?: number
  className?: string
  showText?: boolean
}

export default function Logo({ size = 32, className = '', showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/icon-512.png"
        alt="Xync Logo"
        width={size}
        height={size}
        className="rounded-lg"
        priority={size >= 64} // Prioritize larger logos
      />
      {showText && (
        <span className="font-outfit text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">Xync</span>
      )}
    </div>
  )
}
