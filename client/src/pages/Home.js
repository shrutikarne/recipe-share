import React, { useEffect, useState } from "react";
import API from "../api/api";

function Home() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    API.get("/recipes")
      .then(res => setRecipes(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>All Recipes</h1>
      {recipes.map(r => (
        <div key={r._id} style={{ border: "1px solid black", margin: "10px", padding: "10px" }}>
          <h3>{r.title}</h3>
          <p>{r.description}</p>
        </div>
      ))}
    </div>
  );
}

export default Home;
// client/src/pages/Home.js
// Ensure the Home page is set up to display all recipes from the backend