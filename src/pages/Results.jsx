import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePayslip } from "@/context/PayslipContext";
import { Button } from "@/components/base/buttons/button";
import { ArrowLeft, FileCheck02 } from "@untitledui/icons";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// Composant pour afficher du JSON coloré
const JsonViewer = ({ data }) => {
    const jsonString = JSON.stringify(data, null, 2);
    
    // Fonction pour colorier le JSON
    const colorizeJson = (json) => {
        return json
            .split('\n')
            .map((line, index) => {
                let coloredLine = line;
                
                // Colorer les clés (texte entre guillemets suivi de :)
                coloredLine = coloredLine.replace(
                    /"([^"]+)":/g,
                    '<span class="text-blue-400">"$1"</span>:'
                );
                
                // Colorer les valeurs string (texte entre guillemets non suivi de :)
                coloredLine = coloredLine.replace(
                    /: "([^"]*)"/g,
                    ': <span class="text-green-400">"$1"</span>'
                );
                
                // Colorer les nombres
                coloredLine = coloredLine.replace(
                    /: (-?\d+\.?\d*)(,?)/g,
                    ': <span class="text-yellow-400">$1</span>$2'
                );
                
                // Colorer les booléens et null
                coloredLine = coloredLine.replace(
                    /: (true|false|null)(,?)/g,
                    ': <span class="text-purple-400">$1</span>$2'
                );
                
                return (
                    <div key={index} dangerouslySetInnerHTML={{ __html: coloredLine }} />
                );
            });
    };
    
    return (
        <div className="text-sm font-mono">
            {colorizeJson(jsonString)}
        </div>
    );
};

