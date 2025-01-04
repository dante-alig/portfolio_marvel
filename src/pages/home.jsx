// Import des dépendances nécessaires
import axios from "axios";                     // Pour les requêtes HTTP
import { useEffect, useState } from "react";   // Hooks React
import { Link } from "react-router-dom";       // Pour la navigation
import PropTypes from 'prop-types';           // Pour la validation des props
import fond from "../images/fond.png";         // Image par défaut
import loadingAnim from "../assets/marvel_logo.png"; // Animation de chargement

// URL de base de l'API
const BASE_URL = "https://test--marvel-backend--dqd24mcv82s5.code.run/marvel";

// Composant pour afficher l'image d'un personnage
const CharacterThumbnail = ({ thumbnail, name }) => {
  const hasValidImage = !thumbnail.path.includes("image_not_available");
  
  return (
    <img
      src={hasValidImage ? `${thumbnail.path}.${thumbnail.extension}` : fond}
      alt={hasValidImage ? name : "Image par défaut"}
      className={hasValidImage ? "character-thumbnail" : "default-thumbnail"}
    />
  );
};

// Composant pour afficher les informations d'un personnage
const CharacterInfo = ({ name }) => (
  <div className="perso-infos">
    <div>{name}</div>
  </div>
);

// Composant pour afficher une carte de personnage
const CharacterCard = ({ character }) => (
  <Link 
    to={`/character/${character._id}`} 
    className="perso" 
    key={character._id}
  >
    <CharacterThumbnail 
      thumbnail={character.thumbnail}
      name={character.name}
    />
    <CharacterInfo name={character.name} />
  </Link>
);

// Composant pour afficher le message de chargement
const LoadingSpinner = () => (
  <main className="loading-logo">
    <img src={loadingAnim} alt="Animation de chargement" />
    <p>Chargement en cours...</p>
  </main>
);

// Composant principal Home
const Home = ({ search }) => {
  // États locaux
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [characters, setCharacters] = useState([]);

  // Effet pour charger et filtrer les personnages
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupération des personnages depuis l'API
        const response = await axios.get(`${BASE_URL}/characters`);
        const allCharacters = response.data.results;

        // Filtrage des personnages selon la recherche
        const filteredCharacters = search
          ? allCharacters.filter((character) =>
              new RegExp(search, "i").test(character.name)
            )
          : allCharacters;

        setCharacters(filteredCharacters);
      } catch (error) {
        console.error("Error fetching characters:", error);
        setError(
          error.message || "Une erreur est survenue lors du chargement des personnages"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [search]);

  // Affichage pendant le chargement
  if (loading) {
    return <LoadingSpinner />;
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <main className="error-message">
        <p>{error}</p>
      </main>
    );
  }

  // Affichage si aucun résultat n'est trouvé
  if (characters.length === 0) {
    return (
      <main className="no-results">
        <p>
          Aucun personnage trouvé
          {search ? ` pour la recherche "${search}"` : ""}
        </p>
      </main>
    );
  }

  // Rendu principal
  return (
    <main>
      <div className="container-box">
        {characters.map((character) => (
          <CharacterCard 
            key={character._id} 
            character={character} 
          />
        ))}
      </div>
    </main>
  );
};

// Validation des props
Home.propTypes = {
  search: PropTypes.string.isRequired
};

CharacterThumbnail.propTypes = {
  thumbnail: PropTypes.shape({
    path: PropTypes.string.isRequired,
    extension: PropTypes.string.isRequired
  }).isRequired,
  name: PropTypes.string.isRequired
};

CharacterInfo.propTypes = {
  name: PropTypes.string.isRequired
};

CharacterCard.propTypes = {
  character: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    thumbnail: PropTypes.shape({
      path: PropTypes.string.isRequired,
      extension: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
};

export default Home;
