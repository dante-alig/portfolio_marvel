// Import des dépendances nécessaires
import { useState, useCallback, useMemo } from "react"; // Hooks React
import { useLocation } from "react-router-dom"; // Hook de routage
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Icônes
import PropTypes from "prop-types"; // Validation des props
import debounce from "lodash/debounce"; // Utilitaire de debounce

// Composant pour l'icône de recherche
const SearchIcon = () => (
  <FontAwesomeIcon
    className="magnifying-icon"
    icon="fa-magnifying-glass"
    aria-hidden="true"
  />
);

// Composant principal de recherche
const Search = ({ search, setSearch, token, debounceTime = 300 }) => {
  const location = useLocation();
  const [localSearch, setLocalSearch] = useState(search);

  // Détermine si la barre de recherche doit être cachée
  const isHidden = useMemo(() => {
    return location.pathname === `/likes/${token}`;
  }, [location.pathname, token]);

  // Détermine le placeholder en fonction de la page courante
  const placeholder = useMemo(() => {
    return location.pathname === "/"
      ? "Rechercher un personnage"
      : "Rechercher un comics";
  }, [location.pathname]);

  // Mise à jour de la recherche avec debounce
  const debouncedSetSearch = useCallback(
    debounce((value) => {
      setSearch(value);
    }, debounceTime),
    [setSearch, debounceTime]
  );

  // Gestionnaire de changement de l'input
  const handleSearchChange = useCallback(
    (event) => {
      const value = event.target.value;
      setLocalSearch(value);
      debouncedSetSearch(value);
    },
    [debouncedSetSearch]
  );

  // Gestionnaire de soumission du formulaire
  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      setSearch(localSearch);
    },
    [localSearch, setSearch]
  );

  // Gestionnaire de touche Escape
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        setLocalSearch("");
        setSearch("");
        event.target.blur();
      }
    },
    [setSearch]
  );

  return (
    <form
      className={isHidden ? "hide-search" : "search-bar"}
      onSubmit={handleSubmit}
      role="search"
    >
      <div className="search-container">
        <label htmlFor="research" className="visually-hidden">
          {placeholder}
        </label>
        <input
          className="search-style"
          id="research"
          type="search"
          placeholder={placeholder}
          value={localSearch}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          aria-label={placeholder}
          autoComplete="off"
        />
        <SearchIcon />
      </div>
      <button type="submit" className="visually-hidden">
        Rechercher
      </button>
    </form>
  );
};

// Validation des props
Search.propTypes = {
  search: PropTypes.string.isRequired,
  setSearch: PropTypes.func.isRequired,
  token: PropTypes.string,
  debounceTime: PropTypes.number,
};

Search.defaultProps = {
  token: null,
  debounceTime: 300,
};

export default Search;
