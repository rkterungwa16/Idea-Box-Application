var ideasData = [];

function map (arr) {
	var mapped = [];
	for (var i=0; i<arr.length; ++i) {
  
   	    mapped.push(arr[i]._id);
	}
	return mapped;
}

function getData () {
	$.getJSON('/ideaData', function (data) {
        ideasData = data;
	});
}

//console.log(ideasData);

function likeCount (data) {
	//$('#showlike').text(1);
	$('#' + $(this).attr('rel')).text(data.likes.length);
}

function showInfo (event) {
	event.preventDefault();
	console.log($(this).attr('rel'));
	$('#' + $(this).attr('rel')).text(ideasData[0].likes.length);
}

// Update likes
function likeIdea(event) {
    event.preventDefault();
    var id = $(this).attr('rel');
    console.log(id);
    var idData = {id: id}
    
    $.ajax({
        type: 'GET',
        url: '/likes',
        data: idData,
        dataType: 'JSON'
    }).done(function (response) {
        // Get current data
        //getData();
        console.log(response);
        console.log(response.likes.length);
        var count = response.likes.length;
        console.log(typeof count);
        $('#' + id).text(count);
    });

};

function addComment (event) {
	event.preventDefault();
	var id = $(this).attr('id');
	var commentBody = $('.ideacomment').val();
	console.log('This is the comment', commentBody);
	var commentData = {id: id, commentBody: commentBody};
	console.log('this is the comment id', id);
	$.ajax({
		type: 'POST',
		url: '/addComment',
		data: commentData,
		dataType: 'JSON'
	}).done(function (response) {
		console.log('Everything ok');
		appendComment();
	})

}

function appendComment (event) {
	var id = $(this).attr('rel');
	$.getJSON('/getComment', function (data) {
		var addIdea = '<div class="post">' +
    		'<a class="colorize" href="/user/"' + data.name + '>' +
    		'<div class="smallpic">' +
    		'<img class="smallpic_img" src=" data.image">'+
    		'</div>' +
    		'<div class="smallname">' + data.name + '</div>'+
    		'</a>' +
    		'<br>' +
    		'<div class="statusbody">' + data.comment + '</div>'
    		'</div>';
    		$('div#' + id).prepend(addIdea); 
	});

}

$(function () {

    // Like link click
    getData();
    $('.linkshowlikes').on('click', likeIdea);
    $('.sub').on('click', addComment);

    $('.my-post').hide();
    var $postarea = $('.post');
	$postarea.hide();
	$('a.feed-comment').click(function (event) {
		event.preventDefault();
		if ($postarea.is(':hidden')) {
			$postarea.slideDown('slow');
			$(this).text('Hide Comments');
		}
		else {
			$postarea.slideUp('slow');
			$(this).text('Show Comments');
		}
	})
   
	var hostname = window.location.hostname;
	//var socket = io.connect(hostname);
	var socket = io.connect(hostname);

	socket.on('newIdea', function (res) { 
		console.log(res.newCommentAuthor);
		var time = new Date(res.newCommentAuthor.time).toISOString();
		var addIdea = '<div class="test">\
				<h3>' + res.newCommentAuthor.title + '<p>' + res.newCommentAuthor.body + 
				'<div><button id="like"><a href="#">Like</a></button><span id="likecount">1</span>\
				<button id="dislike"><a href="#">DisLike</a></button><span id="likecount">1</span>\
				<span id="comment"><a href="#">Comment</a></span>\
				<br>\
				<div id="dateposted">\
				<span id="by">By</span><a href=#>\
				<span id="byname">' + res.newCommentAuthor.name + '</span></a>\
				<span id="commentdate">' + time + '</span>\
				</div>';
    	$('#myideas').prepend(addIdea);

	});
});
