import Div from '../divWrapper';
import {CANVAS_SIZE} from '../../constants/wordsearchConstants'



 const NameListTable = ({wordsToFind,wordFound} : {wordsToFind:string[],wordFound:string[]})=>{



    return (
         <Div 
                className='border border-solid mr-20 p-4 space-y-5  flex flex-col '
                style={{height: CANVAS_SIZE, width: CANVAS_SIZE / 2}}
                >

                    <p className="text-sm  border-b  pb-1 ">
                        Mots a trouver 
                    </p>

                    {/* Conteneur de la liste (list-inside pour les puces) */}
                    <ul className="list-disc list-inside space-y-1 text-gray-300  overflow-y-auto">

                        {/* 🎯 RENDU DYNAMIQUE DES MOTS */}
                        {wordsToFind.map((word, index) => (
                            <li 
                                key={index} 
                                // Style pour les mots à trouver
                                className={
                                    `text-sm tracking-widest hover:text-primary-rose transition-colors duration-100
                                    ${wordFound.includes(word)? 'line-through' :''} 
                                 `}
                            >
                                {word}
                            </li>
                    ))}

                     </ul>
            
            </Div>
    )

}


export default NameListTable