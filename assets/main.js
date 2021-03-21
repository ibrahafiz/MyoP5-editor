var forceTranslation = true;
var LOGGED_IN = false;

const DIRECT_API_LUIS = "https://westus.api.cognitive.microsoft.com/luis/prediction/v3.0/apps/04a6b73e-624a-4b4a-b333-743a5c41f1d8/slots/staging/predict?subscription-key=1ec28eb72f0348ee8be3dac05b8f1a0a&verbose=true&show-all-intents=true&log=true&query=";
const TRANS_API = "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=en"
const TRANS_HEADER = {
    'Ocp-Apim-Subscription-Key': '3775a0d97cd240c58c66788f35de2270',
    'Content-type': 'application/json'
}


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

var quill = new Quill('#editor', {
    theme: 'snow'
});

var ready = (callback) => {
    if (document.readyState != "loading") callback();
    else document.addEventListener("DOMContentLoaded", callback);
}

ready(() => {

    document.querySelector("#play").addEventListener("click", (e) => {
        //let txt = $('textarea#prgm-setup').val() + "~`~" + $('textarea#prgm-loop').val();
        //let txt = $('#prgm-setup').text() + "~`~" + $('#prgm-loop').text();
        //let txt = document.getElementById('prgm-setup').value + "\n~`~\n" + document.getElementById('prgm-loop').value;
        //let lines = txt.split('\n');

        var str = quill.getText();
        //var result = str.match(/\(?[^\.\?\!]+[\.!\?]\)?/g);
        var result = str.split('\n').slice(0,-1);
        directLuis(result);
        
        console.log(result);

    });

    //console.log("4".padStart(4, "0"));

    document.querySelector("#sign-in").addEventListener("click", (e) => {
        location.href="https://myocode.azurewebsites.net/.auth/login?post_login_redirect_url=http://127.0.0.1:5500/main.html"
    });
    
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
