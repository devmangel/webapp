'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import SignOutModal from '../auth/SignOutModal';

interface SidebarSignOutButtonProps {
  collapsed: boolean;
}

export default function SidebarSignOutButton({ collapsed }: SidebarSignOutButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={handleOpenModal}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          w-full flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200
          text-gray-600 hover:text-gray-900 hover:bg-amber-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-amber-900/20
          focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
          group
        `}
      >
        {/* Icon */}
        <div className={`flex-shrink-0 ${collapsed ? '' : 'mr-3'}`}>
          <svg
            className="w-5 h-5 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
        </div>

        {/* Text (only when not collapsed) */}
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="whitespace-nowrap"
          >
            Cerrar sesión
          </motion.span>
        )}

        {/* Tooltip for collapsed state */}
        {collapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            Cerrar sesión
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-full">
              <div className="border-4 border-transparent border-r-gray-900 dark:border-r-gray-700"></div>
            </div>
          </div>
        )}
      </motion.button>

      {/* Modal */}
      <SignOutModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
}
