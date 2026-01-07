type SourcesSectionProps = {
    sources: string[];
};

export const SourcesSection = ({ sources }: SourcesSectionProps) => {
    return (
        <div className="bg-[var(--white)] h-auto relative rounded-[32px] border-[5px] border-[var(--black)] p-[50px] py-10 w-full">
            <div className="flex flex-col gap-4">
                <h3 className="font-poppins font-semibold text-[24px] leading-[36px] text-[var(--dark-green)]">
                    Sources
                </h3>
                <div className="flex flex-col gap-2">
                    {sources.map((source, index) => (
                        <p
                            key={index}
                            className="font-poppins text-[14px] leading-[23.8px] text-[var(--dark-green)]"
                        >
                            • {source}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
};
