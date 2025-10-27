import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/base/buttons/button";
import { FileUploader } from "@/components/base/file-upload/file-uploader";
import { usePayslip } from "@/context/PayslipContext";
import { extractPayslipData } from "@/services/openai";
import { ArrowLeft, FileCheck02, AlertCircle } from "@untitledui/icons";

export const Upload = () => {
    const navigate = useNavigate();
    const { setPayslipData, setLoading, loading, error, setError } = usePayslip();
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileSelect = (file) => {
        setSelectedFile(file);
        setError(null);
    };

    const handleAnalyze = async () => {
        if (!selectedFile) {
            setError("Veuillez sélectionner un fichier");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await extractPayslipData(selectedFile);

            if (result.success) {
                setPayslipData(result.data);
                navigate("/results");
            } else {
                setError(result.error);
            }
        } catch (error) {
            setError("Une erreur est survenue lors de l'analyse");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="tertiary"
                            size="sm"
                            iconLeading={ArrowLeft}
                            onClick={() => navigate("/")}
                        >
                            Retour
                        </Button>
                        <div className="flex items-center gap-2">
                            <FileCheck02 className="w-6 h-6 text-brand-600" />
                            <h1 className="text-lg font-bold text-gray-900">
                                Analyser votre fiche de paie
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Importez votre bulletin de paie
                            </h2>
                            <p className="text-gray-600">
                                Uploadez votre fiche de paie au format PDF ou image (JPG, PNG). Notre IA analysera
                                automatiquement le document et extraira les informations
                                importantes.
                            </p>
                        </div>

                        <FileUploader onFileSelect={handleFileSelect} />

                        {error && (
                            <div className="mt-6 p-4 bg-error-50 border border-error-200 rounded-xl">
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0">
                                        <AlertCircle className="w-5 h-5 text-error-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-error-900 mb-1">
                                            Erreur d'analyse
                                        </h3>
                                        <p className="text-sm text-error-700">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedFile && (
                            <div className="mt-6">
                                <Button
                                    size="lg"
                                    onClick={handleAnalyze}
                                    isDisabled={loading}
                                    className="w-full"
                                >
                                    {loading && (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    )}
                                    {loading ? "Analyse en cours..." : "Analyser ma fiche de paie"}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-brand-50 border border-brand-200 rounded-xl">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <FileCheck02 className="w-5 h-5 text-brand-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-brand-900 mb-1">
                                    Vos données sont sécurisées
                                </h3>
                                <p className="text-sm text-brand-700">
                                    Votre fiche de paie n'est pas stockée sur nos serveurs. L'analyse
                                    est effectuée en temps réel et les données sont supprimées après
                                    traitement.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

