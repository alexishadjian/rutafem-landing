type Contact = {
    name: string;
    phoneNumber: string;
    email?: string;
};

type TripContactProps = {
    contacts: Contact[];
    message: string;
    title?: string;
};

export const TripContact = ({ contacts, message, title = 'Contact' }: TripContactProps) => (
    <div className="pt-6 rounded-xl shadow-sm border p-6 bg-[var(--pink)]">
        <h4 className="text-xl font-semibold text-[var(--black)] mb-4">{title}</h4>
        <p className="text-gray-600 text-sm mb-3">{message}</p>
        <div className="space-y-4 text-sm">
            {contacts.length === 0 ? (
                <p></p>
            ) : (
                contacts.map((contact, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-[var(--blue)] rounded-full flex items-center justify-center">
                            <svg
                                className="w-4 h-4 text-[var(--white)]"
                                fill="currentColor"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                            </svg>
                        </div>
                        <div className="flex flex-col gap-1 ml-2">
                            <span className="text-[var(--black)] font-medium text-base">
                                {contact.name}
                            </span>
                            {contact.phoneNumber && (
                                <span className="text-gray-600 font-light">
                                    {contact.phoneNumber}
                                </span>
                            )}
                            {contact.email && (
                                <span className="text-gray-600 font-light text-xs">
                                    {contact.email}
                                </span>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);
