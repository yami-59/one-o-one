import { CELL_SIZE, RAINBOW_COLORS,GAP_SIZE  } from './constants';
import { type WordConstructProps, type Position, type GridIndexes } from './types';

// Fonction utilitaire à placer dans votre composant WordGrid

/**
 * Convertit une position pixel en index de grille.
 * Prend en compte le gap et protège contre les dépassements.
 */
export const getGridIndex = (pos: Position, gridSize: number = 10): GridIndexes => {
    const pixelToIndex = (pixel: number): number => {
        const cellWithGap = CELL_SIZE + GAP_SIZE;
        const index = Math.floor(pixel / cellWithGap);
        
        // Clamp entre 0 et gridSize - 1
        return Math.max(0, Math.min(index, gridSize - 1));
    };

    return {
        start_index: {
            col: pixelToIndex(pos.start_point.x),
            row: pixelToIndex(pos.start_point.y),
        },
        end_index: {
            col: pixelToIndex(pos.end_point.x),
            row: pixelToIndex(pos.end_point.y),
        },
    };
};

/**
 * Reconstruit le mot à partir de la grille en utilisant les indices de début et de fin.
 * Inclut une vérification stricte de colinéarité (H, V, ou D).
 */
export const construct_word = ({ grid, indexes }: WordConstructProps): string | null => {
    // Type de retour ajusté à string | null
    let word = '';

    const { start_index, end_index } = indexes;
    // Gérer le cas du clic simple (sélection d'une seule cellule)
    if (start_index === end_index) {
        // En mode jeu, un clic simple ne doit pas être un mot valide (longueur > 1)
        return grid[start_index.row][end_index.row]; // Retourne juste la lettre, mais le backend devrait la rejeter.
    }

    // 1. Calcul du Vecteur de Déplacement Total
    const deltaR = end_index.row - start_index.row;
    const deltaC = end_index.col - start_index.col;

    const absDeltaR = Math.abs(deltaR);
    const absDeltaC = Math.abs(deltaC);

    // --- CONTRÔLE DE LA COLINÉARITÉ (VÉRIFICATION CRITIQUE) ---
    // La sélection est valide si :
    // 1. Déplacement Horizontal (absDeltaR = 0)
    // 2. OU Déplacement Vertical (absDeltaC = 0)
    // 3. OU Déplacement Diagonal (absDeltaR = absDeltaC)

    if (!(absDeltaR === 0 || absDeltaC === 0 || absDeltaR === absDeltaC)) {
        console.warn("❌ SÉLECTION INVALIDE : Non-colinéaire (n'est ni H, V, ni D).");
        return null; // 🛑 Le mot est invalide car il ne suit pas une ligne droite
    }
    // -------------------------------------------------------------

    // // --- DÉBUT DU DÉBOGAGE ---
    // console.log('--- DÉBUT RECONSTRUCTION DU MOT ---');
    // console.log(
    //     `1. Coords Début: [${start_index.row}, ${start_index.col}], Coords Fin: [${end_index.row}, ${end_index.col}]`,
    // );
    // console.log(`2. Déplacement Total (dR, dC): [${deltaR}, ${deltaC}]`);

    // 3. Calcul du Vecteur Unitaire et de la Longueur
    const steps = Math.max(absDeltaR, absDeltaC);

    // 🎯 NOTE : On doit utiliser la valeur absolue du delta total pour calculer le vecteur unitaire
    const dR = deltaR !== 0 ? deltaR / absDeltaR : 0; // -1, 0, ou 1
    const dC = deltaC !== 0 ? deltaC / absDeltaC : 0; // -1, 0, ou 1

    // console.log(`3. Vecteur Unitaire (unité): [${dR}, ${dC}]`);
    // console.log(`4. Longueur du mot (Steps): ${steps + 1} lettres`); // +1 pour inclure le départ

    // 4. Reconstruction du Mot
    for (let i = 0; i <= steps; i++) {
        const r = start_index.row + i * dR;
        const c = start_index.col + i * dC;

        // Afficher la position actuelle et la lettre lue
        // console.log(`    - Étape ${i}: [${r}, ${c}] -> Lettre: ${grid[r][c]}`);

        word += grid[r][c];
    }

    // console.log('--- FIN RECONSTRUCTION DU MOT ---');

    return word;
};

/**
 * Retourne une couleur hexadécimale aléatoire parmi les couleurs de l'arc-en-ciel.
 * @returns {string} Code couleur Hex (ex: 'rgba(255, 0, 0, 0.5)').
 */
export const getRandomRainbowColor = () => {
    const randomIndex = Math.floor(Math.random() * RAINBOW_COLORS.length);
    return RAINBOW_COLORS[randomIndex];
};

