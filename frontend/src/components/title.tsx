import logo from '../assets/logo_v2.png';
import '../styles/title.css';
import { Link } from 'react-router-dom';

const Title = () => {
    return (
        <div id="titleDiv" className="flex flex-row items-center">
            <Link to="/">
                <img src={logo} className="h-20 p-6 md:h-28" alt="logo" />
            </Link>
            <p className="text-3xl md:text-5xl">One'O One</p>
        </div>
    );
};

export default Title;
