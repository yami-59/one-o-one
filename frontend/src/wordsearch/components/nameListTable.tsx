import Div from '../../components/divWrapper';
import { CANVAS_SIZE } from '../constants';

const NameListTable = ({
    wordsToFind,
    wordsFound,
}: {
    wordsToFind: string[];
    wordsFound: string[];
}) => {
    return (
        <Div
            className="mr-20 mb-7 flex flex-col space-y-5 border border-solid p-4"
            style={{ height: CANVAS_SIZE, width: CANVAS_SIZE / 2 }}
        >
            <p className="border-b pb-1 text-sm">Mots a trouver</p>

            {/* Conteneur de la liste (list-inside pour les puces) */}
            <ul className="list-inside list-disc space-y-1 overflow-y-auto text-gray-300">
                {/* 🎯 RENDU DYNAMIQUE DES MOTS */}
                {wordsToFind.map((word, index) => (
                    <li
                        key={index}
                        // Style pour les mots à trouver
                        className={`hover:text-primary-rose text-sm tracking-widest transition-colors duration-100 ${wordsFound.includes(word) ? 'line-through' : ''} `}
                    >
                        {word}
                    </li>
                ))}
            </ul>
        </Div>
    );
};

export default NameListTable;
