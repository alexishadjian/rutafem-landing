import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

const buttonStyles = tv({
    base: [
        'px-8 py-4 rounded-xl transition-all duration-300 text-base inline-flex items-center justify-center gap-2 cursor-pointer',
        'disabled:pointer-events-none disabled:opacity-50',
    ],
    variants: {
        fill: {
            true: 'bg-[var(--accent-color)] !text-[var(--black)] hover:opacity-90',
            false: '!bg-transparent border-2 border-[var(--accent-color)] hover:opacity-70',
        },
        color: {
            pink: 'bg-[var(--pink)] border-[var(--pink)]',
            yellow: 'bg-[var(--yellow)] border-[var(--yellow)] text-[var(--yellow)]',
            orange: 'bg-[var(--orange)] border-[var(--orange)] text-[var(--orange)]',
            white: 'bg-[var(--white)] border-2 border-[var(--black)] text-[var(--black)]',
            transparent: 'bg-transparent text-[var(--accent-color)]',
        },
        fullWidth: {
            true: 'w-full',
        },
        iconOnly: {
            true: 'p-4 rounded-full',
        },
    },
    defaultVariants: {
        fill: true,
        color: 'pink',
        fullWidth: false,
    },
});

interface BaseButtonProps extends VariantProps<typeof buttonStyles> {
    text?: string;
    beforeIcon?: React.ReactNode;
    afterIcon?: React.ReactNode;
    className?: string;
    link?: string;
    iconOnly?: boolean;
    onClick?: () => void;
}

export default function Button(props: BaseButtonProps) {
    const {
        text,
        fill,
        color,
        fullWidth,
        beforeIcon,
        afterIcon,
        className,
        onClick,
        iconOnly,
        ...restProps
    } = props;

    const classes = cn(buttonStyles({ fill, color, fullWidth, iconOnly }), className);

    const content = (
        <>
            {beforeIcon && beforeIcon}
            {text && <span>{text}</span>}
            {afterIcon && afterIcon}
        </>
    );

    if (props.link) {
        return (
            <Link href={props.link} className={classes} onClick={onClick}>
                {content}
            </Link>
        );
    }

    return (
        <button className={classes} {...restProps} onClick={onClick}>
            {content}
        </button>
    );
}
