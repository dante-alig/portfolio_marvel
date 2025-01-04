// Import des dépendances nécessaires
import axios from "axios";                     // Pour les requêtes HTTP
import { useEffect, useState } from "react";   // Hooks React
import { Link } from "react-router-dom";       // Pour la navigation
import PropTypes from 'prop-types';           // Pour la validation des props
import fond from "../images/fond-comics.png";  // Image par défaut
import loadingAnim from "../assets/marvel_logo.png"; // Animation de chargement

// URL de base de l'API
const BASE_URL = "https://test--marvel-backend--dqd24mcv82s5.code.run/marvel";

// Composant pour afficher l'image d'un comic
const ComicThumbnail = ({ thumbnail, title, index }) => {
  const hasValidImage = !thumbnail.path.includes("image_not_available");
  
  return hasValidImage ? (
    <img
      src={`${thumbnail.path}.${thumbnail.extension}`}
      alt={`${title}`}
      className="comic-thumbnail"
    />
  ) : (
    <img src={fond} alt="Image par défaut" className="default-thumbnail" />
  );
};

// Composant pour afficher les informations d'un comic
const ComicInfo = ({ title, description }) => (
  <div className="comics-infos">
    <h2>{title}</h2>
    <p>{description || "Aucune description disponible"}</p>
    <button>Lire la suite</button>
  </div>
);

// Composant pour afficher un comic individuel
const ComicCard = ({ comic, index }) => (
  <Link to={`/comic/${comic._id}`} className="comics" key={comic._id || index}>
    <ComicThumbnail 
      thumbnail={comic.thumbnail}
      title={comic.title}
      index={index}
    />
    <ComicInfo 
      title={comic.title}
      description={comic.description}
    />
  </Link>
);

// Composant principal Comics
const Comics = ({ search }) => {
  // États locaux
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comics, setComics] = useState([]);

  // Effet pour charger et filtrer les comics
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupération des comics depuis l'API
        const response = await axios.get(`${BASE_URL}/comics`);
        const allComics = response.data.results;

        // Filtrage des comics selon la recherche
        const filteredComics = search
          ? allComics.filter((comic) => 
              new RegExp(search, "i").test(comic.title)
            )
          : allComics;

        setComics(filteredComics);
      } catch (error) {
        console.error("Error fetching comics:", error);
        setError(error.message || "Une erreur est survenue lors du chargement des comics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [search]);

  // Affichage pendant le chargement
  if (loading) {
    return (
      <main className="loading-logo">
        <img src={loadingAnim} alt="Animation de chargement" />
        <p>Chargement en cours...</p>
      </main>
    );
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
  if (comics.length === 0) {
    return (
      <main className="no-results">
        <p>Aucun comic trouvé{search ? ` pour la recherche "${search}"` : ""}</p>
      </main>
    );
  }

  // Rendu principal
  return (
    <main>
      <div className="comics-box">
        {comics.map((comic, index) => (
          <ComicCard 
            key={comic._id || index}
            comic={comic}
            index={index}
          />
        ))}
      </div>
    </main>
  );
};

// Validation des props
Comics.propTypes = {
  search: PropTypes.string.isRequired
};

ComicThumbnail.propTypes = {
  thumbnail: PropTypes.shape({
    path: PropTypes.string.isRequired,
    extension: PropTypes.string.isRequired
  }).isRequired,
  title: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired
};

ComicInfo.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string
};

ComicCard.propTypes = {
  comic: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    thumbnail: PropTypes.shape({
      path: PropTypes.string.isRequired,
      extension: PropTypes.string.isRequired
    }).isRequired
  }).isRequired,
  index: PropTypes.number.isRequired
};

export default Comics;
