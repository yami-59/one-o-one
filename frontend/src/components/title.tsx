import logo from '../assets/logo_v2.png'
import '../styles/title.css'


const Title = () => {
  return (
     <div id="titleDiv" className="flex flex-row items-center ">
          <img src={logo} className="
            h-20 md:h-28  p-6 " 
            alt="logo" />
          <p className='
            text-3xl 
            md:text-5xl 
          '  >
            One'O One
          </p>
      </div>
  )
}

export default Title;