import React from 'react';
import Link from 'next/link';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';

const buttonStyles = tv({
    base: [
        'px-8 py-4 rounded-xl transition-all duration-300 text-base inline-flex items-center justify-center gap-2 cursor-pointer',
        'disabled:pointer-events-none disabled:opacity-50',
    ],
    variants: {
        fill: {
            true: 'bg-[var(--accent-color)] !border-none !text-[var(--white)] hover:opacity-90',
            false: '!bg-transparent border-2 border-[var(--accent-color)] text-[var(--accent-color)] hover:opacity-70',
        },
        color: {
            pink: 'bg-[var(--pink)] border-[var(--pink)] text-[var(--pink)]',
            yellow: 'bg-[var(--yellow)] border-[var(--yellow)] text-[var(--yellow)]',
            orange: 'bg-[var(--orange)] border-[var(--orange)] text-[var(--orange)]',
        },
        fullWidth: {
            true: 'w-full',
        },
    },
    defaultVariants: {
        fill: true,
        color: 'pink',
        fullWidth: false,
    },
});

interface BaseButtonProps extends VariantProps<typeof buttonStyles> {
    text: string;
    beforeIcon?: React.ReactNode;
    afterIcon?: React.ReactNode;
    className?: string;
    link?: string;
}

export default function Button(props: BaseButtonProps) {

    const { text, fill, color, fullWidth, beforeIcon, afterIcon, className, ...restProps } = props;

    const classes = cn(buttonStyles({ fill, color, fullWidth }), className);

    const content = (
        <>
            {beforeIcon && beforeIcon}
            <span>{text}</span>
            {afterIcon && afterIcon}
        </>
    );

    if (props.link) {
        return (
            <Link
                href={props.link}
                className={classes}
            >
                {content}
            </Link>
        );
    }

    return (
        <button
            className={classes}
            {...restProps}
        >
            {content}
        </button>
    );
}