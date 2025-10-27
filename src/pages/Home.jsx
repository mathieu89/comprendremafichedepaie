import { useNavigate } from "react-router-dom";
import { Button } from "@/components/base/buttons/button";
import { ArrowRight, FileCheck02, Zap, Shield01 } from "@untitledui/icons";

export const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
            {/* Header */}
            <header className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileCheck02 className="w-8 h-8 text-brand-600" />
                        <h1 className="text-xl font-bold text-gray-900">
                            Comprendre ma fiche de paie
                        </h1>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 rounded-full text-brand-700 text-sm font-medium mb-6">
                        <Zap className="w-4 h-4" />
                        Analyse automatique par IA
                    </div>

                    <h2 className="text-5xl font-bold text-gray-900 mb-6">
                        Décryptez votre fiche de paie
                        <br />
                        <span className="text-brand-600">en quelques secondes</span>
                    </h2>

                    <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                        Uploadez votre bulletin de paie et obtenez instantanément une
                        visualisation claire et compréhensible de vos revenus, cotisations et
                        congés.
                    </p>

                    <Button
                        size="xl"
                        onClick={() => navigate("/upload")}
                        iconTrailing={ArrowRight}
                    >
                        Analyser ma fiche de paie
                    </Button>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-brand-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Analyse instantanée
                        </h3>
                        <p className="text-gray-600">
                            Notre IA analyse votre fiche de paie en quelques secondes et extrait
                            toutes les informations importantes.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center mb-4">
                            <FileCheck02 className="w-6 h-6 text-success-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Visualisation claire
                        </h3>
                        <p className="text-gray-600">
                            Visualisez vos données sous forme de graphiques et de tableaux
                            faciles à comprendre.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center mb-4">
                            <Shield01 className="w-6 h-6 text-warning-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Sécurisé et privé
                        </h3>
                        <p className="text-gray-600">
                            Vos données ne sont pas stockées. Tout le traitement est effectué en
                            temps réel et reste confidentiel.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="container mx-auto px-4 py-8 mt-16 border-t border-gray-200">
                <p className="text-center text-sm text-gray-500">
                    © 2025 Comprendre ma fiche de paie. Analyse automatique par IA.
                </p>
            </footer>
        </div>
    );
};

