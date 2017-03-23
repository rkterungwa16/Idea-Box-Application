
$(function () {


    $("#comment").keydown(function(e){
	    if (e.keyCode == 13) {
	        $('#commentform').submit();
	    	}
	}); 

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
