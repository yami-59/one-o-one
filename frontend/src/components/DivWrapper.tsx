// ✅ INTERFACE CORRIGÉE

import { type ReactNode } from 'react'; // Importez ReactNode


/*
Ce composant sert juste à mettre du css inline sans afficher le message de warning demandant de mettre le css dans un fichier .css
*/



interface DivProp {
    // 1. Utilisez le type TypeScript React pour le contenu
    children?: ReactNode;

    // 4. Utilisation de la syntaxe pour capturer le reste des props (onClick, id, etc.)
    [key: string]: unknown; // Permet aux autres props d'être passées
}
// 1. Définition du composant fonctionnel
const Div = ({ children,...rest }: DivProp) => {
    // Le composant rend simplement un div
    return (
        <div

            {...rest}
        >
            {children}
        </div>
    );
};

export default Div;
