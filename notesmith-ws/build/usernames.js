const adjectives = [
    "Funny",
    "Beautiful",
    "Amazing",
    "Daring",
    "Crazy",
    "Curious",
    "Ugly",
    "Silly",
    "Smart",
    "Dumb",
    "Hesitant",
];
const nouns = [
    "Cat",
    "Dog",
    "Giraffe",
    "Gorilla",
    "Elephant",
    "Bird",
    "Fish",
    "Mouse",
    "Tiger",
    "Bear",
    "Truck",
];
const allUsernames = adjectives
    .map((a) => nouns.map((n) => `${a} ${n}`))
    .flat();
export function getUsername(existingNames) {
    const availableNames = allUsernames.filter((n) => !existingNames.includes(n));
    return availableNames[Math.floor(Math.random() * availableNames.length)];
}
