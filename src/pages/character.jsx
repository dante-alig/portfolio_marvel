// Import des dépendances nécessaires
import { useParams } from "react-router-dom";  // Pour récupérer les paramètres de l'URL
import axios from "axios";                     // Pour effectuer les requêtes HTTP
import { useEffect, useState } from "react";   // Hooks React pour la gestion d'état et effets
import PropTypes from 'prop-types';           // Pour la validation des props
import fond from "../images/fond.png";         // Image par défaut
import AddToLikes from "../components/addToLikes"; // Composant pour ajouter aux favoris
import loadingAnim from "../assets/marvel_logo.png"; // Animation de chargement
import { motion } from "framer-motion";        // Pour les animations

// URL de base de l'API
const BASE_URL = "https://test--marvel-backend--dqd24mcv82s5.code.run/marvel";

// Composant réutilisable pour afficher une image de personnage ou de comic
const CharacterImage = ({ thumbnail, alt }) => (
  <img 
    src={`${thumbnail.path}.${thumbnail.extension}`}
    alt={alt}
    className="character-image"
  />
);

// Composant pour afficher la liste des comics
const ComicsList = ({ comics }) => (
  <div className="character-bibliography-box">
    {comics.map((comic, index) => (
      <motion.div 
        className="character-bibliography" 
        key={comic.id || index}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.5,
          delay: index * 0.1, // Ajoute un délai progressif basé sur l'index
          ease: "easeOut"
        }}
      >
        {/* Affiche une image par défaut si l'image du comic n'est pas disponible */}
        {comic.thumbnail.path.includes("image_not_available") ? (
          <img src={fond} alt="fond" className="default-image" />
        ) : (
          <CharacterImage 
            thumbnail={comic.thumbnail} 
            alt={`Comic ${index + 1}`}
          />
        )}
      </motion.div>
    ))}
  </div>
);

// Composant principal Character
const Character = ({
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
  const [loading, setLoading] = useState(true);        // État de chargement
  const [error, setError] = useState(null);            // Gestion des erreurs
  const [characterData, setCharacterData] = useState(null);  // Données du personnage
  const [comicsData, setComicsData] = useState(null);       // Données des comics
  const { characterId } = useParams();                      // Récupération de l'ID du personnage depuis l'URL

  // Effet pour charger les données au montage du composant ou quand l'ID change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Chargement parallèle des données du personnage et des comics
        const [characterResponse, comicsResponse] = await Promise.all([
          axios.get(`${BASE_URL}/characters/${characterId}`),
          axios.get(`${BASE_URL}/comics/${characterId}`)
        ]);

        // Mise à jour des états avec les données reçues
        setCharacterData(characterResponse.data);
        setComicsData(comicsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Une erreur est survenue lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [characterId]); // Relance l'effet si l'ID change

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
  if (!characterData || !comicsData) {
    return null;
  }

  // Rendu principal du composant
  return (
    <>
      {/* Section d'informations du personnage */}
      <div className="character-box">
        <CharacterImage 
          thumbnail={characterData.thumbnail} 
          alt={characterData.name}
        />
        <div className="character-description">
          <h1>{characterData.name}</h1>
          <p>{characterData.description}</p>
          {/* Composant pour ajouter aux favoris */}
          <AddToLikes
            name={name}
            setName={setName}
            link={link}
            setLink={setLink}
            image={image}
            setImage={setImage}
            token={token}
            data={characterData}
            characterId={characterId}
            setDisplay={setDisplay}
          />
        </div>
      </div>
      {/* Section des comics liés au personnage */}
      <ComicsList comics={comicsData.comics} />
    </>
  );
};

// Validation des props avec PropTypes
Character.propTypes = {
  setName: PropTypes.func.isRequired,    // Fonction pour modifier le nom
  name: PropTypes.string,                // Nom du personnage
  image: PropTypes.string,               // URL de l'image
  setImage: PropTypes.func.isRequired,   // Fonction pour modifier l'image
  link: PropTypes.string,                // Lien vers le personnage
  setLink: PropTypes.func.isRequired,    // Fonction pour modifier le lien
  token: PropTypes.string,               // Token d'authentification
  display: PropTypes.bool,               // État d'affichage
  setDisplay: PropTypes.func.isRequired  // Fonction pour modifier l'affichage
};

export default Character;