// Composant helper pour afficher une catégorie de debug
const DebugCategory = ({ title, color, employeeData, employerData }) => {
    const hasEmployeeData = employeeData?.lines?.length > 0;
    const hasEmployerData = employerData?.lines?.length > 0;
    
    if (!hasEmployeeData && !hasEmployerData) return null;

    return (
        <div className={`mb-6 p-4 rounded-xl border-2 ${color}`}>
            <h4 className="text-md font-semibold text-gray-800 mb-3">{title}</h4>
            
            {/* Part salarié */}
            {hasEmployeeData && (
                <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">
                        Part salarié : {employeeData.total?.toFixed(2)} €
                    </p>
                    <div className="bg-white rounded-lg divide-y divide-gray-100">
                        {employeeData.lines.map((line, idx) => {
                            // Gestion de la rétrocompatibilité (objet vs tableau)
                            const name = Array.isArray(line) ? line[0] : line.name;
                            const amount = Array.isArray(line) ? line[1] : line.amount;
                            
                            return (
                                <div key={idx} className="flex justify-between items-center p-2">
                                    <span className="text-sm text-gray-700">{name}</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {amount?.toFixed(2)} €
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Part employeur */}
            {hasEmployerData && (
                <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">
                        Part employeur : {employerData.total?.toFixed(2)} €
                    </p>
                    <div className="bg-white rounded-lg divide-y divide-gray-100">
                        {employerData.lines.map((line, idx) => {
                            // Gestion de la rétrocompatibilité (objet vs tableau)
                            const name = Array.isArray(line) ? line[0] : line.name;
                            const amount = Array.isArray(line) ? line[1] : line.amount;

                            return (
                                <div key={idx} className="flex justify-between items-center p-2">
                                    <span className="text-sm text-gray-700">{name}</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {amount?.toFixed(2)} €
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Total catégorie */}
            {hasEmployeeData && hasEmployerData && (
                <div className="mt-3 p-2 bg-gray-100 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-900">TOTAL {title.split(' ')[0].toUpperCase()}</span>
                        <span className="text-base font-bold text-gray-900">
                            {((employeeData.total || 0) + (employerData.total || 0)).toFixed(2)} €
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export const Results = () => {
    const navigate = useNavigate();
    const { payslipData, resetData } = usePayslip();
    const [view, setView] = useState("cascade");
    const [expandedItem, setExpandedItem] = useState(null);
    const [copied, setCopied] = useState(false);

    const toggleItem = (index) => {
        setExpandedItem(expandedItem === index ? null : index);
    };

    const handleCopyJSON = async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(payslipData, null, 2));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Erreur lors de la copie:", error);
        }
    };

    useEffect(() => {
        if (!payslipData) {
            navigate("/upload");
        }
    }, [payslipData, navigate]);

    if (!payslipData) {
        return null;
    }

    const handleNewAnalysis = () => {
        resetData();
        navigate("/upload");
    };

    // Utilisation des données réelles extraites de la fiche de paie
    const brut = payslipData.grossSalary;
    const netAvantImpot = payslipData.netSalaryBeforeTax;
    const impot = payslipData.withholdingTax?.amount || 0;
    const netPaye = payslipData.netSalaryAfterTax;
    
    // Cotisations réelles
    const cotisationsPatronales = payslipData.employerContributions?.total || 0;
    const cotisationsSalariales = payslipData.employeeContributions?.total || 0;
    const superbrut = payslipData.superGross || (brut + cotisationsPatronales);

    // Répartition détaillée des cotisations SALARIALES
    const retraite = payslipData.employeeContributions?.retirement?.total || 0;
    const sante = payslipData.employeeContributions?.health?.total || 0;
    const chomage = payslipData.employeeContributions?.unemployment?.total || 0;
    const csgCrds = payslipData.employeeContributions?.csgCrds?.total || 0;
    const autresSalarie = payslipData.employeeContributions?.other?.total || 0;

    // Répartition détaillée des cotisations PATRONALES
    const retraitePatronale = payslipData.employerContributions?.retirement?.total || 0;
    const santePatronale = payslipData.employerContributions?.health?.total || 0;
    const chomagePatronal = payslipData.employerContributions?.unemployment?.total || 0;
    const famille = payslipData.employerContributions?.family?.total || 0;
    const cse = payslipData.employerContributions?.cse?.total || 0;
    const autresPatronales = payslipData.employerContributions?.other?.total || 0;

    // Vue Cascade: Superbrut → Net
    const cascadeData = [
        {
            name: "Net après impôts",
            value: netPaye,
            percentage: ((netPaye / superbrut) * 100).toFixed(1),
            color: "#10b981",
        },
        {
            name: "Impôts sur le revenu",
            value: impot,
            percentage: ((impot / superbrut) * 100).toFixed(1),
            color: "#ef4444",
        },
        {
            name: "Cotisations sociales",
            value: cotisationsSalariales,
            percentage: ((cotisationsSalariales / superbrut) * 100).toFixed(1),
            color: "#f59e0b",
        },
        {
            name: "Cotisations patronales",
            value: cotisationsPatronales,
            percentage: ((cotisationsPatronales / superbrut) * 100).toFixed(1),
            color: "#8b5cf6",
        },
    ];

    // Vue Détaillée
    const detailledData = [
        {
            name: "Net payé",
            value: netPaye,
            percentage: ((netPaye / superbrut) * 100).toFixed(1),
            color: "#10b981",
            description: "Salaire effectivement versé sur votre compte bancaire",
            details: null,
        },
        {
            name: "Impôts",
            value: impot,
            percentage: ((impot / superbrut) * 100).toFixed(1),
            color: "#ef4444",
            description: "Impôt sur le revenu prélevé à la source (PAS)",
            details: null,
        },
        {
            name: "Retraite (salarié + employeur)",
            value: retraite + retraitePatronale,
            percentage: (((retraite + retraitePatronale) / superbrut) * 100).toFixed(1),
            color: "#3b82f6",
            description: "Finance votre retraite de base et complémentaire (Agirc-Arrco)",
            details: {
                salarie: retraite,
                employeur: retraitePatronale,
                breakdown: [
                    "Sécurité Sociale plafonnée (retraite de base)",
                    "Sécurité Sociale déplafonnée",
                    "Complémentaire Tranche 1 (Agirc-Arrco)",
                    "Complémentaire Tranche 2 (Agirc-Arrco)",
                ],
            },
        },
        {
            name: "Santé (salarié + employeur)",
            value: sante + santePatronale,
            percentage: (((sante + santePatronale) / superbrut) * 100).toFixed(1),
            color: "#ec4899",
            description: "Couvre vos soins médicaux, arrêts maladie, mutuelle et prévoyance",
            details: {
                salarie: sante,
                employeur: santePatronale,
                breakdown: [
                    "Sécurité Sociale - Maladie, Maternité, Invalidité, Décès",
                    "Complémentaire - Incapacité, Invalidité, Décès",
                    "Complémentaire - Santé / Mutuelle",
                    "Accidents du travail & maladies professionnelles (employeur)",
                ],
            },
        },
        {
            name: "Chômage (salarié + employeur)",
            value: chomage + chomagePatronal,
            percentage: (((chomage + chomagePatronal) / superbrut) * 100).toFixed(1),
            color: "#f59e0b",
            description: "Finance vos allocations chômage en cas de perte d'emploi (Pôle Emploi)",
            details: {
                salarie: chomage,
                employeur: chomagePatronal,
                breakdown: ["Assurance chômage (4,25% du salaire brut)"],
            },
        },
        {
            name: "Famille",
            value: famille,
            percentage: ((famille / superbrut) * 100).toFixed(1),
            color: "#a855f7",
            description: "Finance les allocations familiales de la CAF (uniquement payé par l'employeur)",
            details: {
                salarie: 0,
                employeur: famille,
                breakdown: ["Cotisation uniquement patronale pour les allocations familiales"],
            },
        },
            {
                name: "CSE & Autres",
                value: cse + autresPatronales + autresSalarie,
                percentage: (((cse + autresPatronales + autresSalarie) / superbrut) * 100).toFixed(1),
                color: "#64748b",
                description: "Contributions diverses (CSE, formation, titres restaurant, etc.)",
                details: {
                    salarie: autresSalarie,
                    employeur: cse + autresPatronales,
                    breakdown: [
                        "CSE - Comité Social et Économique (fonctionnement + activités sociales)",
                        "Autres contributions dues par l'Employeur",
                        "Formation professionnelle, versement mobilité",
                        "Taxes et contributions diverses",
                        "Titres restaurant / Cantine (part salarié)",
                    ],
                },
            },
        {
            name: "CSG/CRDS",
            value: csgCrds,
            percentage: ((csgCrds / superbrut) * 100).toFixed(1),
            color: "#06b6d4",
            description: "Finance la Sécurité sociale et rembourse sa dette",
            details: {
                salarie: csgCrds,
                employeur: 0,
                breakdown: ["CSG déductible des impôts", "CSG/CRDS non déductible"],
            },
        },
    ];

    const currentData = view === "cascade" ? cascadeData : detailledData;

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-800">{payload[0].name}</p>
                    <p className="text-gray-600">
                        Montant: <span className="font-bold">{payload[0].value.toFixed(2)} €</span>
                    </p>
                    <p className="text-gray-600">
                        Part du superbrut:{" "}
                        <span className="font-bold">{payload[0].payload.percentage}%</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderCustomLabel = (entry) => {
        return `${entry.percentage}%`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="tertiary"
                                size="sm"
                                iconLeading={ArrowLeft}
                                onClick={() => navigate("/")}
                            >
                                Accueil
                            </Button>
                            <div className="flex items-center gap-2">
                                <FileCheck02 className="w-6 h-6 text-brand-600" />
                                <h1 className="text-lg font-bold text-gray-900">
                                    Visualisation Fiche de Paie
                                </h1>
                            </div>
                        </div>
                        <Button variant="secondary" size="sm" onClick={handleNewAnalysis}>
                            Analyser une autre fiche
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6">
                <div className="max-w-6xl mx-auto">
                    {/* Welcome Section */}
                    <div className="bg-brand-50 rounded-2xl p-6 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                            Bonjour {payslipData.employeeName}
                        </h2>
                        <p className="text-gray-600 text-sm">
                            Voici votre bulletin de paie de {payslipData.period}
                        </p>
                    </div>

                    {/* Résumé des montants clés */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                            <p className="text-sm text-purple-600 font-semibold mb-1">Superbrut</p>
                            <p className="text-2xl font-bold text-purple-700">
                                {superbrut.toFixed(2)} €
                            </p>
                            <p className="text-xs text-purple-500 mt-1">100%</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                            <p className="text-sm text-blue-600 font-semibold mb-1">Brut</p>
                            <p className="text-2xl font-bold text-blue-700">{brut.toFixed(2)} €</p>
                            <p className="text-xs text-blue-500 mt-1">
                                {((brut / superbrut) * 100).toFixed(1)}%
                            </p>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-200">
                            <p className="text-sm text-amber-600 font-semibold mb-1">
                                Net avant impôt
                            </p>
                            <p className="text-2xl font-bold text-amber-700">
                                {netAvantImpot.toFixed(2)} €
                            </p>
                            <p className="text-xs text-amber-500 mt-1">
                                {((netAvantImpot / superbrut) * 100).toFixed(1)}%
                            </p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                            <p className="text-sm text-green-600 font-semibold mb-1">Net payé</p>
                            <p className="text-2xl font-bold text-green-700">
                                {netPaye.toFixed(2)} €
                            </p>
                            <p className="text-xs text-green-500 mt-1">
                                {((netPaye / superbrut) * 100).toFixed(1)}%
                            </p>
                        </div>
                    </div>

                    {/* Boutons de sélection de vue */}
                    <div className="flex flex-wrap gap-3 mb-6">
                        <Button
                            variant={view === "cascade" ? "primary" : "secondary"}
                            size="md"
                            onClick={() => setView("cascade")}
                        >
                            Vue Cascade
                        </Button>
                        <Button
                            variant={view === "detailed" ? "primary" : "secondary"}
                            size="md"
                            onClick={() => setView("detailed")}
                        >
                            Déductions Détaillées
                        </Button>
                        <Button
                            variant={view === "debug" ? "primary" : "secondary"}
                            size="md"
                            onClick={() => setView("debug")}
                        >
                            Vue Tableau
                        </Button>
                        <Button
                            variant={view === "json" ? "primary" : "secondary"}
                            size="md"
                            onClick={() => setView("json")}
                        >
                            Vue JSON
                        </Button>
                    </div>

                    {/* Vue JSON */}
                    {view === "json" ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-900">
                                    Données JSON brutes
                                </h3>
                                <Button
                                    variant={copied ? "primary" : "secondary"}
                                    size="sm"
                                    onClick={handleCopyJSON}
                                >
                                    {copied ? "✓ Copié !" : "Copier le JSON"}
                                </Button>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Voici le JSON complet retourné par l'IA après analyse de votre fiche de paie.
                            </p>
                            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto max-h-[600px] overflow-y-auto">
                                <JsonViewer data={payslipData} />
                            </div>
                        </div>
                    ) : view === "debug" ? (
                        payslipData.employeeContributions && payslipData.employerContributions ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    Détail de l'extraction IA
                                </h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    Voici toutes les lignes identifiées par l'IA sur votre fiche de paie avec leurs montants respectifs.
                                </p>

                                {/* Santé */}
                                <DebugCategory
                                    title="Santé 🏥"
                                    color="bg-pink-50 border-pink-200"
                                    employeeData={payslipData.employeeContributions?.health}
                                    employerData={payslipData.employerContributions?.health}
                                />

                                {/* Retraite */}
                                <DebugCategory
                                    title="Retraite 👴"
                                    color="bg-blue-50 border-blue-200"
                                    employeeData={payslipData.employeeContributions?.retirement}
                                    employerData={payslipData.employerContributions?.retirement}
                                />

                                {/* Chômage */}
                                <DebugCategory
                                    title="Chômage 💼"
                                    color="bg-orange-50 border-orange-200"
                                    employeeData={payslipData.employeeContributions?.unemployment}
                                    employerData={payslipData.employerContributions?.unemployment}
                                />

                                {/* Famille */}
                                <DebugCategory
                                    title="Famille 👨‍👩‍👧"
                                    color="bg-purple-50 border-purple-200"
                                    employeeData={null}
                                    employerData={payslipData.employerContributions?.family}
                                />

                                {/* CSE & Autres */}
                                <DebugCategory
                                    title="CSE & Autres 🏢📋"
                                    color="bg-gray-50 border-gray-200"
                                    employeeData={payslipData.employeeContributions?.other}
                                    employerData={{
                                        total: (payslipData.employerContributions?.cse?.total || 0) + 
                                               (payslipData.employerContributions?.other?.total || 0),
                                        lines: [
                                            ...(payslipData.employerContributions?.cse?.lines || []),
                                            ...(payslipData.employerContributions?.other?.lines || [])
                                        ]
                                    }}
                                />

                                {/* CSG/CRDS */}
                                <DebugCategory
                                    title="CSG/CRDS 💶"
                                    color="bg-cyan-50 border-cyan-200"
                                    employeeData={payslipData.employeeContributions?.csgCrds}
                                    employerData={null}
                                />

                                {/* Impôt */}
                                {payslipData.withholdingTax && (
                                    <div className="mb-6 p-4 rounded-xl border-2 bg-red-50 border-red-200">
                                        <h4 className="text-md font-semibold text-gray-800 mb-3">
                                            Impôt sur le revenu 💰
                                        </h4>
                                        <div className="bg-white rounded-lg p-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-700">
                                                    {payslipData.withholdingTax.line}
                                                </span>
                                                <span className="text-sm font-bold text-gray-900">
                                                    {payslipData.withholdingTax.amount?.toFixed(2)} €
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Taux: {payslipData.withholdingTax.rate}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-yellow-50 rounded-2xl border-2 border-yellow-200 p-6 mb-6">
                                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                                    Vue debug non disponible
                                </h3>
                                <p className="text-sm text-yellow-800">
                                    Cette fiche de paie doit être réanalysée pour voir les détails d'extraction.
                                    Veuillez uploader à nouveau votre fiche de paie.
                                </p>
                            </div>
                        )
                    ) : (
                        /* Layout Grid: Graphique + Légende */
                        <div className="grid lg:grid-cols-2 gap-6 mb-6">
                        {/* Graphique */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="relative">
                                <ResponsiveContainer width="100%" height={400}>
                                    <PieChart>
                                        <Pie
                                            data={currentData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={renderCustomLabel}
                                            innerRadius={90}
                                            outerRadius={140}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {currentData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Texte au centre du donut */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600 font-medium mb-1">
                                            Superbrut
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {superbrut.toFixed(2)} €
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Coût total employeur
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Légende compacte avec accordéon */}
                        <div className="space-y-2">
                            {currentData.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white border-2 rounded-xl overflow-hidden transition-shadow hover:shadow-md"
                                    style={{ borderColor: item.color }}
                                >
                                    {/* Header toujours visible */}
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        className="p-4 cursor-pointer"
                                        onClick={() => item.details && toggleItem(index)}
                                        onKeyDown={(e) => {
                                            if ((e.key === 'Enter' || e.key === ' ') && item.details) {
                                                e.preventDefault();
                                                toggleItem(index);
                                            }
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 flex-1">
                                                <div
                                                    className="w-4 h-4 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                                <h3 className="font-semibold text-gray-800 text-sm">
                                                    {item.name}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-800 text-base">
                                                        {item.value.toFixed(2)} €
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {item.percentage}%
                                                    </p>
                                                </div>
                                                {item.details && (
                                                    <svg
                                                        className={`w-5 h-5 text-gray-400 transition-transform ${
                                                            expandedItem === index
                                                                ? "rotate-180"
                                                                : ""
                                                        }`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 9l-7 7-7-7"
                                                        />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Détails en accordéon */}
                                    {item.details && expandedItem === index && (
                                        <div className="px-4 pb-4 border-t border-gray-100">
                                            <p className="text-xs text-gray-600 mt-3 mb-3">
                                                {item.description}
                                            </p>
                                            <div className="flex gap-4 mb-2">
                                                {item.details.salarie > 0 && (
                                                    <div className="text-xs">
                                                        <span className="text-gray-600">
                                                            Part salarié:
                                                        </span>
                                                        <span className="font-semibold text-gray-800 ml-1">
                                                            {item.details.salarie.toFixed(2)} €
                                                        </span>
                                                    </div>
                                                )}
                                                {item.details.employeur > 0 && (
                                                    <div className="text-xs">
                                                        <span className="text-gray-600">
                                                            Part employeur:
                                                        </span>
                                                        <span className="font-semibold text-gray-800 ml-1">
                                                            {item.details.employeur.toFixed(2)} €
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            {item.details.breakdown && (
                                                <ul className="text-xs text-gray-600 space-y-1 mt-2">
                                                    {item.details.breakdown.map((detail, i) => (
                                                        <li key={i} className="flex items-start">
                                                            <span className="mr-2">•</span>
                                                            <span>{detail}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    )}

                    {/* Explication */}
                    <div className="mt-6 bg-brand-50 border-l-4 border-brand-600 p-4 rounded-r-xl">
                        <p className="text-sm text-gray-700 leading-relaxed">
                            <strong className="text-brand-900">À noter :</strong> Le superbrut (
                            {superbrut.toFixed(2)} €) représente le coût total pour l'employeur.
                            Après déduction des cotisations patronales (
                            {cotisationsPatronales.toFixed(2)} €), on obtient le salaire brut (
                            {brut.toFixed(2)} €). Les cotisations sociales (
                            {cotisationsSalariales.toFixed(2)} €) sont ensuite déduites pour
                            obtenir le net avant impôt ({netAvantImpot.toFixed(2)} €). Enfin,
                            l'impôt sur le revenu ({impot.toFixed(2)} €) est prélevé pour obtenir
                            le net payé ({netPaye.toFixed(2)} €).
                        </p>
                        <p className="text-xs text-gray-600 mt-3 italic">
                            Note : Toutes les données sont extraites directement de votre bulletin de paie via notre IA.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};
