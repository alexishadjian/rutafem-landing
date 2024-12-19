import Image from "next/image";
import EmailForm from "@/components/email-form";
import { HeroBanner } from "@/images";


export default function Home() {
    return (
        <div className="">
            <section id="hero" className="relative">
                <Image 
                    src={HeroBanner}
                    quality={100}
                    width={1020}
                    // fill={true}x
                    sizes="100%"
                    style={{objectFit:"cover"}}
                    alt="home cover"
                />
                <h1>Comme un road-trip avec tes copines</h1>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis assumenda, molestiae recusandae amet a id distinctio dolores suscipit est, porro ut pariatur quo aut velit? Laudantium voluptate hic sequi. Repellat!</p>
                <button>Inscrivez-vous</button>
            </section>

            <EmailForm />
        </div>
    );
}