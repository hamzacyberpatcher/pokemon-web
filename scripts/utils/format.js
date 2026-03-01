export function capitalizeWords(str) {
    str = str.replace("-", " ");
    const capitalized = str
    .split(' ')                          // 1. Split into ["pikachu", "use", "thunderbolt"]
    .map(word => 
        word.charAt(0).toUpperCase() +     // 2. Capitalize first letter
        word.slice(1).toLowerCase()        // 3. Keep rest lowercase
    )
    .join(' ');
    return capitalized;
}

export function statPercent(stat) {
    return Math.round((stat / 255) * 100);
}