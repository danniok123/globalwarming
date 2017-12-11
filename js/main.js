areaGraph = new StackedAreaGraphManager("data/greenhouseGasEmissionCountry.csv","stacked-area-chart");
areaGraph.init();

GMSLgraph = new GMSLmanager("data/GMSL_Church_White.csv","data/sizes.csv","GMSL-line-chart");
// Church, J. A., & White, N. J. (2011). Sea-Level Rise from the Late 19th to the Early 21st Century. Surveys in Geophysics, 32(4-5), 585–602. http://doi.org/10.1007/s10712-011-9119-1
GMSLgraph.init();

jQuery(document).ready(function($){
    var timelineBlocks = $('.cd-timeline-block'),
        offset = 0.8;

    //hide timeline blocks which are outside the viewport
    hideBlocks(timelineBlocks, offset);

    //on scolling, show/animate timeline blocks when enter the viewport
    $(window).on('scroll', function(){
        (!window.requestAnimationFrame)
            ? setTimeout(function(){ showBlocks(timelineBlocks, offset); }, 100)
            : window.requestAnimationFrame(function(){ showBlocks(timelineBlocks, offset); });
    });

    function hideBlocks(blocks, offset) {
        blocks.each(function(){
            ( $(this).offset().top > $(window).scrollTop()+$(window).height()*offset ) && $(this).find('.cd-timeline-img, .cd-timeline-content').addClass('is-hidden');
        });
    }

    function showBlocks(blocks, offset) {
        blocks.each(function(){
            ( $(this).offset().top <= $(window).scrollTop()+$(window).height()*offset && $(this).find('.cd-timeline-img').hasClass('is-hidden') ) && $(this).find('.cd-timeline-img, .cd-timeline-content').removeClass('is-hidden').addClass('bounce-in');
        });
    }
});