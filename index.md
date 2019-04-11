<html>
    <head>
        <title>comp3121</title>
        <script type="text/javascript">
            // var queryString = window.location.search.slice(1);
            // if (queryString) {
            //     qString = queryString.split("q=")[1].split("&")[0];
            //     alert(qString);
            // }

            var getAuthUrl = "https://api.instagram.com/oauth/authorize/?client_id=6c49785b68e343b8ae060297bfa7641b&redirect_uri=https://chowheikan.github.io/comp3121.github.io&response_type=token&hl=en"


            function authFunc(){
            var win = window.open(getAuthUrl, "auth_window");
            }

            var accessToken = window.location.hash.replace('#','?')
            console.log(accessToken);


        var xhr = new XMLHttpRequest();

        xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            var response = JSON.parse(this.responseText)
            console.log(response);
            response.data.map(function(item){

            var img = document.createElement('img');
            img.src =  item.images.standard_resolution.url; document.querySelector(".container").appendChild(img);
            
            })
        }
        });

        xhr.open("GET", "https://api.instagram.com/v1/users/self/media/recent/"+accessToken);
        xhr.send();
        </script>
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <!-- <script async src="https://www.googletagmanager.com/gtag/js?id=UA-134268415-1"></script> -->
        <script>
            // window.dataLayer = window.dataLayer || [];
            // function gtag(){dataLayer.push(arguments);}
            // gtag('js', new Date());
            // gtag('config', 'UA-134268415-1');
        </script>
    </head>
    <body>
        <button onClick="authFunc()">Authorize</button>   
        <div class="container"></div>     
    </body>
</html>
