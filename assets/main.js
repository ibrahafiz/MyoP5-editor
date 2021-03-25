
var LOGGED_IN = false;


function signIn() {
    axios.get("https://localhost:7071/.auth/me")
    .then((response) => {
        if (response != null) {
            console.log(response);
            alert(response[0]['user_id'])
        }
        else {

        }
    }, (error) => {
        alert("There was an error logging in.")
    })
}

function getCodeResponse(raw_code) {
    const dat = "[{'age':'" + 23 + "'}]";
    axios.post("https://localhost:7071/api/HttpExample", dat)
    .then((response) => {
        console.log(response);
    }, (error) => {
        alert("There was an error translating to code.")
    })
}


var quill;
var timer;
var changed = false;

function play() {
    //let txt = $('textarea#prgm-setup').val() + "~`~" + $('textarea#prgm-loop').val();
    //let txt = $('#prgm-setup').text() + "~`~" + $('#prgm-loop').text();
    //let txt = document.getElementById('prgm-setup').value + "\n~`~\n" + document.getElementById('prgm-loop').value;
    //let lines = txt.split('\n');

    var str = quill.getText();
    //var result = str.match(/\(?[^\.\?\!]+[\.!\?]\)?/g);
    var result = str.split('\n');
    var filtered = result.filter(function (el) {
        return el != null && el != "";
      });
    directLuis(filtered);
    
    console.log(filtered);
}

var ready = (callback) => {
    if (document.readyState != "loading") callback();
    else document.addEventListener("DOMContentLoaded", callback);
}

ready(() => {

    quill = new Quill('#editor', {
        theme: 'bubble'
    });

    //const binding = new QuillBinding(type, quill, provider.awareness)

    var prev = localStorage.getItem('last-state');
    if (prev != null) {
        quill.root.innerHTML = prev;
        setTimeout(function(){
            play();
        }, 1);
    }

    quill.on('selection-change', function(range, oldRange, source) {
        if (range) {
          if (range.length == 0) {
            if (changed) {
                clearTimeout(timer);
                timer = setTimeout(function(){
                    localStorage.setItem('last-state', quill.root.innerHTML);
                    //play();
                }, 3000);
                changed = false;
            }
            console.log('User cursor is on', range.index);
          } else {
            var text = quill.getText(range.index, range.length);
            console.log('User has highlighted', text);
          }
        } else {
          console.log('Cursor not in the editor');
        }
    });

    quill.on('text-change', function(delta, oldDelta, source) {
        if (source == 'api') {
          console.log("An API call triggered this change.");
        } else if (source == 'user') {
            clearTimeout(timer);
            changed = true;
            timer = setTimeout(function(){
                localStorage.setItem('last-state', quill.root.innerHTML);
                //play();
            }, 8000);
          console.log("A user action triggered this change.");
        }
    });

    document.querySelector("#play").addEventListener("click", (e) => {
        play();
    });


    document.querySelector("#sign-in").addEventListener("click", (e) => {
        location.href="https://myocode.azurewebsites.net/.auth/login?post_login_redirect_url=http://127.0.0.1:5500/main.html"
    });
    
    document.addEventListener("keydown", function(e) {
        if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
          e.preventDefault();
          localStorage.setItem('last-state', quill.root.innerHTML);
          play();
        }
      }, false);
    //loggedIn();
});

function loggedIn() {
    axios.get("https://myocode.azurewebsites.net/.auth/me")
    .then((response) => {
        if (response != null) {
            console.log(response);
            document.getElementById("sign-in").style.display = "none";
            document.getElementById("play").style.display = "inline";
            //alert(response[0]['user_id'])
            LOGGED_IN = true;
        }
        else {
            document.getElementById("sign-in").style.display = "inline";
            document.getElementById("play").style.display = "none";
            LOGGED_IN = false;
        }
    }, (error) => {
        document.getElementById("sign-in").style.display = "inline";
        document.getElementById("play").style.display = "none";
        //LOGGED_IN = false;
        //alert("There was an error logging in.")
    })
    
}
