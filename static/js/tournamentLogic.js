console.log("Successful");

$('body').on('click', '.game-top', function(){
    // console.log($(this).parent());
    // var bracketDiv = $(this).attr('bracketDiv');
    var bracketDiv = $(this).attr('nextDiv');

    var participant = $(this)[0].innerText;
    $(this).parent().next(".round").find("[bracketDiv="+bracketDiv+"]")[0].innerText = participant;
    // console.log($(this));
})

$('body').on('click', '.game-bottom', function(){
    // console.log($(this).parent());
    // var bracketDiv = $(this).attr('bracketDiv');
    var bracketDiv = $(this).attr('nextDiv');

    var participant = $(this)[0].innerText;
    $(this).parent().next(".round").find("[bracketDiv="+bracketDiv+"]")[0].innerText = participant;
    // console.log($(this));
})