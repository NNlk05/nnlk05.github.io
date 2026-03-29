class Quote {
  constructor(text, weight = 1) {
    this.text = text;
    this.weight = weight;
  }

  toString() {
    return this.text;
  }
}

class QuoteTable {
  constructor() {
    this.quotes = [];
  }

  add(quote) {
    this.quotes.push(quote);
  }

  getRandomQuote() {
    if (this.quotes.length === 0) {
      return null;
    }

    const totalWeight = this.quotes.reduce(
      (sum, quote) => sum + (Number(quote.weight) || 0),
      0,
    );

    let randomWeight = Math.random() * totalWeight;

    for (const quote of this.quotes) {
      if (randomWeight < quote.weight) {
        return quote;
      }
      randomWeight -= quote.weight;
    }

    return this.quotes[this.quotes.length - 1];
  }
}

const quotes = new QuoteTable();

quotes.add(new Quote("Given enough CPU cycles, all problems are shallow.", 10));
quotes.add(
  new Quote(
    "I write code for computers. Wherever if it is suitable for human consumption is up for debate.",
    10,
  ),
);
quotes.add(
  new Quote(
    "There are only 3 numbers of interest to me: 0, 1, and my seeds pre second.",
    10,
  ),
);
quotes.add(
  new Quote(
    "Java does its best to keep us from saving typing, whereas C tells us that it should be avoided at all costs!",
    10,
  ),
);
quotes.add(
  new Quote("Nobody while using C: It works! I Love Programming!", 10),
);
quotes.add(
  new Quote(
    "<s>Premature optimization</s> Not enough optimization is the root of all evil.",
    10,
  ),
);
quotes.add(
  new Quote("Simplicity, carried to the extreme, becomes pseudocode.", 10),
);
quotes.add(
  new Quote(
    "Debugging is twice as hard as writing the code in the first place. Therefore, don't debug.",
    10,
  ),
);
quotes.add(
  new Quote(
    "A smart programmer is someone who check if a street is one way or not to save looking both ways.",
    10,
  ),
);
quotes.add(
  new Quote(
    "People who love Java say Java is clean! It's almost cleaner than C, and we all know that's saying something. <a href=\"https://imgur.com/a/VZ3KCRC\">https://imgur.com/a/VZ3KCRC</a> proved that.",
    10,
  ),
);

quotes.add(new Quote("AAAA\nBBBB", 5));
quotes.add(new Quote("One line of my code is 100% of the bugs.", 5));
quotes.add(new Quote("4pCA, 166, -31!", 5));
quotes.add(new Quote("m3 h4xx32!", 5));
quotes.add(
  new Quote(
    '<a href="https://files.mcatho.me/herobrine/World1.zip" download="5qaA.zip">5qaA, 5, -298!</a>',
    5,
  ),
);
quotes.add(new Quote("Seed 262 is my seed!", 5));
quotes.add(
  new Quote(
    '<a href="https://www.youtube.com/watch?v=2qBlE2-WL60">check this out!</a>',
    5,
  ),
);
quotes.add(new Quote("beefboard is peak!", 5));
quotes.add(new Quote("grind #ask-for-help", 5));
quotes.add(new Quote("this is blank!", 5));

function newQuote() {
  const target = document.querySelector("blockquote");

  if (!target) {
    return;
  }

  const randomQuote = quotes.getRandomQuote();
  if (randomQuote && randomQuote.text) {
    target.innerHTML = randomQuote.text;
  } else {
    target.innerHTML = "No quote found.";
  }
}

newQuote();
