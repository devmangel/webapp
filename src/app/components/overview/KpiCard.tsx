'use client';

import { motion } from 'motion/react';
import { Card, CardBody } from 'components/ui/Card';
import { Typography } from 'components/ui/Typography';
import { KpiCardProps } from './types';

export function KpiCard({ title, value, sublabel, accentClass, icon, index = 0 }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      className="h-full"
    >
      <Card variant="elevated" hover className="group h-full">
        <CardBody className="p-6 h-full">
          <div className="flex items-center justify-between h-full min-h-[120px]">
            <div className="flex-1 flex flex-col justify-center">
              <Typography variant="overline" color="secondary">
                {title}
              </Typography>
              <Typography variant="display-sm" className="mt-2 font-bold">
                {value}
              </Typography>
              <div className="mt-2 min-h-[20px]">
                {sublabel && (
                  <Typography 
                    variant="caption" 
                    color="secondary" 
                    className={accentClass || ''}
                  >
                    {sublabel}
                  </Typography>
                )}
              </div>
            </div>
            {icon && (
              <div className="flex-shrink-0 ml-4 p-3 bg-amber-50 rounded-xl text-amber-600 group-hover:bg-amber-100 transition-colors dark:bg-amber-900/20 dark:text-amber-400">
                {icon}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
