export default function SearchBar() {
    return (
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
            <div className="space-y-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Rechercher un trajet (ville de départ, ville d'arrivée...)"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[--accent-color] focus:border-transparent text-sm sm:text-base"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label
                            htmlFor="price-filter"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Prix maximum
                        </label>
                        <select
                            id="price-filter"
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[--accent-color] focus:border-transparent text-sm"
                        >
                            <option value="">Tous les prix</option>
                            <option value="15">- 15€</option>
                            <option value="25">16€ - 35€</option>
                            <option value="35">36€ - 50€</option>
                            <option value="50">+ 50€</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="date-filter"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Date de départ
                        </label>
                        <input
                            type="date"
                            id="date-filter"
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[--accent-color] focus:border-transparent text-sm"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="seats-filter"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Places disponibles
                        </label>
                        <select
                            id="seats-filter"
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[--accent-color] focus:border-transparent text-sm"
                        >
                            <option value="">Toutes les places</option>
                            <option value="1">1 place</option>
                            <option value="2">2+ places</option>
                            <option value="3">3+ places</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-center">
                    <button className="btn bg-[--accent-color] hover:bg-[--accent-color]/90 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                        Rechercher
                    </button>
                </div>
            </div>
        </div>
    );
}
