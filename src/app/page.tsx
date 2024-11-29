import Image from "next/image";
import EmailForm from "@/components/email-form";

export default function Home() {
    return (
        <div className="">
            <h1>Home</h1>

            <EmailForm />
        </div>
    );
}