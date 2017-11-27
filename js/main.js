jQuery(document).ready(function($){
	var	scrolling = false;
	var contentSections = $('.scroller'),
		verticalNavigation = $('.vertical-nav'),
		horizontalNavigation = $('.menu'),
		navigationItems = verticalNavigation.find('a'),
		navTrigger = $('.cd-nav-trigger'),
		scrollArrow = $('.cd-scroll-down'),
		learnMore = $('#learn');

	$(window).on('scroll', checkScroll);

	//smooth scroll to the selected section
	verticalNavigation.on('click', 'a', function(event){
        event.preventDefault();
        smoothScroll($(this.hash));
        verticalNavigation.removeClass('open');
    });

    horizontalNavigation.on('click', 'a', function(event){
        event.preventDefault();
        smoothScroll($(this.hash));
    });

    //smooth scroll to the second section
    scrollArrow.on('click', function(event){
    	event.preventDefault();
        smoothScroll($(this.hash));
    });

    //smooth scroll to the second section
    learnMore.on('click', function(event){
        event.preventDefault();
        smoothScroll($(this.hash));
    });

	// open navigation if user clicks the .cd-nav-trigger - small devices only
    navTrigger.on('click', function(event){
    	event.preventDefault();
    	verticalNavigation.toggleClass('open');
    });

	function checkScroll() {
		if( !scrolling ) {
			scrolling = true;
			(!window.requestAnimationFrame) ? setTimeout(updateSections, 500) : window.requestAnimationFrame(updateSections);
		}
	}

	function updateSections() {
		var halfWindowHeight = $(window).height()/2,
			scrollTop = $(window).scrollTop();
		contentSections.each(function(){
			var section = $(this),
				sectionId = section.attr('id'),
				navigationItem = navigationItems.filter('[href^="#'+ sectionId +'"]');
			( (section.offset().top - halfWindowHeight < scrollTop ) && ( section.offset().top + section.height() - halfWindowHeight > scrollTop) )
				? navigationItem.addClass('active')
				: navigationItem.removeClass('active');
		});
		scrolling = false;
	}

	function smoothScroll(target) {
        $('body,html').animate(
        	{'scrollTop':target.offset().top},
        	300
        );
	}
});

function newQuestion(params) {
    var tmp = {
        question:  params[0],
        choices: params[1]
    };
    return tmp;
}

var allQuestions = [
    ["<p>Do you think Global Warming is happening?<p/>", ["Yes", "No", "Don't Know"]],
    ["<p>If global warming was happening, do you think it's...<p/>", ["Caused mostly by human activities", "Caused by human activities and natural changes",
        "Caused mostly by natural changes in the environment", "Neither because global warming isn’t happening"]],
    ["<p>How much do you think global warming will harm people in the\n" +
    "United States<p/>", ["Not at all", "Only a little", "A moderate amount", "A great deal", "Don’t know"]],
    ["<p>Which comes closest to your own view?<p/>", ["Most scientists think global warming is happening",
        "There is a lot of disagreement among scientists about whether or not global warming is happening",
        "Most scientists think global warming is not happening", "Don’t know enough to say"]],
    ["<p>Are you worried about global warming?<p/>", ["Not at all", "Only a little", "A moderate amount", "A great deal", "Don’t know"]]
].map(newQuestion);

var number = 0, totalQuestions = allQuestions.length, answers = [], answersText = [];
var selectID = 0;

$(document).ready(function() {
    function newQuestionAnswers() {
        $("#content").fadeOut(500, function() {
            $("#answers").empty();
            var query = allQuestions[number];
            $("#question").html(query.question);

            for(var i = 0; i < query.choices.length; i++) {
                $("#answers").append("<input type='radio' name='answers' id='radio" + i + "' value='answer" + i
                    + "'><label class='rbuts' for='test" + i + "'>" + " " + query.choices[i] + "</label><br>");
            }
            if(answers.length > number)
                $("#radio" + answers[number]).prop("checked", true);
            if (number > 0)
                $("#back").prop("disabled", false);
        });
        $("#content").fadeIn(500);
    }

    function nextAnswer() {
        var querys = allQuestions[number];
        for(var i = 0; i < $("input").length; i++) {
            if ($("#radio" + i).is(":checked")) {
                answers[number] = i;
                answersText[number] = querys.choices[i];
                break;
            }
            else if ( i === $("input").length -1 && !$("#radio" +i).is(":checked")) {
                $("#next").after("<p id='warning'>Please select an answer!</p>");
                return false;
            }
        }
        number += 1;
        return true;
    }


    function results() {
        $("#resultsText").html("You answered: " + answersText[selectID] + "<br>" + "Here's what others think:").show(1000);
        $("#results").show(1000);
        $("#question, #answers, #next, #back").hide(10);
        console.log(answersText);
    }

    function changeText(id) {

        selectID = id;
        console.log(selectID);

        results();

    }


    $("#back").hide();
    $("#next").hide();
    $("#resultsText").hide();
    $("#results").hide();


    $("#start").on('click', function() {
        $("#title").hide();
        $("#start").hide();
        $("#next").show(1000);
        $("#bar").width('5%');
        newQuestionAnswers();
    });


    $("#next").on('click', function() {
        $("#back").show(100);
        $("#warning").remove();
        if(nextAnswer()) {
            if (number < totalQuestions)
                newQuestionAnswers();
            else
                changeText(selectID);
        }

        // When progressing, update the bar
        if (number > 0)
            $("#back").prop("disabled", false);
        $("#bar").width('20%');

        if (number > 1)
            $("#bar").width('40%');
        if (number > 2)
            $("#bar").width('60%');
        if (number > 3)
            $("#bar").width('80%');
        if (number > 4)
            $("#bar").width('100%');
    });

    // update the bar when moving backwards
    $("#back").on('click', function() {
        if ( number === totalQuestions) {
            $("#resultsText").hide();
            $("#question, #answers, #next, #resultsText").show(2500);
        }

        if (number > 0)
            $("#bar").width('5%');
        if (number > 1)
            $("#bar").width('20%');
        if (number > 2)
            $("#bar").width('40%');
        if (number > 3)
            $("#bar").width('60%');
        if (number > 4)
            $("#bar").width('80%');

        number -= 1;
        $("#back").prop("disabled", true);
        newQuestionAnswers();

    });
});