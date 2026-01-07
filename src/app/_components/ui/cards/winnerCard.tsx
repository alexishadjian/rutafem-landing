import Button from '@/components/ui/button';

interface WinnerCardProps {
    type: 'conductrice' | 'voyageuse';
    title: string;
    subtitle: string;
    description: string[];
    bgColor: string;
    textColor: string;
    buttonLink: string;
    buttonText: string;
}

export default function WinnerCard({
    type,
    title,
    subtitle,
    description,
    bgColor,
    textColor,
    buttonLink,
    buttonText,
}: WinnerCardProps) {
    return (
        <div
            className="relative w-full md:w-1/2 rounded-[40px] p-12 overflow-hidden min-h-[600px] flex flex-col justify-between"
            style={{ backgroundColor: bgColor, color: textColor }}
        >
            {/* Formes de fond ondulées SVG */}
            <div className="absolute inset-0 pointer-events-none">
                {type === 'conductrice' ? (
                    <svg
                        className="absolute -top-[50px] -left-[55px] w-[120%] h-auto"
                        viewBox="0 0 688 211"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M28.8789 148.282C28.8789 148.226 103.903 11.9063 203.536 30.6806C388.424 65.5202 373.537 330.199 658.461 65.5205"
                            stroke="var(--white)"
                            strokeWidth="57.7589"
                            strokeLinecap="round"
                        />
                    </svg>
                ) : (
                    <svg
                        className="absolute top-[-110px] right-[-100px] rotate-12 w-[120%] h-auto"
                        viewBox="0 0 688 211"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M28.8789 148.282C28.8789 148.226 103.903 11.9063 203.536 30.6806C388.424 65.5202 373.537 330.199 658.461 65.5205"
                            stroke="var(--white)"
                            strokeWidth="57.7589"
                            strokeLinecap="round"
                        />
                    </svg>
                )}
            </div>

            <div className="relative z-10 pt-16">
                <h3 className="text-[30px] mb-4 leading-none">{title}</h3>
                <p className="text-[18px] mb-6">{subtitle}</p>

                <div className="flex flex-col gap-4">
                    {description.map((paragraph, index) => (
                        <p key={index} className="text-[16px]">
                            {paragraph}
                        </p>
                    ))}
                </div>
            </div>

            <div className="relative z-10">
                <Button text={buttonText} link={buttonLink} color="white" fill={true} />
            </div>
        </div>
    );
}
