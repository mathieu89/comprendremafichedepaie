# Comprendre ma fiche de paie

Une application web moderne pour analyser et visualiser facilement vos fiches de paie grâce à l'intelligence artificielle.

## 🚀 Fonctionnalités

- **Analyse automatique par IA** : Uploadez votre bulletin de paie en PDF et laissez l'IA extraire toutes les informations importantes
- **Visualisation claire** : Graphiques et tableaux pour mieux comprendre votre rémunération
- **Interface moderne** : Design épuré et responsive inspiré des meilleures pratiques UX
- **Sécurité** : Aucune donnée n'est stockée, tout le traitement est effectué en temps réel
- **Rapide** : Analyse en quelques secondes grâce à OpenAI GPT-4 Vision

## 🛠 Technologies utilisées

- **React 19** - Framework JavaScript moderne
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS v4.1** - Framework CSS utilitaire
- **Untitled UI** - Système de design et composants
- **React Router v6** - Navigation côté client
- **Recharts** - Bibliothèque de graphiques React
- **OpenAI GPT-4 Vision** - IA pour l'extraction de données
- **React Aria Components** - Composants accessibles

## 📋 Prérequis

- Node.js 18+ et npm
- Une clé API OpenAI avec accès à GPT-4 Vision

## 🔧 Installation

1. Clonez le projet ou téléchargez les fichiers

2. Installez les dépendances :
```bash
npm install
```

3. Créez un fichier `.env` à la racine du projet :
```bash
cp .env.example .env
```

4. Ajoutez votre clé API OpenAI dans le fichier `.env` :
```
VITE_OPENAI_API_KEY=votre_clé_api_ici
```

## 🚀 Démarrage

Pour lancer le serveur de développement :

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 📦 Build de production

Pour créer une version optimisée pour la production :

```bash
npm run build
```

Pour prévisualiser le build de production :

```bash
npm run preview
```

## 🎨 Structure du projet

```
src/
├── components/          # Composants réutilisables
│   ├── base/           # Composants de base (Button, Badge, etc.)
│   └── SalaryChart.jsx # Graphique de composition du salaire
├── context/            # Contexts React (gestion d'état)
│   └── PayslipContext.jsx
├── pages/              # Pages de l'application
│   ├── Home.jsx       # Page d'accueil
│   ├── Upload.jsx     # Page d'upload
│   └── Results.jsx    # Page de résultats
├── providers/          # Providers React
│   ├── route-provider.jsx
│   └── theme-provider.jsx
├── services/           # Services et API
│   └── openai.js      # Intégration OpenAI
├── styles/            # Fichiers de style
│   ├── globals.css
│   └── theme.css
├── App.jsx            # Composant principal avec routes
└── main.jsx           # Point d'entrée de l'application
```

## 🔒 Sécurité et confidentialité

- **Aucun stockage** : Vos fiches de paie ne sont jamais sauvegardées sur nos serveurs
- **Traitement en temps réel** : L'analyse est effectuée instantanément via l'API OpenAI
- **Données éphémères** : Les données extraites sont supprimées après fermeture de l'application
- **Confidentialité** : Seules les informations nécessaires sont envoyées à l'API OpenAI pour l'analyse

## 📝 Utilisation

1. Cliquez sur "Analyser ma fiche de paie" sur la page d'accueil
2. Uploadez votre bulletin de paie au format PDF ou image (JPG, PNG) - glisser-déposer ou cliquer
   - Les PDFs sont automatiquement convertis en image pour l'analyse
3. Cliquez sur "Analyser" et attendez quelques secondes
4. Consultez votre bulletin analysé avec des visualisations claires

**Note :** Les fichiers PDF sont convertis en image avant l'analyse. Seule la première page est analysée.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

Ce projet est sous licence MIT.

## 👨‍💻 Auteur

Développé avec ❤️ pour aider à mieux comprendre ses fiches de paie.
