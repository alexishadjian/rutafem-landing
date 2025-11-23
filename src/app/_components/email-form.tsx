'use client';

import { useState } from 'react';

export default function EmailForm() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);

        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            setMessage(data.message);
        } catch (error) {
            console.error('Erreur :', error);
            setMessage("Une erreur s'est produite.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="flex gap-4 mb-6 flex-col sm:flex-row">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nom@domain.fr"
                        className="p-4 text-black rounded-xl md:w-1/2"
                        required
                    />
                    <button
                        type="submit"
                        disabled={isSending}
                        className="py-4 px-10 bg-white font-semibold text-[--accent-color] rounded-xl hover:bg-[--accent-color] hover:text-white transition-all duration-300"
                    >
                        {isSending ? 'Envoi en cours...' : 'Envoyer'}
                    </button>
                    {message && <p>{message}</p>}
                </div>
                <div className="text-select-none cursor-pointer flex gap-2">
                    <input
                        type="checkbox"
                        name="accept"
                        id="accept"
                        required
                        className="bg-transparent cursor-pointer"
                    />
                    <label htmlFor="accept" className="text-[14px] select-none cursor-pointer">
                        En t&apos;inscrivant à notre newsletter, tu consens à recevoir des mises à
                        jour sur nos initiatives et événements. Tu peux te désabonner à tout moment.
                    </label>
                </div>
            </form>
        </div>
    );
}
