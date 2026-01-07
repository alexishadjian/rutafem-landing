import Image from 'next/image';

type TeamMemberCardProps = {
    name: string;
    role: string;
    linkedinUrl?: string;
    imageSrc?: string;
};

export const TeamMemberCard = ({ name, role, linkedinUrl, imageSrc }: TeamMemberCardProps) => (
    <div className="rounded-[20px] border-[3px] border-[var(--black)] overflow-hidden">
        <div className="flex flex-col items-center pt-8 pb-6 px-4">
            <div className="relative size-[120px] mb-4">
                {imageSrc ? (
                    <Image
                        src={imageSrc}
                        alt={name}
                        fill
                        className="object-cover rounded-full border-4 border-[var(--pink)]"
                    />
                ) : (
                    <div className="size-full rounded-full border-4 border-[var(--pink)] bg-[var(--pink)]/20" />
                )}
                {linkedinUrl && (
                    <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute -bottom-1 -right-1 bg-[var(--yellow)] border-[3px] border-[var(--black)] rounded-full size-[38px] flex items-center justify-center hover:scale-110 transition-transform"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M13.6 1H2.4C1.6 1 1 1.6 1 2.4V13.6C1 14.4 1.6 15 2.4 15H13.6C14.4 15 15 14.4 15 13.6V2.4C15 1.6 14.4 1 13.6 1ZM5.5 12.5H3.5V6.5H5.5V12.5ZM4.5 5.5C3.9 5.5 3.5 5.1 3.5 4.5C3.5 3.9 3.9 3.5 4.5 3.5C5.1 3.5 5.5 3.9 5.5 4.5C5.5 5.1 5.1 5.5 4.5 5.5ZM12.5 12.5H10.5V9.5C10.5 8.9 10.1 8.5 9.5 8.5C8.9 8.5 8.5 8.9 8.5 9.5V12.5H6.5V6.5H8.5V7.5C8.9 6.9 9.5 6.5 10.5 6.5C11.6 6.5 12.5 7.4 12.5 8.5V12.5Z"
                                fill="var(--black)"
                            />
                        </svg>
                    </a>
                )}
            </div>
            <p className="font-poppins font-semibold text-[18px] text-[var(--dark-green)] text-center">
                {name}
            </p>
            <p className="font-poppins text-[16px] text-[var(--dark-green)]/70 text-center">
                {role}
            </p>
        </div>
    </div>
);
