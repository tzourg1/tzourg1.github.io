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
"Mike Tyson the type of guy to pull over cops for speeding",
"Mike Tyson is the type of guy who passes to half guard during sex.",
"Mike Tyson is the type of guy to dutch oven himself.",
"Mike Tyson is the type of guy to wipe his ass before taking a shit",
"Mike Tyson the type of guy to weld with sunglasses on",
"Mike Tyson the type of guy to insist on handing the doctor the scalpel for his own surgery",
"Mike Tyson the type of guy to cover his kitchen floor in legos to condition his feet",
"Mike Tyson the type of guy to fight fire with a darce choke",
"Mike Tyson the type of guy to go both directions through a revolving door",
"Mike Tyson the type of guy to drop ten pounds and move up a weight class",
"Mike Tyson the type of guy to go scuba diving with a tank of compressed CO2",
"Mike Tyson the type of guy to punish his kid by making him stay up late",
"Mike Tyson the type of guy to wash his face with Tabasco sauce",
"Mike Tyson Ferguson the type of guy to sit next to you on an empty bus"
                                    
]
