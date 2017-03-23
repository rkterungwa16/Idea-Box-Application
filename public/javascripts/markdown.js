function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function convertTextAreaToMarkdown() {
	var converter = new showdown.Converter();
    var ideaDescription = document.getElementById('comment');
    var markdownArea = document.getElementById('markdown');

    var ideaDescriptionText = ideaDescription.value;
    html = converter.makeHtml(ideaDescriptionText);
    markdownArea.innerHTML = html;
}

$(document).ready(function() {
	$("#comment").on('input', convertTextAreaToMarkdown);
	convertTextAreaToMarkdown();
	$("#commentform").submit(function(event) {
		event.preventDefault();
		var ideaTitle = $("#comment_title").val();
		var ideaDescription = $("#comment").val();
		var cookie = getCookie('token');
		var idea = {ideaTitle: ideaTitle, ideaDescription: ideaDescription};
		$.ajax({
			url: encodeURI(':name/postIdea'),
			type: 'POST',
			beforeSend: function (xhr) {
				xhr.setRequestHeader('Authorization', cookie);
			},
			data: idea,
			dataType: "text",
			success: function (result) {
				console.log(result);
				window.location.replace('/user/:name');
			},
			error: function(xhr, status, error) {
				console.log(error);
			}
		});
	});
});


userIdeaRef.orderByChild("email").equalTo("trick@yahoo.com").on("child_added", function(data) {
   console.log("Equal to filter A: " + data.A);
   console.log("________________________");
     console.log("Equal to filter V: " + data.V);
   console.log("________________________");
     console.log("Equal to filter g: " + data.g);
   console.log("________________________");

    	marr.push(data.A);
    console.log('email key', marr[0])
});