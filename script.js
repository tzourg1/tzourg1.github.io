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
  "Tony the type of guy to pull over cops for speeding",
  "Tony is the type of guy who passes to half guard during sex.",
  "Tony is the type of guy to dutch oven himself.",
  "Tony is the type of guy to wipe his ass before taking a shit",
                                    "Tony the type of guy to weld with sunglasses on",
"Tony the type of guy to insist on handing the doctor the scalpel for his own surgery",
"Tony the type of guy to cover his kitchen floor in legos to condition his feet",
"Tony the type of guy to fight fire with a darce choke",
"Tony the type of guy to go both directions through a revolving door",
"Tony the type of guy to drop ten pounds and move up a weight class",
"Tony the type of guy to go scuba diving with a tank of compressed CO2",
"Tony the type of guy to punish his kid by making him stay up late",
"Tony the type of guy to wash his face with Tabasco sauce"
                                    
]