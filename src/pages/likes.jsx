// Import des dépendances nécessaires
import axios from "axios";                                // Pour les requêtes HTTP
import { useEffect, useState, useCallback } from "react"; // Hooks React
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Icônes
import { useParams, Link, Navigate } from "react-router-dom"; // Navigation
import PropTypes from 'prop-types';                      // Validation des props
import loadingAnim from "../assets/marvel_logo.png";     // Animation de chargement

// URL de base de l'API
const BASE_URL = "https://test--marvel-backend--dqd24mcv82s5.code.run";

// Composant pour afficher le message de chargement
const LoadingSpinner = () => (
  <main className="loading-logo">
    <img src={loadingAnim} alt="Animation de chargement" />
    <p>Chargement en cours...</p>
  </main>
);

// Composant pour afficher une carte de favori
const FavoriteCard = ({ favorite, onDelete }) => (
  <div className="perso">
    <Link to={favorite.link} className="perso">
      <img 
        src={favorite.image} 
        alt={favorite.name} 
        className="favorite-image"
      />
      <div className="perso-infos">
        <div>{favorite.name}</div>
      </div>
    </Link>
    <button
      className="square-box"
      onClick={() => onDelete(favorite.image)}
      aria-label={`Supprimer ${favorite.name} des favoris`}
    >
      <FontAwesomeIcon className="square-icon" icon="fa-xmark" />
    </button>
  </div>
);

// Composant pour afficher un message d'erreur
const ErrorMessage = ({ message }) => (
  <div className="error-message">
    <p>{message}</p>
  </div>
);

// Composant principal Likes
const Likes = ({ token }) => {
  // États locaux
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { tokenParams } = useParams();

  // Fonction pour charger les favoris
  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await axios.get(`${BASE_URL}/likes/${tokenParams}`);
      setFavorites(response.data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setError("Impossible de charger vos favoris. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  }, [tokenParams]);

  // Fonction pour supprimer un favori
  const deleteFavorite = useCallback(async (imageUrl) => {
    try {
      setIsDeleting(true);
      setError("");

      await axios.delete(`${BASE_URL}/likes/deleted`, {
        headers: { "Content-Type": "application/json" },
        data: { image: imageUrl },
      });

      // Mettre à jour la liste des favoris localement
      setFavorites(prevFavorites => 
        prevFavorites.filter(fav => fav.image !== imageUrl)
      );
    } catch (error) {
      console.error("Error deleting favorite:", error);
      setError(
        error.response?.data?.message || 
        "Impossible de supprimer ce favori. Veuillez réessayer plus tard."
      );
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // Effet pour charger les favoris initialement
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Redirection si pas de token
  if (!token) {
    return <Navigate to="/" />;
  }

  // Affichage pendant le chargement
  if (loading) {
    return <LoadingSpinner />;
  }

  // Affichage des erreurs
  if (error) {
    return <ErrorMessage message={error} />;
  }

  // Affichage si aucun favori
  if (favorites.length === 0) {
    return (
      <main className="no-favorites">
        <div className="empty-favorites">
          <h2>Vous n'avez pas encore de favoris</h2>
          <p>Explorez les personnages et les comics Marvel pour en ajouter !</p>
          <Link to="/" className="explore-link">
            Découvrir l'univers Marvel
          </Link>
        </div>
      </main>
    );
  }

  // Rendu principal
  return (
    <main>
      <div className="container-box">
        {favorites.map((favorite) => (
          <FavoriteCard
            key={`${favorite.name}-${favorite.image}`}
            favorite={favorite}
            onDelete={deleteFavorite}
          />
        ))}
      </div>
    </main>
  );
};

// Validation des props
Likes.propTypes = {
  token: PropTypes.string
};

FavoriteCard.propTypes = {
  favorite: PropTypes.shape({
    name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired
  }).isRequired,
  onDelete: PropTypes.func.isRequired
};

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired
};

export default Likes;
