import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

type SecurityCardProps = {
    title: string;
    content: string | string[];
    bgColor: string;
    textColor: string;
    iconBgColor: string;
    iconName: string;
    iconColor?: string;
    iconFilled?: boolean;
    iconStrokeWidth?: number;
};

export const SecurityCard = ({
    title,
    content,
    bgColor,
    textColor,
    iconBgColor,
    iconName,
    iconColor = 'var(--white)',
    iconFilled = false,
    iconStrokeWidth = 2,
}: SecurityCardProps) => {
    const contentArray = Array.isArray(content) ? content : [content];

    const renderContent = (text: string) => {
        // Check if text starts with bullet point
        if (text.trim().startsWith('•')) {
            return <p className="mb-[10px] ml-[27px]">{text.trim()}</p>;
        }
        return <p className="mb-[10px]">{text.trim()}</p>;
    };

    return (
        <div
            className={cn(
                'flex flex-col gap-2 px-14 py-12 rounded-[32px] border-[5px] border-[var(--black)] w-full',
                bgColor,
            )}
        >
            <div className="flex flex-col gap-4">
                <div
                    className={cn(
                        'rounded-full size-20 flex items-center justify-center shrink-0',
                        iconBgColor,
                    )}
                >
                    <Icon
                        name={iconName}
                        width={45}
                        height={45}
                        fillColor={iconFilled ? iconColor : 'none'}
                        strokeColor={iconColor}
                        strokeWidth={iconFilled ? 0 : iconStrokeWidth}
                    />
                </div>
                <h3
                    className={cn(
                        'font-montserrat font-bold text-[50px] leading-[normal]',
                        textColor,
                    )}
                >
                    {title}
                </h3>
            </div>
            <div className="p-[10px]">
                <div className={cn('font-poppins text-[18px] leading-[32.4px]', textColor)}>
                    {contentArray.map((paragraph, index) => (
                        <div key={index}>{renderContent(paragraph)}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};
