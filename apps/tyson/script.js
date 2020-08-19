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
"Everyone has a plan 'till they get punched in the mouth.",
"As long as we persevere and endure, we can get anything we want.",
"I normally don't do interviews with women unless I fornicate with them. So you shouldnt talk anymore unless you wanna...you know",
"My back is broken...[Reporter: What Part?]... Spinal",
"Im a convicted rapist, I'm a good father, I'm a semi-good husband.",
"I paid a worker at New York's zoo to re-open it just for me and Robin. When we got to the gorilla cage there was 1 big silverback gorilla there just bullying all the other gorillas. They were so powerful but their eyes were like an innocent infant. I offered the attendant $10,000 to open the cage and let me smash that silverback's snotbox! He declined.",
"I could sell out madison square gardens masturbating",
"I'm gonna f you till you love me."                     
]
