// Import des dépendances nécessaires
import { useCallback } from "react"; // Hook React
import { Link } from "react-router-dom"; // Navigation
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Icônes
import PropTypes from "prop-types"; // Validation des props
import Cookies from "js-cookie"; // Gestion des cookies
import logo from "../images/marvel_logo.png"; // Logo Marvel
import Search from "./search"; // Composant de recherche
import Login from "./login"; // Composant de connexion

// Composant pour le logo
const Logo = () => (
  <Link to="/" className="logo" aria-label="Retour à l'accueil">
    <img src={logo} alt="Logo Marvel" />
  </Link>
);

// Composant pour le bouton de connexion/déconnexion
const AuthButton = ({ token, onAuthClick }) => (
  <button
    className="conexion"
    onClick={onAuthClick}
    aria-label={token ? "Se déconnecter" : "Se connecter"}
  >
    <FontAwesomeIcon className="circle-icon" icon="fa-circle-user" />
    <p>{token ? "Déconnexion" : "Connexion"}</p>
  </button>
);

// Composant pour le menu de navigation
const Navigation = ({ token, search, setSearch, onFavoritesClick }) => (
  <nav className="main-navigation">
    <Search search={search} setSearch={setSearch} token={token} />
    <Link to="/" className="nav-link">
      Personnages
    </Link>
    <Link to="/comics" className="nav-link">
      Comics
    </Link>
    <Link
      className="menu-favoris"
      to={token ? `/likes/${token}` : "#"}
      onClick={onFavoritesClick}
      aria-label="Accéder aux favoris"
    >
      Favoris
    </Link>
  </nav>
);

// Composant principal Header
const Header = ({
  display,
  setDisplay,
  token,
  setToken,
  search,
  setSearch,
}) => {
  // Gestion de l'affichage du modal
  const toggleDisplay = useCallback(() => {
    setDisplay((prevDisplay) => {
      const newDisplay = !prevDisplay;
      document.body.style.overflow = newDisplay ? "hidden" : "auto";
      return newDisplay;
    });
  }, [setDisplay]);

  // Gestion du clic sur le bouton de connexion/déconnexion
  const handleAuthClick = useCallback(() => {
    if (token) {
      setToken(null);
      Cookies.remove("token");
    } else {
      toggleDisplay();
    }
  }, [token, setToken, toggleDisplay]);

  // Gestion du clic sur le lien des favoris
  const handleFavoritesClick = useCallback(
    (e) => {
      if (!token) {
        e.preventDefault();
        toggleDisplay();
      }
    },
    [token, toggleDisplay]
  );

  return (
    <>
      <header className="main-header">
        <Logo />
        <div className="header-content">
          <Navigation
            token={token}
            search={search}
            setSearch={setSearch}
            onFavoritesClick={handleFavoritesClick}
          />
          <AuthButton token={token} onAuthClick={handleAuthClick} />
        </div>
      </header>

      <Login
        display={display}
        setDisplay={setDisplay}
        token={token}
        setToken={setToken}
      />
    </>
  );
};

// Validation des props
Header.propTypes = {
  display: PropTypes.bool.isRequired,
  setDisplay: PropTypes.func.isRequired,
  token: PropTypes.string,
  setToken: PropTypes.func.isRequired,
  search: PropTypes.string.isRequired,
  setSearch: PropTypes.func.isRequired,
};

Navigation.propTypes = {
  token: PropTypes.string,
  search: PropTypes.string.isRequired,
  setSearch: PropTypes.func.isRequired,
  onFavoritesClick: PropTypes.func.isRequired,
};

AuthButton.propTypes = {
  token: PropTypes.string,
  onAuthClick: PropTypes.func.isRequired,
};

export default Header;
