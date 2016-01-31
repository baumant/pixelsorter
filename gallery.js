var imgCount = 1;
var images = ["1.png", "2.jpeg", "3.jpeg", "sun.jpeg"];


for (var i = 0; i < images.length; i++) {
	if (i>2) {
		$(".images").append("<img class='exampleImage' data-lazy='img/gallery/"+images[i]+"'/>");
	} else {
		$(".images").append("<img class='exampleImage' src='img/gallery/"+images[i]+"'/>");
	}
}


$('.images').slick({
	lazyLoad: 'progressive',
	slidesToShow: 2,
	slidesToScroll: 1,
	autoplay: true,
	prevArrow: '<button type="button" aria-label="Previous"><span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span></button>',
	nextArrow: '<button type="button" aria-label="Previous"><span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span></button>',
});

$('.images').css('display', 'flex');

