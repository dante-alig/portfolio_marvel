import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Cookies from "js-cookie";
import "./App.css";
import Home from "./pages/home";
import Header from "./components/header";
import Character from "./pages/character";
import Comics from "./pages/comics";
import Likes from "./pages/likes";
import Comic from "./pages/comic";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faStar,
  faCircleUser,
  faMagnifyingGlass,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
library.add(faStar, faCircleUser, faMagnifyingGlass, faXmark);

function App() {
  const [display, setDisplay] = useState(true);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [link, setLink] = useState("");
  const [token, setToken] = useState(Cookies.get("token") || "");
  const [search, setSearch] = useState("");
  return (
    <Router>
      <Header
        display={display}
        setDisplay={setDisplay}
        token={token}
        setToken={setToken}
        search={search}
        setSearch={setSearch}
      />
      <Routes>
        <Route path="/" element={<Home search={search} />} />
        <Route
          path="/character/:characterId"
          element={
            <Character
              name={name}
              setName={setName}
              image={image}
              setImage={setImage}
              link={link}
              setLink={setLink}
              token={token}
              display={display}
              setDisplay={setDisplay}
            />
          }
        />
        <Route path="/comics" element={<Comics search={search} />} />
        <Route
          path="/comic/:comicId"
          element={
            <Comic
              name={name}
              setName={setName}
              image={image}
              setImage={setImage}
              link={link}
              setLink={setLink}
              token={token}
              display={display}
              setDisplay={setDisplay}
            />
          }
        />
        <Route path="/likes/:tokenParams" element={<Likes token={token} />} />
      </Routes>
    </Router>
  );
}

export default App;
