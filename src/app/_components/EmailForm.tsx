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
            <h1>Abonnez-vous à notre liste d'attente</h1>
            <form ref={form} onSubmit={sendEmail}>
                <label htmlFor="email">Adresse email : </label>
                <input type="email" name="email" id="email" required />
                <button type="submit" disabled={isSending}>
                {isSending ? "Envoi en cours..." : "Envoyer"}
                </button>
            </form>
        </div>
    );
};