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

// Delete User
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


$(function () {
	//getData();

    // Like link click
    getData();
    $('.linkshowlikes').on('click', likeIdea);
   
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
