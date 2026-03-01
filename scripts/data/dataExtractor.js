export async function getPokemonData(pokemon) {

    const response1 = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
    const pokeRes1 = await response1.json();
    const response2 = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon}`)
    const pokeRes2 = await response2.json();

    let pokeData = {
        id: pokeRes1.id,
        species: pokeRes1.name,
        height: `${(pokeRes1.height / 10).toFixed(2)} m`,
        weight: `${(pokeRes1.weight / 10).toFixed(2)} kg`,
        sprite: pokeRes1.sprites.front_default,
        abilities: [],
        types: [],
        stats: {
            hp: pokeRes1.stats[0].base_stat,
            attack: pokeRes1.stats[1].base_stat,
            defense: pokeRes1.stats[2].base_stat,
            speed: pokeRes1.stats[5].base_stat
        },
        description: "Not Available"
    };

    pokeRes1.abilities.forEach(element => {
        pokeData["abilities"].push({
            ability: element.ability,
            hidden: element.is_hidden
        })
    });

    pokeRes1.types.forEach(elem => {
        pokeData["types"].push(elem.type.name);
    })

    const flavorTextEntries = pokeRes2.flavor_text_entries;
    const englishEntry = flavorTextEntries.find(entry => entry.language.name === "en");

    if (englishEntry) {
        pokeData["description"] = englishEntry.flavor_text
            // 2. Clean up newlines, form feeds (\f), and double spaces
            .replace(/\n|\r|\f/g, " ")  // Replaces \n, \r, and \x0c (form feed)
            .replace(/\s\s+/g, " ")     // Replaces multiple spaces with a single space
            .trim();                    // Removes leading/trailing whitespace
    }

    return pokeData;
}

export async function getDetailedPokemonData(pokemon) {
    const response1 = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
    const pokeRes1 = await response1.json();
    const response2 = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon}`)
    const pokeRes2 = await response2.json();

    const abilityPromises = pokeRes1.abilities.map(async (element) => {
        const abilityRes = await fetch(element.ability.url);
        const abilityData = await abilityRes.json();

        const englishEffect = abilityData.effect_entries.find(entry => entry.language.name === "en");
        
        const description = englishEffect ? englishEffect.short_effect : "No description available.";

        return {
            name: element.ability.name,
            hidden: element.is_hidden,
            effect: description.replace(/\n|\r|\f/g, " ")
        };
    });

    const detailedAbilities = await Promise.all(abilityPromises);

    let pokeData = {
        id: pokeRes1.id,
        species: pokeRes1.name,
        height: `${(pokeRes1.height / 10).toFixed(2)} m`,
        weight: `${(pokeRes1.weight / 10).toFixed(2)} kg`,
        sprite: pokeRes1["sprites"]["other"]["official-artwork"]["front_default"],
        abilities: detailedAbilities,
        types: [],
        stats: {
            hp: pokeRes1.stats[0].base_stat,
            attack: pokeRes1.stats[1].base_stat,
            defense: pokeRes1.stats[2].base_stat,
            specialAtk: pokeRes1.stats[3].base_stat,
            specialDef: pokeRes1.stats[4].base_stat,
            speed: pokeRes1.stats[5].base_stat
        },
        description: "Not Available",
        happiness: pokeRes2.base_happiness,
        baseExp: pokeRes1.base_experience,
        growthRate: pokeRes2.growth_rate.name
    };

    // pokeRes1.abilities.forEach(element => {
    //     pokeData["abilities"].push({
    //         ability: element.ability,
    //         hidden: element.is_hidden,
    //     })
    // });

    pokeRes1.types.forEach(elem => {
        pokeData["types"].push(elem.type.name);
    })

    const flavorTextEntries = pokeRes2.flavor_text_entries;

    const englishEntries = flavorTextEntries
        .filter(entry => entry.language.name === "en")
        .map(entry => entry.flavor_text
            .replace(/\n|\r|\f/g, " ")
            .replace(/\s\s+/g, " ")
            .trim()
        );

    const uniqueEntries = [...new Set(englishEntries)];

    pokeData["description"] = uniqueEntries.slice(0, 5).join(" ");

    if (pokeRes2.is_baby) {
        pokeData["status"] = "baby";
    } else if (pokeRes2.is_mythical) {
        pokeData["status"] = "mythical";
    } else if (pokeRes2.is_legendary) {
        pokeData["status"] = "legendary";
    } else {
        pokeData["status"] = "ordinary";
    }

    return pokeData;
}
