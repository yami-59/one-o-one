🧭 Guide Git Workflow (Équipe)
🔹 Branches
Branche	Description
main	Version stable (code validé et prêt à déployer)
dev	Intégration des fonctionnalités en cours
feat/<prenom-fonction>	Nouvelle fonctionnalité, ex : feat/yamin-login

🔹 Processus de développement

1️⃣ Créer une nouvelle branche depuis dev

git checkout dev
git pull
git checkout -b feat/yamin-login


2️⃣ Développer et valider les changements

git add .
git commit -m "feat: ajout de la page de connexion"


3️⃣ Mettre à jour avec dev

git pull origin dev


4️⃣ Pousser la branche et créer une Pull Request

git push origin feat/yamin-login


➡️ Sur GitHub :
base = dev, compare = feat/yamin-login

🔹 Règles de fusion

Les branches feat/* se fusionnent uniquement vers dev.

Ne jamais modifier directement main.

main ne reçoit que les fusions validées depuis dev.

Supprimer les branches de fonctionnalités après la fusion.

🔹 Convention de nommage
Type	Exemple
Nouvelle fonctionnalité	feat/yamin-login

🔹 Convention de commits (optionnelle)

Commencer par un verbe + courte description :

feat: ajout de la page de profil  


🔹 Bonnes pratiques

Avant de commencer : git pull origin dev

Avant de pousser : rebase ou merge avec dev

Une branche = une tâche précise

Tester avant d’ouvrir la Pull Request

Garder des commits clairs et fréquents