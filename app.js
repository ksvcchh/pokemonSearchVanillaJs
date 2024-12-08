document.addEventListener("DOMContentLoaded", () => {
    showPokemons();
});

async function getAllPokemons() {
    try {
        const res = await fetch("https://pokeapi.co/api/v2/pokemon");
        if (!res.ok) {
            throw new Error(
                `Something went wrong: ${res.status} ${res.statusText}`,
            );
        }
        return res.json();
    } catch (error) {
        console.error("Error in getAllPokemons:", error);
        return { results: [] };
    }
}

const pokemonInfoMap = {};

async function searchForPokemonByName(name) {
    try {
        const pokemon = await getPokemon(name);
        return createPokemonInfo(pokemon);
    } catch (error) {
        console.error("Error in searchForPokemonByName:", error);
    }
}

async function getPokemon(name) {
    try {
        let resJson;
        if (pokemonInfoMap[name]) {
            return pokemonInfoMap[name];
        } else {
            const res = await fetch(
                `https://pokeapi.co/api/v2/pokemon/${name}/`,
            );
            if (!res.ok) {
                throw new Error(
                    `Failed to fetch pokemon "${name}": ${res.status} ${res.statusText}`,
                );
            }
            resJson = await res.json();
            pokemonInfoMap[resJson.name] = resJson;
            return resJson;
        }
    } catch (error) {
        console.error(`Error in getPokemon(${name}):`, error);
        return {};
    }
}

async function getPokemonSprites(name) {
    const divWithSprites = document.createElement("div");

    divWithSprites.style.display = "flex";

    const pokemonInfo = await getPokemon(name);

    for (const pov of ["front", "back"]) {
        const divWithPovSprites = document.createElement("div");
        divWithPovSprites.style.display = "flex";
        divWithPovSprites.style.flexDirection = "column";

        for (const effect of ["default", "shiny"]) {
            const sprite = document.createElement("img");
            sprite.src = pokemonInfo.sprites[`${pov}_${effect}`];
            sprite.style.height = "150px";
            sprite.style.width = "150px";
            divWithPovSprites.appendChild(sprite);
        }
        divWithSprites.appendChild(divWithPovSprites);
    }
    return divWithSprites;
}

async function createPokemonInfo(elemPokemonInfo) {
    if (!elemPokemonInfo || !elemPokemonInfo.stats || !elemPokemonInfo.types) {
        const errorDiv = document.createElement("div");
        errorDiv.className = "error";
        errorDiv.appendChild(
            document.createTextNode("Unable to display Pokemon details."),
        );
        return errorDiv;
    }

    const divWithPokemon = document.createElement("div");
    divWithPokemon.style.display = "flex";
    divWithPokemon.style.justifyContent = "space-evenly";

    const divWithPokemonInfo = document.createElement("div");
    divWithPokemonInfo.className = "stats";
    for (const prop of elemPokemonInfo.stats) {
        const divWithStat = document.createElement("div");
        divWithStat.className = `${prop.stat.name}`;
        const spanWithStatName = document.createElement("span");
        const spanWithStatValue = document.createElement("span");

        spanWithStatName.appendChild(
            document.createTextNode(`${prop.stat.name}: `),
        );
        spanWithStatValue.appendChild(document.createTextNode(prop.base_stat));
        divWithStat.appendChild(spanWithStatName);
        divWithStat.appendChild(spanWithStatValue);
        divWithPokemonInfo.appendChild(divWithStat);
    }
    const divWithTypes = document.createElement("div");
    divWithTypes.className = "types";
    const spanWithTextForDivWithTypes = document.createElement("span");
    const textForTypesSpan = document.createTextNode("types: ");
    spanWithTextForDivWithTypes.appendChild(textForTypesSpan);
    divWithTypes.appendChild(spanWithTextForDivWithTypes);
    const listOfTypes = document.createElement("ul");
    listOfTypes.style.margin = 0;

    for (const prop of elemPokemonInfo.types) {
        const li = document.createElement("li");
        const textNodeForLi = document.createTextNode(`${prop.type.name}`);
        li.appendChild(textNodeForLi);
        listOfTypes.appendChild(li);
    }
    divWithTypes.appendChild(listOfTypes);
    divWithPokemonInfo.appendChild(divWithTypes);

    divWithPokemon.append(divWithPokemonInfo);

    const spritesOfPokemon = await getPokemonSprites(elemPokemonInfo.name);
    divWithPokemon.append(spritesOfPokemon);

    return divWithPokemon;
}

