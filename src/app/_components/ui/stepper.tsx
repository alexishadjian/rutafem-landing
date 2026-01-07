type StepperProps = {
    totalSteps: number;
    currentStep: number;
};

export default function Stepper({ totalSteps, currentStep }: StepperProps) {
    return (
        <div className="flex items-center justify-center w-full">
            {Array.from({ length: totalSteps }, (_, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber <= currentStep;
                const isLast = stepNumber === totalSteps;

                return (
                    <div key={stepNumber} className="flex items-center">
                        {/* Cercle du step */}
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm transition-colors duration-200 ${
                                isActive ? 'bg-[var(--orange)]' : 'bg-gray-300'
                            }`}
                        >
                            {stepNumber}
                        </div>

                        {/* Ligne entre les steps */}
                        {!isLast && (
                            <div
                                className={`w-16 h-0.5 mx-2 transition-colors duration-200 ${
                                    isActive ? 'bg-[var(--orange)]' : 'bg-gray-300'
                                }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
