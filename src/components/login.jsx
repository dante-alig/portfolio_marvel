// Import des dépendances nécessaires
import { useNavigate } from "react-router-dom";  // Navigation
import { useState, useCallback } from "react";   // Hooks React
import PropTypes from 'prop-types';            // Validation des props
import axios from "axios";                     // Requêtes HTTP
import Cookies from "js-cookie";               // Gestion des cookies

// URL de base de l'API
const BASE_URL = "https://test--marvel-backend--dqd24mcv82s5.code.run";

// Composant pour le champ de formulaire
const FormField = ({ id, type, placeholder, value, onChange, required = true }) => (
  <div className="form-field">
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      aria-label={placeholder}
      className="form-input"
    />
  </div>
);

// Composant pour le bouton de basculement
const ToggleButton = ({ isLogin, onClick }) => (
  <>
    <p className="separator">ou</p>
    <button
      type="button"
      className="modal-switch-infos"
      onClick={onClick}
      aria-label={isLogin ? "Passer à l'inscription" : "Passer à la connexion"}
    >
      {isLogin ? "Je m'inscris" : "Je me connecte"}
    </button>
  </>
);

// Composant principal Login
const Login = ({ display, setDisplay, setToken }) => {
  // États du formulaire
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordVerif: ""
  });
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // Gestion de la fermeture du modal
  const handleClose = useCallback(() => {
    setDisplay(prev => {
      document.body.style.overflow = !prev ? "auto" : "hidden";
      return !prev;
    });
  }, [setDisplay]);

  // Validation du formulaire
  const validateForm = useCallback(() => {
    const { email, password, passwordVerif } = formData;

    if (!email || !password) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return false;
    }

    if (!isLogin && password !== passwordVerif) {
      setError("Les mots de passe ne correspondent pas.");
      return false;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return false;
    }

    return true;
  }, [formData, isLogin]);

  // Soumission du formulaire
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const route = isLogin ? "login" : "signup";
      const response = await axios.post(
        `${BASE_URL}/user/${route}`,
        {
          email: formData.email,
          password: formData.password
        },
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      const { token } = response.data;
      
      // Gestion du succès
      setToken(token);
      Cookies.set("token", token);
      navigate("/");
      handleClose();
    } catch (error) {
      setError(
        error.response?.data?.message || 
        "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mise à jour des champs du formulaire
  const updateFormField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  }, []);

  return (
    <>
      <div 
        className={display ? "bg-display" : "cover"}
        onClick={handleClose}
        role="presentation"
      />

      <div className={display ? "bg-display" : "modal-box"} role="dialog">
        <div className="windows">
          <h2>{isLogin ? "Connexion" : "Inscription"}</h2>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            id="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(value) => updateFormField("email", value)}
          />

          <FormField
            id="password"
            type="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={(value) => updateFormField("password", value)}
          />

          {!isLogin && (
            <FormField
              id="passwordVerif"
              type="password"
              placeholder="Confirmer le mot de passe"
              value={formData.passwordVerif}
              onChange={(value) => updateFormField("passwordVerif", value)}
            />
          )}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="submit-button"
          >
            {isSubmitting ? "Chargement..." : (isLogin ? "Me connecter" : "M'inscrire")}
          </button>

          <ToggleButton 
            isLogin={isLogin} 
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setFormData({ email: "", password: "", passwordVerif: "" });
            }}
          />

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </form>
      </div>
    </>
  );
};

// Validation des props
Login.propTypes = {
  display: PropTypes.bool.isRequired,
  setDisplay: PropTypes.func.isRequired,
  setToken: PropTypes.func.isRequired
};

FormField.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['text', 'email', 'password']).isRequired,
  placeholder: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool
};

ToggleButton.propTypes = {
  isLogin: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired
};

export default Login;
