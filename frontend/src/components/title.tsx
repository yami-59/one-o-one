import logo from '../assets/logo_v2.png'
import '../styles/title.css'
const Title = () => {
  return (
     <div id="titleDiv"className="flex flex-row items-center justify-center">
          <img src={logo} className="logo h-28 p-6 " alt="logo" />
          <h1>One'O One</h1>
      </div>
  )
}

export default Title;