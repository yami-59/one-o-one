import Title from '../components/title'
import WordSearch from '../components/games/wordsearch/mainComponent';


function sample() {

  return (
    <div className='flex flex-col w-screen h-screen items-center'>
      <Title/>
      <div className='mt-50'>
        <WordSearch></WordSearch>
      </div>

      
    </div>
  )
}

export default sample;
