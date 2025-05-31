import Image from 'next/image';

interface InkBotLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

const sizeClasses = {
  sm: 'h-10 w-10',
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
  xl: 'h-32 w-32 md:h-40 md:w-40 lg:h-48 lg:w-48',
};

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl md:text-4xl lg:text-5xl',
};

export default function InkBotLogo({ 
  size = 'md', 
  className = '', 
  showText = false,
  textClassName = ''
}: InkBotLogoProps) {
  const logoClasses = `${sizeClasses[size]} ${className}`;
  const textClasses = `${textSizeClasses[size]} font-bold ${textClassName}`;

  if (showText) {
    return (
      <div className="flex items-center space-x-3">
        <img 
          src="/InkBotLogo4.png" 
          alt="InkBot Logo" 
          className={logoClasses}
        />
        <span className={textClasses}>InkBot</span>
      </div>
    );
  }

  return (
    <img 
      src="/InkBotLogo4.png" 
      alt="InkBot Logo" 
      className={logoClasses}
    />
  );
}
