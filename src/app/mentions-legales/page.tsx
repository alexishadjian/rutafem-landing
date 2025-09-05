export default function MentionsLegale() {
    return (
        <div className="legal wrapper small mt-44 mb-44">
            <h1 className="text-5xl mb-10">Mentions Légales</h1>

            <h3>1. Éditeur du site</h3>
            <p>
                Nom de l&apos;entreprise : <strong>Rutafem</strong>
            </p>
            {/* <p>Statut juridique : [SASU, SARL, Auto-entreprise…]</p>
            <p>Capital social : [XX 000 €]</p>
            <p>Siège social : [Adresse complète]</p>
            <p>Numéro SIRET : [Numéro d'immatriculation]</p>
            <p>Responsable de la publication : [Nom du responsable]</p> */}
            <p>
                Contact : <a href="mailto:contact@rutafem.com">contact@rutafem.com</a>
            </p>

            <h3>2. Hébergement</h3>
            <p>
                Le site <strong>Rutafem</strong> est hébergé par :
            </p>
            <p>Nom de l&apos;hébergeur : Vercel</p>
            <p>Adresse : 650 California St San Francisco, CA 94108</p>
            <p>
                Site web : <a href="[URL de l'hébergeur]">https://vercel.com</a>
            </p>

            <h3>3. Propriété intellectuelle</h3>
            <p>
                Le contenu du site <strong>Rutafem</strong> (textes, images, logos, etc.) est
                protégé par le droit de la propriété intellectuelle. Toute reproduction,
                distribution ou utilisation non autorisée est interdite.
            </p>

            <h3>4. Collecte des données</h3>
            <p>
                Les informations personnelles collectées via le site sont traitées conformément à
                notre <a href="/politique-de-confidentialite">Politique de Confidentialité</a>.
            </p>

            <h3>5. Responsabilité</h3>
            <p>
                Rutafem met tout en œuvre pour assurer l&apos;exactitude des informations sur son
                site. Toutefois, l&apos;entreprise ne saurait être tenue responsable
                d&apos;éventuelles erreurs ou omissions. ou omissions.
            </p>

            <h3>6. Contact</h3>
            <p>
                Pour toute question concernant ces mentions légales, vous pouvez nous contacter à
                l&apos;adresse suivante :{' '}
                <a href="mailto:contact@rutafem.com">contact@rutafem.com</a>
            </p>
        </div>
    );
}
