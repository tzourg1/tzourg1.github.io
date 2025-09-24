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
"Jealous of him? This guy can't even put a f*ckin' sentence together man, are you kidding me right now? He's reaching for - he's reaching for those grapes. He's trying to make his wine, and the wine's already soundin' like a violin with that cheese and wine...um...we'll see on November 24th.",
"I wanna outlive my children, of course, 100%.",
"United we stand, divided, we will not fall",
"I train six days, actually six days a week. Five days a week, I’ll train three days a week. One of those days I will train two days of the week. So, six days a week I will be training.",
"Let me tell you how you feeling right now.",
"Well here we are with a br.. S'raldo Babalu you did an awesome job so what you're a blackbelt in juijitsu gettin' a awesome submission there. I wanna tell me, what you see, lets go ahead and see it by the fight, what you saw, in the ring",
"I'm only 43 years old. I'm an old mature, I mean I matured old, I mean... very fast, but at the same time my body hasn't matured great just because of... my father's really old my father is 80 years old, my grandmother's 100 years old, so my body is in great shape."
]
