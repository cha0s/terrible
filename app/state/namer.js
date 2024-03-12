const adjectives = [
  'Sneaky', 'Overt', 'Greasy', 'Clean', 'Happy', 'Sad', 'Excited', 'Bored', 'Bigly', 'Woke',
  'Oppressed', 'Oppressive', 'Curious', 'Ignorant', 'Dour', 'Lively', 'Hungry', 'Satisfied',
  'Optimistic', 'Pessimistic', 'Lonely', 'Friendly', 'Tired', 'Alert', 'Crabby', 'Sweet',
  'Sarcastic', 'Sincere', 'Alpha', 'Beta', 'Sigma', 'Omega', 'Pog', 'Poggers', 'Sly', 'Brazen',
  'Shady', 'Shrewd', 'Cunning', 'Devious', 'Covert', 'Stealthy', 'Sleek', 'Discreet',
  'Underhanded', 'Transparent', 'Glossy', 'Polished', 'Immaculate', 'Spotless', 'Gleeful',
  'Joyful', 'Cheerful', 'Elated', 'Content', 'Melancholic', 'Gloomy', 'Miserable', 'Despondent',
  'Jubilant', 'Eager', 'Enthusiastic', 'Apathetic', 'Indifferent', 'Jaded', 'Dull', 'Monotonous',
  'Gigantic', 'Massive', 'Colossal', 'Enormous', 'Immense', 'Towering', 'Majestic', 'Resplendent',
  'Victorious', 'Triumphant', 'Dominant', 'Submissive', 'Pensive', 'Thoughtful', 'Contemplative',
  'Inquisitive', 'Ignoramus', 'Uninformed', 'Unaware', 'Dreary', 'Solemn', 'Glum', 'Cheerful',
  'Animated', 'Vivacious', 'Sprightly', 'Peppy', 'Ravenous', 'Voracious', 'Famished', 'Ravenous',
  'Fulfilled', 'Gratified', 'Contented', 'Pleased', 'Upbeat', 'Hopeful', 'Upbeat', 'Positive',
  'Rosy', 'Bleak', 'Cynical', 'Gloomy', 'Disheartened', 'Forlorn', 'Isolated', 'Solitary', 'Alone',
  'Companionable', 'Amicable', 'Genial', 'Cordial', 'Weary', 'Fatigued', 'Exhausted', 'Drained',
  'Drowsy', 'Vigilant', 'Watchful', 'Attentive', 'Observant', 'Cranky', 'Irritable', 'Grumpy',
  'Testy', 'Sugary', 'Saccharine',
];

const nouns = [
  'Snake', 'Possum', 'Bunny', 'Cat', 'Penguin', 'Kid', 'Llama', 'Robot', 'Person', 'Dog',
  'Turtle', 'Mermaid', 'Dragon', 'Dinosaur', 'Sword', 'Fireball', 'Guitar', 'Pizza', 'Meatball',
  'Carpet', 'Chair', 'Curtain', 'Weeb', 'Stick', 'Model', 'Celebrity', 'Nerd', 'Orangutan',
  'Grape', 'Farmer', 'Star', 'Cutie', 'Fox', 'Owl', 'Squirrel', 'Dolphin', 'Elephant', 'Giraffe',
  'Zebra', 'Lion', 'Tiger', 'Bear', 'Panda', 'Koala', 'Gorilla', 'Chimpanzee', 'Rhino', 'Hippo',
  'Kangaroo', 'Platypus', 'Cheetah', 'Leopard', 'Wolf', 'Bison', 'Yak', 'Moose', 'Antelope',
  'Hyena', 'Otter', 'Seal', 'Walrus', 'Polar bear', 'Penguin', 'Parrot', 'Toucan', 'Flamingo',
  'Peacock', 'Eagle', 'Hawk', 'Falcon', 'Canary', 'Hummingbird', 'Sparrow', 'Crow', 'Robin',
  'Woodpecker', 'Cardinal', 'Kingfisher', 'Pigeon', 'Dove', 'Seagull', 'Albatross', 'Pelican',
  'Swan', 'Goose', 'Duck', 'Mallard', 'Teal', 'Puffin', 'Chicken', 'Rooster', 'Hen', 'Turkey',
  'Quail', 'Ostrich', 'Emu', 'Kiwi', 'Platypus', 'Beaver', 'Raccoon', 'Badger', 'Wolverine',
  'Skunk', 'Hedgehog', 'Porcupine', 'Armadillo', 'Groundhog', 'Mole', 'Vole', 'Shrew', 'Mouse',
  'Rat', 'Chipmunk', 'Rabbit', 'Hare', 'Ferret', 'Hamster', 'Chinchilla', 'Gerbil', 'Degu',
  'Capybara', 'Lemur', 'Marmoset', 'Tamarin', 'Macaque', 'Baboon', 'Gibbon',
];

const r = (a) => a[Math.floor(Math.random() * a.length)];

export default () => `${r(adjectives)} ${r(nouns)}`;
