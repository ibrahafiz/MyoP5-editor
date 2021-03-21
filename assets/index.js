
const api = "https://myocode.cognitiveservices.azure.com/luis/prediction/v3.0/apps/a2f6ec48-3d5e-495e-bd73-b3d42335010e/slots/staging/predict?subscription-key=64b7b41244ff40bc8bd999c63f7bb41c&verbose=true&show-all-intents=true&log=true&query="
const transAPI = "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=en"


var myp5;
var bypassTranslation = true;
let bypassLUIS = false;

var p5x = 0;
var p5y = 0;

function getDim(mode) {
    let x = document.getElementById('right-section');
    p5x = x.clientWidth - 3;
    p5y = x.clientHeight - 3;
    //return ("\n_p."+mode+"Canvas("+(x.clientWidth-3)+","+(x.clientHeight-3)+");\n");
    return ("_p." + mode + "Canvas(p5x, p5y);\n");
}


function newP5(code) {
    let F = new Function('_p', code);

    //return(F());
    try {
        myp5.remove();
        let element = document.getElementById("container");
        element.innerHTML = '';
    } catch (err) {
        myp5 = null;
    } finally {
        myp5 = new p5(F, 'container');
    }

}


function convertToCode(lines) {
    let num = lines.length;
    console.log(lines);
    let newLines = [];
    let pos = 0;
    for (var i = 0; i < num; i++) {
        if (lines[i] != "" && lines[i] != "~`~") {
            newLines.push(lines[i]);
        } else if (lines[i] == "~`~") {
            pos = newLines.length;
        }
    }
    num = newLines.length;
    console.log(newLines);

    let results = [];
    //let results = new Array(num);
    let promises = [];
    for (var i = 0; i < num; i++) {
        //code here using lines[i] which will give you each line
        if (newLines[i].includes("[") && newLines[i].includes("]")) {
            results.push(newLines[i]);
        } else {
            promises.push(
                axios.get(api + newLines[i]).then((response) => {
                    //console.log(response);
                    results.push(response);
                    //results.splice(i, 0, response);
                }, (error) => {
                    alert(error);
                })
            )
        }

    }

    let jsCode = "";
    Promise.all(promises).then(() => {
        let q = null;
        jsCode = "_p.setup = function() {" + getDim('create')
        jsCode += "try {"
        console.log(results)
        for (var i = 0; i < pos; i++) {
            for (var j = 0; i < results.length; j++) {
                if (typeof results[j] === 'string' || results[j] instanceof String) {
                    if (results[j] == newLines[i]) {
                        q = results[j];
                    }
                }
                else if (results[j].data.query == newLines[i]) {
                    q = results[j].data;
                    break;
                }
            }
            jsCode += processJSON(q);
        }
        jsCode += "} catch(err) { alert('Something went wrong when I was starting ...') };\n";
        jsCode += "};";

        jsCode += " _p.draw = function() {\n"
        jsCode += "try {"
        for (var i = pos; i < num; i++) {
            for (var j = 0; i < results.length; j++) {
                if (typeof results[j] === 'string' || results[j] instanceof String) {
                    if (results[j] == newLines[i]) {
                        q = results[j];
                    }
                }
                else if (results[j].data.query == newLines[i]) {
                    q = results[j].data;
                    break;
                }
            }
            jsCode += processJSON(q);
        }
        jsCode += "} catch(err) { alert('Something went wrong when I was looping ...'); _p.noLoop(); };\n";
        jsCode += "};\n_p.windowResized = function() {\n\tgetDim('resize')\n" + getDim('resize') + "}\n";
        // run the code

        newP5(jsCode);
        console.log(js_beautify(jsCode));


    });
}

function signIn() {
    axios.get("https://myocode.azurewebsites.net/.auth/me")
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

var ready = (callback) => {
    if (document.readyState != "loading") callback();
    else document.addEventListener("DOMContentLoaded", callback);
}

ready(() => {

    if (window.location.hash == '#create') {
        document.getElementById("create-btn").click();
    }
    else {
        document.getElementById("start-btn").click();
    }
    

    // For text area
    const tx = document.getElementsByTagName('textarea');
    for (let i = 0; i < tx.length; i++) {
        tx[i].setAttribute('style', 'height:' + (tx[i].scrollHeight + 50) + 'px;overflow-y:hidden;');
        tx[i].addEventListener("input", OnInput, false);
    }

    function OnInput() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    }
    /*
    document.getElementById("prgm-setup").addEventListener("input", function(e) {
        let iT = document.getElementById("prgm-setup").innerHTML;
        document.getElementById("prgm-setup").innerHTML = iT;
    }, false);
    */
    document.querySelector("#play").addEventListener("click", (e) => {
        //let txt = $('textarea#prgm-setup').val() + "~`~" + $('textarea#prgm-loop').val();
        //let txt = $('#prgm-setup').text() + "~`~" + $('#prgm-loop').text();
        let txt = document.getElementById('prgm-setup').value + "\n~`~\n" + document.getElementById('prgm-loop').value;
        let lines = txt.split('\n');


        const headers = {
            'Ocp-Apim-Subscription-Key': '3775a0d97cd240c58c66788f35de2270',
            'Content-type': 'application/json'
        }
        const dat = "[{'Text':'" + txt + "'}]";


        /*
        const bingHeaders = {
            'Ocp-Apim-Subscription-Key': '54d639708fc34f43a659f481dea5d94f',
            'Content-type': 'application/json'
        }
        const bingAPI = "https://api.bing.microsoft.com/v7.0/spellcheck?text="
        const bingData = "[{'text':'" + txt + "'}]";
        */

        if (bypassLUIS) {
            let setup_loop = txt.split('~`~');
            let jsCode = "_p.setup = function() {" + getDim() + setup_loop[0] + "}; _p.draw = function() {" + setup_loop[1] + "};";
            newP5(jsCode);
        } else if (bypassTranslation) {
            convertToCode(lines);
        } else {
            bypassTranslation = true;
            axios.post(transAPI, dat, {headers: headers})
            .then((response) => {
                console.log(response);
                txt = response.data[0].translations[0].text;
                let lines = txt.split('\n');
                convertToCode(lines);
            }, (error) => {
                alert("There was an error translating from another language. The current default is set to English.")
                convertToCode(lines)
            })
            /*
            axios.get(bingAPI + txt, {
                    headers: bingHeaders
                })
                .then((response) => {
                    console.log(response);
                    txt = response.data[0].translations[0].text;
                    let lines = txt.split('\n');
                    convertToCode(lines);
                }, (error) => {
                    alert("There was an error translating from another language. The current default is set to English.")
                    convertToCode(lines)
                })
            */
        }
    });

    document.querySelector("#stop").addEventListener("click", (e) => {
        if (myp5 != null) {
            myp5.remove();
        }
    });

    document.querySelector("#language").addEventListener("click", (e) => {
        bypassTranslation = false;
    });


    
    

});




function openTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function resizeIframe(obj) {
    obj.style.height = obj.contentWindow.document.documentElement.scrollHeight + 'px';
}