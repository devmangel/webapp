

import Link from 'next/link';

interface PrimaryButtonProps {
    text: string;
    href: string;
}

const PrimaryButton = ({ text, href }: PrimaryButtonProps) => {
    return (
        <div className="mt-12 text-center">
            <Link
                href={href}
                className={`
                inline-flex items-center justify-center
                px-6 py-3 rounded-lg shadow-sm
                text-sm font-medium
                text-[var(--color-text-primary)] bg-[var(--color-neutral)]
                border border-[var(--color-border)]
                focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
                transition-all duration-200 ease-in-out
                hover:shadow-md hover:scale-[1.02] active:scale-[0.98]
              `.trim().replace(/\s+/g, ' ')}
            >
                {text}
            </Link>
        </div>
    );
}

export default PrimaryButton;
