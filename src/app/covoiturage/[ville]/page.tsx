import { villes } from "@/datas/villes";
import { notFound } from "next/navigation";
import Link from "next/link";

interface VilleParams {
    params: { ville: string };
}

export async function generateStaticParams() {
    return villes.map((ville) => ({
        ville: ville.slug,
    }));
}

export async function generateMetadata({ params }: VilleParams) {
    const ville = villes.find((v) => v.slug === params.ville);

    if (!ville) {
        return {
            title: "Page non trouvée",
        };
    }

    return {
        title: `Covoiturage à ${ville.nom} entre femmes - RutaFem`,
        description: `Covoiturage femme à ${ville.nom} avec RutaFem : sécurité, confort et convivialité pour vos trajets entre femmes.`,
    };
}

export default function CovoiturageVillePage({ params }: VilleParams) {
    const ville = villes.find((v) => v.slug === params.ville);

    if (!ville) {
        notFound();
    }

    return (
        <main className="wrapper py-8">
            <h1 className="text-3xl font-bold mb-4">Covoiturage à {ville.nom} entre femmes</h1>
            <p className="mb-6">
                Vous cherchez un covoiturage 100% féminin à {ville.nom} ? Avec RutaFem, profitez de trajets partagés entre femmes en toute sécurité et convivialité.
            </p>

            <h2 className="text-2xl font-semibold mb-2">Des trajets sécurisés dans les quartiers de {ville.nom}</h2>
            <ul className="list-disc list-inside mb-6">
                {ville.quartiers.map((quartier: string) => (
                    <li key={quartier}>Disponible à {quartier}</li>
                ))}
            </ul>

            <Link
                href="/#notify"
                className="inline-block bg-pink-500 text-white py-2 px-6 mb-8 rounded-lg hover:bg-pink-600 transition"
            >
                Rejoindre RutaFem à {ville.nom}
            </Link>

            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">RutaFem est disponible dans ces villes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {villes.map((v) => (
                        <Link
                            key={v.slug}
                            href={`/covoiturage/${v.slug}`}
                            className="block p-4 border rounded-lg hover:bg-gray-50 transition"
                        >
                            <h3 className="font-medium">{v.nom}</h3>
                            <p className="text-sm text-gray-600">{v.quartiers.length} quartiers disponibles</p>
                        </Link>
                    ))}
                </div>
            </div>

        </main>
    );
}
