import Image from "next/image";
import EmailForm from "@/components/email-form";
import { HeroBanner, Feature1, Value1, Value2, Value3, Advantage1 } from "@/images";


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
                <h1 className="font-montserrat font-bold">Comme un road-trip avec tes copines</h1>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis assumenda, molestiae recusandae amet a id distinctio dolores suscipit est, porro ut pariatur quo aut velit? Laudantium voluptate hic sequi. Repellat!</p>
                <button className="btn mt-8">Inscrivez-vous</button>
            </section>

            <section id="about" className="flex gap-10 wrapper">
                <div className="w-1/2 flex items-center">
                    <h2 className="font-staatliches title-gradient">Nous connaitre</h2>
                </div>
                <div className="w-1/2">
                    <p className="mb-3">Chez RutaFem, nous avons imaginé une solution simple et rassurante : une plateforme de covoiturage 100 % féminine. Partagez vos trajets, vos frais et bien plus encore, dans un espace pensé pour votre sécurité et votre sérénité.</p>
                    <p className="mb-3">Ensemble, avançons vers une mobilité plus sûre, plus solidaire et plus conviviale.Avec RutaFem, chaque trajet devient une opportunité de rencontre et de partage, dans un cadre bienveillant et respectueux. </p>
                    <p className="mb-3">Nous allions technologie et communauté pour créer une expérience de voyage unique, où chaque femme peut se sentir confiante et soutenue. Parce que voyager ensemble, c’est aussi construire un avenir plus éco-responsable et inclusif.</p>
                </div>
            </section>

            <section id="values" className="flex gap-6 wrapper">
                <div className="relative aspect-[6/7] my-14 text-white p-8 flex justify-end flex-col rounded-3xl overflow-hidden">
                    <Image 
                        src={Value1}
                        quality={100}
                        fill={true}
                        sizes="100%"
                        style={{objectFit:"cover"}}
                        alt="home cover"
                        className="z-[-1]"
                    />
                    <h3 className="text-[17px]">Sécurité</h3>
                    <p className="text-[17px]">“Chaque trajet est sécurisé, chaque kilomètre est serein.”</p>
                </div>
                <div className="relative aspect-[6/7] w-4/6	 text-white p-8 flex justify-end flex-col rounded-3xl overflow-hidden">
                    <Image 
                        src={Value2}
                        quality={100}
                        fill={true}
                        sizes="100%"
                        style={{objectFit:"cover"}}
                        alt="home cover"
                        className="z-[-1]"
                    />
                    <h3 className="text-[22px]">Communauté</h3>
                    <p className="text-[22px]">“Plus qu'un trajet, une rencontre”</p>
                </div>
                <div className="relative aspect-[6/7] my-14 text-white p-8 flex justify-end flex-col rounded-3xl overflow-hidden">
                    <Image 
                        src={Value3}
                        quality={100}
                        fill={true}
                        sizes="100%"
                        style={{objectFit:"cover"}}
                        alt="home cover"
                        className="z-[-1]"
                    />
                    <h3 className="text-[17px]">Écologique</h3>
                    <p className="text-[17px]">“Chaque trajet partagé, c'est une voiture en moins sur la route"</p>
                </div>
            </section>

            <section id="advantage" className="wrapper flex gap-20">
                <div className="w-1/2">
                    <h2 className="font-staatliches text-center mb-10 text-[--black-taupe]">Safe & Simple</h2>
                    <p className="mb-3">Parce que votre sérénité est notre priorité, nous avons pensé chaque détail pour que vous puissiez voyager l'esprit tranquille. </p>
                    <p className="mb-3">Imaginez partir en covoiturage en toute confiance, en sachant que chaque personne inscrite sur la plateforme a un profil vérifié.</p>
                    <p className="mb-3">Pendant votre trajet, restez connectée : partagez votre localisation en temps réel avec vos proches pour qu'ils sachent exactement où vous êtes. Et si jamais un imprévu survient, notre bouton d’urgence est là, accessible en un instant, pour alerter vos contacts ou nos équipes.</p>
                </div>
                <div className="relative w-1/2 rounded-full rounded-br-none overflow-hidden aspect-square">
                    <Image 
                        src={Advantage1}
                        quality={100}
                        fill={true}
                        sizes="100%"
                        style={{objectFit:"cover"}}
                        alt="home cover"
                        className="z-[-1]"
                    />
                </div>
            </section>

            <section id="values" className="wrapper flex gap-10 text-center">
                <div>
                    <div className="relative h-[150px] mb-5">
                        <Image 
                            src={Feature1}
                            quality={100}
                            fill={true}
                            sizes="100%"
                            style={{objectFit:"contain"}}
                            alt="home cover"
                        />
                    </div>

                    <h3 className="mb-2">Profil verifié</h3>
                    <p>Vérification des profils avec carte d'identité et face Id.</p>
                </div>
                <div>
                    <div className="relative h-[150px] mb-5">
                        <Image 
                            src={Feature1}
                            quality={100}
                            fill={true}
                            sizes="100%"
                            style={{objectFit:"contain"}}
                            alt="home cover"
                        />
                    </div>
                    <h3 className="mb-2">Traçage de la voiture</h3>
                    <p>Partage de localisation en temps réel avec vos proches.</p>
                </div>
                <div>
                    <div className="relative h-[150px] mb-5">
                        <Image 
                            src={Feature1}
                            quality={100}
                            fill={true}
                            sizes="100%"
                            style={{objectFit:"contain"}}
                            alt="home cover"
                        />
                    </div>
                    <h3 className="mb-2">Service appel d'urgence</h3>
                    <p>Un clic suffit pour alerter en cas de besoin.</p>
                </div>
            </section>

            <EmailForm />
        </div>
    );
}