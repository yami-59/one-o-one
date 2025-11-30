import Title from '../components/title'
import WordSearch from '../components/wordsearch/wordSearch';
import { useAuth } from "../hooks/auth";


function Sample() {

  const {token,playerId,isLoading}= useAuth();

  if(!token || !playerId) return (<>echec de l'authentification</>)

  else {
  
    return (
      <div className='flex flex-col w-screen h-screen items-center'>
        <Title/>
        <div className='mt-50'>
          <WordSearch token={token} playerId={playerId} isLoading={isLoading}></WordSearch>
        </div>

        
      </div>
    )
  }
}
export default Sample;
