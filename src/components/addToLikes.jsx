import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";

// URL de l'API
const API_URL =
  "https://test--marvel-backend--dqd24mcv82s5.code.run/marvel/likes";

// États du bouton
const BUTTON_STATES = {
  ADD: "Ajouter aux favoris",
  ADDING: "Ajout en cours...",
  ADDED: "Ajouté aux favoris",
  ERROR: "Erreur lors de l'ajout",
};

// Fonction de validation des données
const validateData = (data) => {
  const errors = [];

  if (!data.name || typeof data.name !== "string") {
    errors.push("Nom invalide");
  }

  if (!data.image || typeof data.image !== "string") {
    errors.push("Image invalide");
  }

  if (!data.link || typeof data.link !== "string") {
    errors.push("Lien invalide");
  }

  if (!data.token || typeof data.token !== "string") {
    errors.push("Token invalide");
  }

  return errors;
};

// Fonction pour nettoyer les données
const sanitizeData = (data) => {
  return {
    name: String(data.name || "").trim(),
    image: String(data.image || "").trim(),
    link: String(data.link || "").trim(),
    token: String(data.token || "").trim(),
  };
};

// Composant pour l'icône étoile avec animation
const StarIcon = ({ isAdded }) => (
  <FontAwesomeIcon
    className={`star-icon ${isAdded ? "star-icon--active" : ""}`}
    icon="fa-star"
    aria-hidden="true"
  />
);

// Composant principal
const AddToLikes = ({
  name,
  setName,
  image,
  setImage,
  link,
  setLink,
  token,
  data,
  characterId,
  comicId,
  setDisplay,
}) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const location = useLocation();

  // Détermine le type de contenu (personnage ou comic)
  const contentType = useMemo(() => {
    return location.pathname.includes("character") ? "character" : "comic";
  }, [location.pathname]);

  // Met à jour les informations du contenu
  useEffect(() => {
    if (!data?.thumbnail) {
      console.warn("Données de thumbnail manquantes:", data);
      return;
    }

    try {
      const thumbnailPath = data.thumbnail.path;
      // Évite les images "image_not_available"
      if (thumbnailPath.includes("image_not_available")) {
        console.warn("Image non disponible pour:", data.name || data.title);
        return;
      }

      const contentInfo = {
        link:
          contentType === "character"
            ? `/character/${characterId}`
            : `/comic/${comicId}`,
        image: `${thumbnailPath}.${data.thumbnail.extension}`,
        name: contentType === "character" ? data.name : data.title,
      };

      if (!contentInfo.name) {
        console.error("Nom/Titre manquant dans les données:", data);
        return;
      }

      setLink(contentInfo.link);
      setImage(contentInfo.image);
      setName(contentInfo.name);
    } catch (err) {
      console.error("Erreur lors de la mise à jour des informations:", err);
    }
  }, [contentType, characterId, comicId, data, setImage, setLink, setName]);

  // Gestion de l'ajout aux favoris
  const handleAddToFavorites = useCallback(async () => {
    if (!token) {
      setDisplay((prev) => {
        document.body.style.overflow = !prev ? "hidden" : "auto";
        return !prev;
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Prépare les données
      const dataToSend = sanitizeData({ name, image, link, token });

      // Valide les données
      const validationErrors = validateData(dataToSend);
      if (validationErrors.length > 0) {
        throw new Error(`Validation échouée: ${validationErrors.join(", ")}`);
      }

      // Envoie la requête
      const response = await axios.post(API_URL, dataToSend, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      console.error("Erreur lors de l'ajout aux favoris:", error);

      let errorMessage = "Une erreur est survenue lors de l'ajout aux favoris";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  }, [token, name, image, link, setDisplay]);

  // Détermine le texte du bouton
  const buttonText = useMemo(() => {
    if (error) return BUTTON_STATES.ERROR;
    if (isLoading) return BUTTON_STATES.ADDING;
    if (isAdded) return BUTTON_STATES.ADDED;
    return BUTTON_STATES.ADD;
  }, [error, isLoading, isAdded]);

  return (
    <button
      className={`add-to-likes-button ${isAdded ? "added" : ""} ${
        error ? "error" : ""
      }`}
      onClick={handleAddToFavorites}
      disabled={isLoading}
      aria-label={buttonText}
    >
      <StarIcon isAdded={isAdded} />
      <span className="button-text">{buttonText}</span>
      {error && (
        <span className="error-message" role="alert">
          {error}
        </span>
      )}
    </button>
  );
};

// Validation des props
AddToLikes.propTypes = {
  name: PropTypes.string,
  setName: PropTypes.func.isRequired,
  image: PropTypes.string,
  setImage: PropTypes.func.isRequired,
  link: PropTypes.string,
  setLink: PropTypes.func.isRequired,
  token: PropTypes.string,
  data: PropTypes.shape({
    thumbnail: PropTypes.shape({
      path: PropTypes.string.isRequired,
      extension: PropTypes.string.isRequired,
    }),
    name: PropTypes.string,
    title: PropTypes.string,
  }),
  characterId: PropTypes.string,
  comicId: PropTypes.string,
  setDisplay: PropTypes.func.isRequired,
};

StarIcon.propTypes = {
  isAdded: PropTypes.bool.isRequired,
};

export default AddToLikes;
