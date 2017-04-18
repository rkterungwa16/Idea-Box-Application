var ideasData = [];

function map (arr) {
	var mapped = [];
	for (var i=0; i<arr.length; ++i) {
  
   	    mapped.push(arr[i]._id);
	}
	return mapped;
}
/*
 *  Separate the numbers from the alphabets in html element id
*/
function getIdNumber (str, num) {
	var strArr = str.split('');
	strArr.splice(0,num);
	return strArr.join('');
}

/*
 *  Like an idea post
*/ 
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
        console.log(response);
        console.log(response.likes.length);
        var count = response.likes.length;
        console.log(typeof count);
        $('#likecnt' + id).text(count);
    });

};

/*
 *  Comment on an idea post
*/ 
function addComment (event) {
	event.preventDefault();
	var id = $(this).attr('id');
	// Get the numerical part of id
	var newId = getIdNumber(id, 3);
	// Assign id of current idea post to global postId
	postId = newId;
	// Get the value in textarea
	var commentBody = $('#ideacmnt' + newId).val();
	console.log('This is the comment', commentBody);
	var commentData = {id: newId, commentBody: commentBody};
	console.log('this is the comment id', postId);
	$.ajax({
		type: 'POST',
		url: '/addComment',
		data: commentData,
		dataType: 'JSON'
	}).done(function (response) {
		console.log(response);
		console.log(response._id);
		appendComment(response, response._id);
		$('#ideacmnt' + newId).val('');
	})

}

/*
 *  Add comments on an idea post
*/ 
function appendComment (data, id) {
	var addIdea = '<div class="post' + id + '">' +
		'<a class="colorize" href="/user/' + data.comments[0].name + '">' +
		'<div class="smallpic">' +
		'<img class="smallpic_img" src=" data.image">' +
		'</div>' +
		'<div class="smallname">' + data.comments[0].name + '</div>'+
		'</a>' +
		'<br>' +
		'<div class="statusbody">' + data.comments[0].comment + '</div>'
		'</div>';
		$('#cmtarea' + id).append(addIdea);  
}

$(function () {
	var postId; 
    // Click to like an idea
    $('.linkshowlikes').on('click', likeIdea);
    // Click to comment on an idea
    $('.sub').on('click', addComment);
    // Hide user profile post
	$('.my-post').hide();
	// Hide idea comment post
	$('.commentarea').hide();
	// Slide comments up and down
	$('.feed-comment').click(function (event) {
		event.preventDefault();
		var alphnumId = $(this).attr('id');
		var num = getIdNumber(alphnumId, 8);
		console.log('comment area id', num);
		var $postarea = $('#cmtarea' + num);
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
