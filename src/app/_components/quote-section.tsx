import { DownQuotes, UpQuotes, YellowLine1, YellowLine2 } from '@/images';
import Image from 'next/image';

type QuoteSectionProps = {
    quote: string;
    author?: string;
    role?: string;
};

export const QuoteSection = ({ quote, author, role }: QuoteSectionProps) => (
    <div className="relative w-full">
        {/* Decorative lines - top left, outside pink section but overlapping */}
        <div className="absolute right-10 -top-32 hidden xl:block z-0 rotate-[15deg]">
            <Image src={YellowLine1} alt="decorative line" width={420} height={280} />
        </div>
        <div
            className="absolute -top-20 hidden xl:block z-20"
            style={{ right: 'calc(-50vw + 50%)' }}
        >
            <Image src={YellowLine2} alt="decorative line" width={220} height={195} />
        </div>
        <div className="bg-[var(--pink)] border-[5px] border-[var(--black)] rounded-[32px] overflow-hidden p-[10px] w-full relative">
            <div className="flex flex-col gap-10 items-center px-8 md:px-28 py-20 relative">
                {/* Up quotes - top left */}
                <div className="absolute left-8 md:left-[15%] top-12 md:top-16 z-10">
                    <Image
                        src={UpQuotes}
                        alt="quotes up for a citation"
                        width={62}
                        height={42}
                        className="w-8 md:w-[62px]"
                    />
                </div>
                {/* Quote text */}
                <p className="font-montserrat font-bold text-[24px] md:text-[48px] leading-[1.4] text-[var(--dark-green)] text-center max-w-[885px] px-8">
                    {quote}
                </p>
                {/* Down quotes - after quote, before author */}
                <div className="flex justify-end w-full max-w-[585px] px-8 lg:-mt-20 -mt-10">
                    <Image
                        src={DownQuotes}
                        alt="quotes down for a citation"
                        width={62}
                        height={42}
                        className="w-8 md:w-[62px]"
                    />
                </div>
                {author && (
                    <div className="bg-[var(--dark-green)] flex gap-3 items-center px-6 py-3 rounded-full">
                        <div className="bg-[var(--yellow)] rounded-full size-10" />
                        <p className="font-poppins font-semibold text-[14px] md:text-[16px] text-[var(--white)] text-center">
                            {author}
                            {role && `, ${role}`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    </div>
);
