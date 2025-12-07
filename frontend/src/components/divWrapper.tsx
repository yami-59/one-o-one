// ✅ INTERFACE CORRIGÉE

import { type ReactNode } from 'react'; // Importez ReactNode


/*
Ce composant sert juste à mettre du css inline sans afficher le message de warning demandant de mettre le css dans un fichier .css
*/



interface DivProp {
    // 1. Utilisez le type TypeScript React pour le contenu
    children: ReactNode;

    // 2. Utilisez le type TypeScript string
    className: string;

    // 3. Les props de style/données
    width?: number; // Rendre optionnel si non toujours fourni
    height?: number;

    // 4. Utilisation de la syntaxe pour capturer le reste des props (onClick, id, etc.)
    [key: string]: unknown; // Permet aux autres props d'être passées
}
// 1. Définition du composant fonctionnel
const Div = ({ children, className, ...rest }: DivProp) => {
    // Le composant rend simplement un div
    return (
        <div
            // 2. 🎯 Appliquer les classes passées par le composant parent
            className={className}
            // 3. Rendre tout le contenu passé entre les balises du composant
            // C'est le rôle de {children}
            {...rest}
            // 4. { ...rest } permet de passer d'autres props (onClick, id, etc.) au div
        >
            {children}
        </div>
    );
};

export default Div;
