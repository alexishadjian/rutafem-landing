export default function ValueCard({ title, description, bgColor }: { title: string, description: string, bgColor: string }) {
    return (
        <div className={`p-8 text-[var(--white)] rounded-3xl ${bgColor} flex flex-col gap-4 border-4 border-[var(--black)]`}>
            <h3 className="text-[30px]">{title}</h3>
            <p className="text-[17px]">{description}</p>
        </div>
    )
}