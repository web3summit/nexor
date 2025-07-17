import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from './Card';

export interface QRCodeProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  className?: string;
  title?: string;
  description?: string;
}

export const QRCode: React.FC<QRCodeProps> = ({
  value,
  size = 200,
  bgColor = '#ffffff',
  fgColor = '#000000',
  level = 'L',
  includeMargin = false,
  className = '',
  title,
  description,
}) => {
  return (
    <Card className={`flex flex-col items-center ${className}`} glassmorphism>
      {title && (
        <h3 className="text-lg font-medium mb-2 text-center">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 text-center">{description}</p>
      )}
      <div className="bg-white rounded-lg p-2">
        <QRCodeSVG
          value={value}
          size={size}
          bgColor={bgColor}
          fgColor={fgColor}
          level={level}
          includeMargin={includeMargin}
        />
      </div>
    </Card>
  );
};
