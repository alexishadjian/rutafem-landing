'use client';

import Icon from '@/components/ui/icon';
import { useState } from 'react';

export default function FaqCard({
    question,
    answer,
    number,
}: {
    question: string;
    answer: string[];
    number: string;
}) {
    const [isOpen, setIsOpen] = useState(false);

    const faqId = `faq-answer-${number}`;

    return (
        <div
            className="faq-card p-4 md:p-8 rounded-3xl duration-500"
            style={{
                backgroundColor: isOpen ? 'var(--pink)' : 'var(--white)',
            }}
        >
            <button
                type="button"
                className="flex items-start justify-between gap-4 md:gap-10 w-full cursor-pointer text-left"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-controls={faqId}
            >
                <div
                    className="flex gap-4 md:gap-6 duration-500 font-staatliches"
                    style={{ color: isOpen ? 'var(--dark-green)' : 'var(--black)' }}
                >
                    <span className="text-[40px] md:text-[70px] lg:text-[100px] font-bold leading-none">
                        {number}.
                    </span>
                    <h3 className="text-[24px] lg:text-[40px] md:w-2/3 text-left leading-[1.2]">
                        {question}
                    </h3>
                </div>
                <div
                    className="flex"
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.5s ease',
                    }}
                >
                    <span aria-hidden="true">
                        <Icon
                            name="chevronDown"
                            width={54}
                            height={54}
                            strokeColor={'var(--black)'}
                        />
                    </span>
                </div>
            </button>
            <div
                id={faqId}
                role="region"
                aria-labelledby={`faq-question-${number}`}
                className="grid template-rows-[0fr] transition-all duration-500 overflow-hidden"
                style={{
                    gridTemplateRows: isOpen ? '1fr' : '0fr',
                    opacity: isOpen ? 1 : 0,
                }}
            >
                <div className="overflow-hidden flex column gap-xs">
                    <div className="faq-card__answer-item mt-4 pl-8 md:pl-20 text-[20px]">
                        {answer.map((item, index) => (
                            <p
                                key={index}
                                className="text-[16px] md:text-[18px] leading-[1.6] md:leading-relaxed"
                            >
                                {item}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
