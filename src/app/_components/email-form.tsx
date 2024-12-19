"use client";

import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";

export default function EmailForm() {
    const form = useRef<HTMLFormElement>(null);
    const [isSending, setIsSending] = useState(false);

    const sendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);

        try {
            await emailjs.sendForm(
              "service_07ge8sr",
              "template_nm0519m",
              form.current!,
              "26bQ6jzfktTOHQ20T"
            );
            // alert("Email envoyé avec succès !");
        } catch (error) {
            console.error("Erreur : ", error);
            // alert("Une erreur s'est produite.");
        } finally {
            setIsSending(false);
        }
    }

    return (
        <div>
            <form ref={form} onSubmit={sendEmail}>
                <div className="flex gap-4 mb-6 flex-col sm:flex-row">
                    <input type="email" name="email" id="email" placeholder="nom@domain.fr" required className="p-4 text-black rounded-xl md:w-1/2" />
                    <button type="submit" disabled={isSending} className="py-4 px-10 bg-white font-semibold text-[--accent-color] rounded-xl hover:bg-[--accent-color] hover:text-white transition-all duration-300">
                        {isSending ? "Envoi en cours..." : "Envoyer"}
                    </button>
                </div>
                <div className="text-select-none cursor-pointer flex gap-2">
                    <input type="checkbox" name="accept" id="accept" required className="bg-transparent cursor-pointer" />
                    <label htmlFor="accept" className="text-[14px] select-none cursor-pointer">En t'inscrivant à notre newsletter, tu consens à recevoir des mises à jour sur nos initiatives et événements. Tu peux te désabonner à tout moment.</label>
                </div>
            </form>
        </div>
    );
};