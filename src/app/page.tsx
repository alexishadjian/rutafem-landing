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

            <section id="about" className="flex">
                <div>
                    <h2>Nous connaitre</h2>
                </div>
                <div>
                    <p>Chez RutaFem, nous avons imaginé une solution simple et rassurante : une plateforme de covoiturage 100 % féminine. Partagez vos trajets, vos frais et bien plus encore, dans un espace pensé pour votre sécurité et votre sérénité. Ensemble, avançons vers une mobilité plus sûre, plus solidaire et plus conviviale.Avec RutaFem, chaque trajet devient une opportunité de rencontre et de partage, dans un cadre bienveillant et respectueux. Nous allions technologie et communauté pour créer une expérience de voyage unique, où chaque femme peut se sentir confiante et soutenue. Parce que voyager ensemble, c'est aussi construire un avenir plus éco-responsable et inclusif.</p>
                </div>
            </section>

            <EmailForm />
        </div>
    );
}