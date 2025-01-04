// Import des dépendances nécessaires
import { useParams } from "react-router-dom";  // Pour récupérer les paramètres de l'URL
import axios from "axios";                     // Pour effectuer les requêtes HTTP
import { useEffect, useState } from "react";   // Hooks React pour la gestion d'état et effets
import PropTypes from 'prop-types';           // Pour la validation des props
import AddToLikes from "../components/addToLikes"; // Composant pour ajouter aux favoris
import loadingAnim from "../assets/marvel_logo.png"; // Animation de chargement

// URL de base de l'API
const BASE_URL = "https://test--marvel-backend--dqd24mcv82s5.code.run/marvel";

// Composant réutilisable pour afficher une image de comic
const ComicImage = ({ thumbnail, alt }) => (
  <img 
    src={`${thumbnail.path}.${thumbnail.extension}`}
    alt={alt}
    className="comic-thumbnail"
  />
);

// Composant pour afficher la description du comic
const ComicDescription = ({ title, description, children }) => (
  <div className="comic-description">
    <h1>{title}</h1>
    <p>{description || "Aucune description disponible"}</p>
    {children}
  </div>
);

// Composant principal Comic
const Comic = ({
  setName,
  name,
  image,
  setImage,
  link,
  setLink,
  token,
  display,
  setDisplay,
}) => {
  // États locaux pour gérer les données et l'état de l'application
  const [loading, setLoading] = useState(true);    // État de chargement
  const [error, setError] = useState(null);        // Gestion des erreurs
  const [data, setData] = useState(null);          // Données du comic
  const { comicId } = useParams();                 // Récupération de l'ID du comic depuis l'URL

  // Effet pour charger les données au montage du composant ou quand l'ID change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Requête pour obtenir les données du comic
        const response = await axios.get(`${BASE_URL}/comic/${comicId}`);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Une erreur est survenue lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [comicId]); // Relance l'effet si l'ID change

  // Affichage du loader pendant le chargement
  if (loading) {
    return (
      <main className="loading-logo">
        <img src={loadingAnim} alt="loading animation" />
        <p>loading...</p>
      </main>
    );
  }

  // Affichage du message d'erreur si une erreur survient
  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
      </div>
    );
  }

  // Protection contre les données manquantes
  if (!data) {
    return null;
  }

  // Rendu principal du composant
  return (
    <div className="comic-box">
      <ComicImage 
        thumbnail={data.thumbnail} 
        alt={`Comic ${data.title}`}
      />
      <ComicDescription 
        title={data.title}
        description={data.description}
      >
        {/* Composant pour ajouter aux favoris */}
        <AddToLikes
          name={name}
          setName={setName}
          link={link}
          setLink={setLink}
          image={image}
          setImage={setImage}
          token={token}
          data={data}
          comicId={comicId}
          setDisplay={setDisplay}
        />
      </ComicDescription>
    </div>
  );
};

// Validation des props avec PropTypes
Comic.propTypes = {
  setName: PropTypes.func.isRequired,    // Fonction pour modifier le nom
  name: PropTypes.string,                // Nom du comic
  image: PropTypes.string,               // URL de l'image
  setImage: PropTypes.func.isRequired,   // Fonction pour modifier l'image
  link: PropTypes.string,                // Lien vers le comic
  setLink: PropTypes.func.isRequired,    // Fonction pour modifier le lien
  token: PropTypes.string,               // Token d'authentification
  display: PropTypes.bool,               // État d'affichage
  setDisplay: PropTypes.func.isRequired  // Fonction pour modifier l'affichage
};

// Validation des props pour les composants internes
ComicImage.propTypes = {
  thumbnail: PropTypes.shape({
    path: PropTypes.string.isRequired,
    extension: PropTypes.string.isRequired
  }).isRequired,
  alt: PropTypes.string.isRequired
};

ComicDescription.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node
};

export default Comic;
