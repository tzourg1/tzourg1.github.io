var bleep = new Audio();
bleep.src = 'https://www.myinstants.com/media/sounds/another-one_1.mp3';


$(document).ready(function(){
  newQuote();
});

var newQuote = function(){
  var index = Math.floor(Math.random() * quotes.length);
  
  $('span.quote').html('"' + quotes[index] + '"');
  
  $('a.twitter-share-button').attr('href', twitURI(quotes[index]));
};

                                  var quotes = [
"Showing off is the fool's idea of glory.",
"As you think, so shall you become.",
"Having no limitation as limitation",
"Adapt what is useful, reject what is useless, and add what is specifically your own.",
"To hell with circumstances; I create opportunities.",
"Knowledge will give you power, but character respect.",
"If you love life, don't waste time, for time is what life is made up of.",
"I fear not the man who has practiced 10,000 kicks once, but I fear the man who has practiced one kick 10,000 times.",
"If you spend too much time thinking about a thing, you'll never get it done.",
"A wise man can learn more from a foolish question than a fool can learn from a wise answer.",
"Always be yourself, express yourself, have faith in yourself, do not go out and look for a successful personality and duplicate it.",
"Mistakes are always forgivable, if one has the courage to admit them.",
"A goal is not always meant to be reached, it often serves simply as something to aim at.",
"A wise man can learn more from a foolish question than a fool can learn from a wise answer."
]