async function showPokemons() {
    const pokemons = await getAllPokemons();

    if (!pokemons || !pokemons.results) {
        console.warn("No pokemons returned from getAllPokemons");
        const pokemonListDiv = document.getElementById("pokemonList");
        pokemonListDiv.innerHTML =
            "<p>Unable to load Pokémon. Please try again later.</p>";
        return;
    }

    const pokemonsArr = pokemons.results;

    const pokemonListDiv = document.getElementById("pokemonList");

    const mainMenu = document.querySelector(".searchMenu");

    const pokemonMenu = document.createElement("div");
    pokemonMenu.style.display = "none";
    pokemonMenu.className = "pokemonMenu";

    const buttonToGoBack = document.createElement("button");
    buttonToGoBack.innerHTML = "Back!";
    buttonToGoBack.className = "goBackButton";
    let divWithPokemonInfo;

    buttonToGoBack.addEventListener("click", (event) => {
        mainMenu.style.display = "flex";
        pokemonMenu.style.display = "none";
        const children = Array.from(pokemonMenu.children);
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (!child.classList.contains("goBackButton")) {
                pokemonMenu.removeChild(child);
            }
        }
    });

    document.body.appendChild(pokemonMenu);
    pokemonMenu.appendChild(buttonToGoBack);

    for (const elem of pokemonsArr) {
        const elemPokemonInfo = await getPokemon(elem.name);

        if (!elemPokemonInfo) {
            const errorDiv = document.createElement("div");
            errorDiv.className = "pokemonError";
            const textForErr = document.createTextNode(
                `Unable to load details for ${elem.name}.`,
            );
            errorDiv.appendChild(textForErr);
            pokemonListDiv.appendChild(errorDiv);
            continue;
        }

        const [pokemonSprite, pokemonNumber] = [
            elemPokemonInfo.sprites.front_default,
            elemPokemonInfo.order,
        ];

        const pokemonDiv = document.createElement("div");
        pokemonDiv.className = "pokemonPlaceholder";

        const pokemonNameDiv = document.createElement("div");
        pokemonNameDiv.className = "pokemonName";
        const pokemonName = elem.name;

        const pokemonPicDiv = document.createElement("div");
        pokemonPicDiv.className = "pokemonPicture";
        const pokemonSpriteElem = document.createElement("img");
        pokemonSpriteElem.src = pokemonSprite;

        const pokemonNumDiv = document.createElement("div");
        pokemonNumDiv.className = "pokemonNumber";

        const textNodePokemonName = document.createTextNode(pokemonName);
        const textNodePokemonNum = document.createTextNode(pokemonNumber);

        pokemonPicDiv.appendChild(pokemonSpriteElem);
        pokemonNameDiv.appendChild(textNodePokemonName);
        pokemonNumDiv.appendChild(textNodePokemonNum);

        pokemonDiv.appendChild(pokemonPicDiv);
        pokemonDiv.appendChild(pokemonNameDiv);
        pokemonDiv.appendChild(pokemonNumDiv);

        pokemonDiv.addEventListener("click", async () => {
            mainMenu.style.display = "none";
            pokemonMenu.style.display = "block";

            divWithPokemonInfo = await createPokemonInfo(elemPokemonInfo);
            pokemonMenu.appendChild(divWithPokemonInfo);
        });

        pokemonListDiv.append(pokemonDiv);
    }

    const searchButton = document.getElementById("searchButton");
    const searchBar = document.getElementById("searchBar");

    searchButton.addEventListener("click", async (event) => {
        event.preventDefault();
        if (searchBar.value) {
            try {
                Array.from(pokemonMenu.children).forEach((child) => {
                    if (!child.classList.contains("goBackButton")) {
                        pokemonMenu.removeChild(child);
                    }
                });
                const divWithPokemonInfo = await searchForPokemonByName(
                    searchBar.value,
                );
                if (divWithPokemonInfo) {
                    pokemonMenu.appendChild(divWithPokemonInfo);
                    mainMenu.style.display = "none";
                    pokemonMenu.style.display = "block";
                } else {
                    window.alert("Pokemon not found!");
                }
            } catch (error) {
                console.error("Error handling search:", error);
                window.alert(
                    "Something went wrong while searching for the Pokémon!",
                );
            }
        } else {
            console.error("Input is empty!");
            window.alert("Input is empty!");
        }
    });
}
