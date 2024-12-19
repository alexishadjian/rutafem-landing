import Image from "next/image";
import EmailForm from "@/components/email-form";
import { HeroBanner, Feature1, Feature2, Feature3, Advantage1 } from "@/images";


export default function Home() {
    return (
        <div className="mt-28">
            <section id="hero" className="relative wrapper h-[70vh] rounded-3xl overflow-hidden flex items-center justify-center flex-col text-center text-white p-4">
                <Image 
                    src={HeroBanner}
                    quality={100}
                    fill={true}
                    sizes="100%"
                    style={{objectFit:"cover"}}
                    alt="home cover"
                    className="z-[-1]"
                />
                <h1 className="montserrat font-bold">Comme un road-trip avec tes copines</h1>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis assumenda, molestiae recusandae amet a id distinctio dolores suscipit est, porro ut pariatur quo aut velit? Laudantium voluptate hic sequi. Repellat!</p>
                <button className="btn mt-8">Inscrivez-vous</button>
            </section>

            <section id="about" className="flex">
                <div>
                    <h2>Nous connaitre</h2>
                </div>
                <div>
                    <p>Chez RutaFem, nous avons imaginé une solution simple et rassurante : une plateforme de covoiturage 100 % féminine. Partagez vos trajets, vos frais et bien plus encore, dans un espace pensé pour votre sécurité et votre sérénité. Ensemble, avançons vers une mobilité plus sûre, plus solidaire et plus conviviale.Avec RutaFem, chaque trajet devient une opportunité de rencontre et de partage, dans un cadre bienveillant et respectueux. Nous allions technologie et communauté pour créer une expérience de voyage unique, où chaque femme peut se sentir confiante et soutenue. Parce que voyager ensemble, c'est aussi construire un avenir plus éco-responsable et inclusif.</p>
                </div>
            </section>

            <section id="features" className="flex">
                <div className="relative">
                    <Image 
                        src={Feature1}
                        quality={100}
                        width={1020}
                        // fill={true}
                        sizes="100%"
                        style={{objectFit:"cover"}}
                        alt="home cover"
                    />
                    <h3>Sécurité</h3>
                    <p>“Chaque trajet est sécurisé, chaque kilomètre est serein.”</p>
                </div>
                <div className="relative">
                    <Image 
                        src={Feature2}
                        quality={100}
                        width={1020}
                        // fill={true}
                        sizes="100%"
                        style={{objectFit:"cover"}}
                        alt="home cover"
                    />
                    <h3>Communauté</h3>
                    <p>“Plus qu'un trajet, une rencontre”</p>
                </div>
                <div className="relative">
                    <Image 
                        src={Feature3}
                        quality={100}
                        width={1020}
                        // fill={true}
                        sizes="100%"
                        style={{objectFit:"cover"}}
                        alt="home cover"
                    />
                    <h3>Écologique</h3>
                    <p>“Chaque trajet partagé, c'est une voiture en moins sur la route"</p>
                </div>
            </section>

            <section id="advantage">
                <div>
                    <h2>Safe & Simple</h2>
                    <p>Parce que votre sérénité est notre priorité, nous avons pensé chaque détail pour que vous puissiez voyager l'esprit tranquille. Imaginez partir en covoiturage en toute confiance, en sachant que chaque personne inscrite sur la plateforme a un profil vérifié. Pendant votre trajet, restez connectée : partagez votre localisation en temps réel avec vos proches pour qu'ils sachent exactement où vous êtes. Et si jamais un imprévu survient, notre bouton d'urgence est là, accessible en un instant, pour alerter vos contacts ou nos équipes.</p>
                </div>
                <div className="relative">
                    <Image 
                        src={Advantage1}
                        quality={100}
                        width={1020}
                        // fill={true}
                        sizes="100%"
                        style={{objectFit:"cover"}}
                        alt="home cover"
                    />
                </div>
            </section>

            <EmailForm />
        </div>
    );
}