var myp5;

var p5x = 0;
var p5y = 0;

function getDim(mode) {
    let x = document.getElementById('right-section');
    p5x = x.clientWidth - 3;
    p5y = x.clientHeight - 3;
    //return ("\n_p."+mode+"Canvas("+(x.clientWidth-3)+","+(x.clientHeight-3)+");\n");
    return ("_p." + mode + "Canvas(p5x, p5y);\n");
}

function directLuis(newLines) {
    newLines = newLines.filter(item => item);

    num = newLines.length;
    console.log(newLines);

    let results = [];
    let newLinesTRANS = [];
    
    //let results = new Array(num);
    let promises = [];
    let promises2 = [];
    for (var i = 0; i < num; i++) {
        //code here using lines[i] which will give you each line
        if (newLines[i].includes("[") && newLines[i].includes("]")) {
            results.push(newLines[i]);
            //newLinesTRANS.push(newLines[i]);
        } else {
            var temp = localStorage.getItem(newLines[i]);
            if (temp === null) {
                alert("No");
                const data = "[{'Text':'" + newLines[i] + "'}]";
                promises.push(
                    axios.post(TRANS_API, data, {headers: TRANS_HEADER}).then((response) => {
                        //console.log(response);
                        //results.push(response);
                        //results.splice(i, 0, response);
                        var line = response.data[0].translations[0].text;
                        newLinesTRANS.push(response);
                        //localStorage.setItem(newLines[i], line);

                        console.log(response);

                        promises2.push(
                            axios.get(DIRECT_API_LUIS + line).then((response) => {
                                //console.log(response);
                                results.push(response);
                                //results.splice(i, 0, response);
                            }, (error) => {
                                alert(error);
                            })
                        )

                    }, (error) => {
                        alert(error);
                    })
                    
                )
            }
            else {
                results.push(JSON.parse(temp));
            }
        }

    }
    
    let jsCode = "";
    Promise.all(promises).then(() => {
        Promise.all(promises2).then(() => {

        console.log(newLines);
        let q = null;
        jsCode = "_p.setup = function() {" + getDim('create')
        jsCode += "try {"
        console.log(results);

        for (var i = 0; i < num; i++) {
            
            for (var j = 0; j < results.length; j++) {
                if (typeof results[j] === 'string' || results[j] instanceof String) {
                    if (results[j] == newLines[i]) {
                        q = results[j];
                    }
                }
                else if (results[j].data.query == newLines[i]) {
                    localStorage.setItem(newLines[i], JSON.stringify(results[j])); 
                    
                    //alert(localStorage.getItem(newLines[i]))
                    q = results[j].data;
                    break;
                }
                else {
                    for (var k = 0; k < newLinesTRANS.length; k++) {
                        console.log(k);
                        console.log(newLinesTRANS[k].data[0].translations[0].text);
                        console.log(results[j]);
                        console.log(newLinesTRANS[k].config.data.slice(10,-3));
                        console.log(newLines[i]);
                        if (results[j].data.query == newLinesTRANS[k].data[0].translations[0].text && newLinesTRANS[k].config.data.slice(10,-3) == newLines[i]) {
                            localStorage.setItem(newLines[i], JSON.stringify(results[j])); 
                            q = results[j].data;
                        }
                    }
                }
            }
            jsCode += processJSON(q);
            q = null;
        }
        jsCode += "} catch(err) { alert('Something went wrong when I was starting ...') };\n";
        jsCode += "};";

        /*
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
        jsCode += "};";
        */
        jsCode += "\n_p.windowResized = function() {\n\tgetDim('resize')\n" + getDim('resize') + ";_p.setup();}\n";
        // run the code

        console.log(js_beautify(jsCode));
        newP5(jsCode);

        });
    });
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

function getColor(param) {
    let col = [0,0,0];
    let type = param['p-type'][0];
    let val = (param.hasOwnProperty('p-value') ? parseFloat(param['p-value'][0],10) : 0); 
    let unit = (param.hasOwnProperty('p-unit') ? param['p-unit'][0] : '%');
    
    if (unit=='%') { val = val*255/100; }

    if (type.includes('red')) {
        if (val) { col = [val,0,0]; } else { col = [255,0,0]; }
    }
    else if (type.includes('green')) {
        if (val) { col = [0,val,0]; } else { col = [0,255,0]; }
    }
    else if (type.includes('blue')) {
        if (val) { col = [0,0,val]; } else { col = [0,0,255]; }
    }
    return col;
}

function strContains(str, arr, cond=false) {
    for (var i=0;i<arr.length;i++){
        if (!cond && str.includes(arr[i])) {
            return true;
        }
        if (cond && !str.includes(arr[i])) {
            return false;
        }
    }
    return cond;
}

function getPos(param, origin) {
    let pos = [0,0];
    let type = param['p-type'][0];
    let val = (param.hasOwnProperty('p-value') ? parseFloat(param['p-value'][0],10) : 0); 
    let unit = (param.hasOwnProperty('p-unit') ? param['p-unit'][0] : 'px');

    if (strContains(' '+type,[' x ', 'horizontal', 'right', 'left', 'side'])) {
        if (unit=='%'){
            val = val*p5x/100;
        } else {
            ;
        }
        pos = [val-origin[0],0];
    }
    else if (strContains(' '+type,[' y ', 'vertical', 'up', 'down'])) {
        if (unit=='%'){
            val = val*p5y/100;
        } else {
            ;
        }
        pos = [0,val-origin[1]];
    }
    return pos;
}

function getDimen(param) {
    let dim = [0,0];
    let type = param['p-type'][0];
    let val = (param.hasOwnProperty('p-value') ? parseFloat(param['p-value'][0],10) : 0); 
    let unit = (param.hasOwnProperty('p-unit') ? param['p-unit'][0] : 'px');

    if (strContains(type,['width', 'wide'])) {
        if (unit=='%'){
            val = val*p5x/100;
        } else {
            ;
        }
        dim = [val,0];
    }
    else if (strContains(type,['height', 'tall'])) {
        if (unit=='%'){
            val = val*p5y/100;
        } else {
            ;
        }
        dim = [0,val];
    }
    else if (strContains(type,['diameter', 'radius'])) {
        if (type.includes('radius')) { val = val/2; }
        if (unit=='%'){
            val = val*p5x/100;
        } else {
            ;
        }
        dim = [val,val];
    }
    return dim;
}

function getIntent(name) {
    if (name.includes('background')) {
        return 'background';
    }
    else if (name.includes('circle')) {
        return 'circle';
    }
    else if (name.includes('fill')) {
        return 'fill';
    }
    else if (strContains(name,['rect','square'])) {
        return 'rect';
    }
    else if (strContains(name,['border','color'], true)) {
        return 'stroke';
    }
    else if (strContains(name,['border','thick'], true)) {
        return 'strokeWeight';
    }
    return '';
}


function processJSON(jsn, id) {

    var conds = null;
    if (typeof jsn === 'string' || jsn instanceof String) {
        let code = jsn.match(/\[(.*?)\]/);
        let final = code[1].replaceAll('@', '_p.') + '\n';
        return final;
    }
    else if (jsn == null || jsn == "") {
        return ";\n";
    }
    else if (jsn.prediction.topIntent != "Code") {
        return ";\n";
    }
    let entity = jsn.prediction.entities;
    let code = "";
    let arr = [];


    if (entity.hasOwnProperty('function')) { entity.function.forEach(function (item, index) {
        var starting = entity.$instance.function[index].startIndex;
        var jcode = "";
        switch ( getIntent(item['f-name'][0] )) {
            case 'background':
                jcode += "_p.background(";
                var _color = [0,0,0];
                if (item.hasOwnProperty('f-param')) { item['f-param'].forEach(function (param, i) {
                    
                    var resp = getColor(param);
                    for (var k=0;k<3;k++) { _color[k] += resp[k] }
                });}
                jcode += `${_color[0]},${_color[1]},${_color[2]});`;
                break;
            case 'fill':
                jcode += "_p.fill(";
                var _color = [0,0,0];
                if (item.hasOwnProperty('f-param')) { item['f-param'].forEach(function (param, i) {
                    
                    var resp = getColor(param);
                    for (var k=0;k<3;k++) { _color[k] += resp[k] }
                });}
                jcode += `${_color[0]},${_color[1]},${_color[2]});`;
                break;
            case 'stroke':
                jcode += "_p.stroke(";
                var _color = [0,0,0];
                if (item.hasOwnProperty('f-param')) { item['f-param'].forEach(function (param, i) {
                    
                    var resp = getColor(param);
                    for (var k=0;k<3;k++) { _color[k] += resp[k] }
                });}
                jcode += `${_color[0]},${_color[1]},${_color[2]});`;
                break;
            case 'strokeWeight':
                jcode += "_p.strokeWeight(";
                var _w = 3;
                if (item.hasOwnProperty('f-param')) { item['f-param'].forEach(function (param, i) {
                    _w = (param.hasOwnProperty('p-value') ? parseInt(param['p-value'][0],10) : 3); 
                });}
                jcode += `${_w});`;
                break;
            case 'circle':
                jcode += "_p.circle(";
                var _pos = [p5x/2,p5y/2];
                var _diam = [50,50];
                if (item.hasOwnProperty('f-param')) { item['f-param'].forEach(function (param, i) {
                    var resp1 = getPos(param, _pos);
                    console.log(resp1);
                    var resp2 = getDimen(param, _diam);
                    for (var k=0;k<2;k++) { _pos[k] += resp1[k] }
                    _diam = resp2;
                });}
                jcode += `${_pos[0]},${_pos[1]},${_diam[0]});`;
                break;
            case 'rect':
                jcode += "_p.rectMode(_p.CENTER);_p.rect(";
                var _pos = [p5x/2,p5y/2];
                var _diam = [100,100];
                if (item.hasOwnProperty('f-param')) { item['f-param'].forEach(function (param, i) {
                    var resp1 = getPos(param, _pos);
                    console.log(resp1);
                    var resp2 = getDimen(param, _diam);
                    for (var k=0;k<2;k++) { _pos[k] += resp1[k] }
                    for (var k=0;k<2;k++) { _diam[k] += resp2[k] }
                });}
                jcode += `${_pos[0]},${_pos[1]},${_diam[0]},${_diam[1]});`;
                break;
            
        }
        arr.push([id, starting, jcode]);
        //console.log(item, index);
    });}

    console.log(arr);
    return arr[0][2];

    switch (intent) {
        case "p5.Background":
            code += "_p.background(";
            let _r = 0;
            let _g = 0;
            let _b = 0;
            arr = jsn.prediction.entities.param;
            for (var i = 0; i < arr.length; i++) {
                //console.log(arr[i].name);
                if (arr[i].hasOwnProperty('name') && arr[i].hasOwnProperty('value')) {
                    switch (arr[i].name[0].toLowerCase()) {
                        case "red":
                        case "r":
                            _r = arr[i].value[0];
                            break;
                        case "green":
                        case "g":
                            _g = arr[i].value[0];
                            break;
                        case "blue":
                        case "b":
                            _b = arr[i].value[0];
                            break;
                    }
                }
            }
            console.log(_r + "," + _g + "," + _b + ");\n");
            code += _r + "," + _g + "," + _b + ");\n";
            break;
        case "p5.Fill":
            code += "_p.fill(";
            let _rf = 0;
            let _gf = 0;
            let _bf = 0;
            arr = jsn.prediction.entities.param;
            for (var i = 0; i < arr.length; i++) {
                //console.log(arr[i].name);
                if (arr[i].hasOwnProperty('name') && arr[i].hasOwnProperty('value')) {
                    switch (arr[i].name[0].toLowerCase()) {
                        case "red":
                        case "r":
                            _rf = arr[i].value[0];
                            break;
                        case "green":
                        case "g":
                            _gf = arr[i].value[0];
                            break;
                        case "blue":
                        case "b":
                            _bf = arr[i].value[0];
                            break;
                    }
                }
            }
            console.log(_rf + "," + _gf + "," + _bf + ");\n");
            code += _rf + "," + _gf + "," + _bf + ");\n";
            break;
        case "p5.Rect":
            let _xr = 0;
            let _yr = 0;
            let _wr = 0;
            let _hr = 0;

            arr = jsn.prediction.entities;
            console.log(arr);
            if (arr.hasOwnProperty('condition') && arr.hasOwnProperty('Conditionals')) {
                conds = arr.Conditionals[0];
                arr = arr.condition[0];
                if (arr.hasOwnProperty('item1')) { // arr.hasOwnProperty('compare') && 
                    code += " if (" + arr.item1[0];
                    switch(conds[0]) {
                        case "equal":
                            code += " == "
                            break;
                        case "not equal":
                            code += " != "
                            break;
                        case "greater than":
                            code += " > "
                            break;
                        case "greater than or equal to":
                            code += " >= "
                            break;
                        case "less than":
                            code += " < "
                            break;
                        case "less than or equal to":
                            code += " <= "
                            break;
                    }
                    if ( arr.hasOwnProperty('item2') ) {
                        code += arr.item2[0] + ") ";
                    }
                    else if (arr.item1.length > 1) {
                        code += arr.item1[1] + ") ";
                    }
                    else {
                        code += " 0 ) ";
                    }
                }
                else {
                    console.log("NOT WORKS");                }
            }

            code += "_p.rect(";
            arr = jsn.prediction.entities.param;
            for (var i = 0; i < arr.length; i++) {
                //console.log(arr[i].name);
                if (arr[i].hasOwnProperty('name') && arr[i].hasOwnProperty('value')) {
                    switch (arr[i].name[0].toLowerCase()) {
                        case "horizontal":
                        case "x":
                        case "right":
                        case "left":
                            _xr = arr[i].value[0];
                            break;
                        case "vertical":
                        case "y":
                        case "up":
                        case "down":
                            _yr = arr[i].value[0];
                            break;
                        case "height":
                        case "h":
                        case "tall":
                            _hr = arr[i].value[0];
                            break;
                        case "width":
                        case "w":
                        case "long":
                        case "wide":
                            _wr = arr[i].value[0];
                            break;
                    }
                }

            }
            if (_wr == 0 && _hr == 0) {
                _wr = 50;
                _hr = 50;
            }
            else if (_wr == 0) {
                _wr = _hr;
            }
            else if (_hr == 0) {
                _hr = _wr;
            }
            code += _xr + "," + _yr + "," + _wr + "," + _hr + ");\n";
            break;
        case "p5.Circle":
            let _x = 0;
            let _y = 0;
            let _d = 30;

            arr = jsn.prediction.entities;
            console.log(arr);
            if (arr.hasOwnProperty('condition') && arr.hasOwnProperty('Conditionals')) {
                conds = arr.Conditionals[0];
                arr = arr.condition[0];
                if (arr.hasOwnProperty('item1')) { // arr.hasOwnProperty('compare') && 
                    code += " if (" + arr.item1[0];
                    switch(conds[0]) {
                        case "equal":
                            code += " == "
                            break;
                        case "not equal":
                            code += " != "
                            break;
                        case "greater than":
                            code += " > "
                            break;
                        case "greater than or equal to":
                            code += " >= "
                            break;
                        case "less than":
                            code += " < "
                            break;
                        case "less than or equal to":
                            code += " <= "
                            break;
                    }
                    if (arr.hasOwnProperty('item2') ) {
                        code += arr.item2[0] + ") ";
                    }
                    else if (arr.item1.length > 1) {
                        code += arr.item1[1] + ") ";

                    }
                    else {
                        code += " 0 ) ";
                    }
                }
                else {
                    console.log("NOT WORKS");                }
            }

            code += "_p.circle(";
            arr = jsn.prediction.entities.param;
            for (var i = 0; i < arr.length; i++) {
                //console.log(arr[i].name);
                if (arr[i].hasOwnProperty('name') && arr[i].hasOwnProperty('value')) {
                    switch (arr[i].name[0].toLowerCase()) {
                        case "horizontal":
                        case "x":
                        case "right":
                        case "left":
                            _x = arr[i].value[0];
                            break;
                        case "vertical":
                        case "y":
                        case "up":
                        case "down":
                            _y = arr[i].value[0];
                            break;
                        case "diameter":
                        case "d":
                        case "radius":
                        case "wide":
                            _d = arr[i].value[0];
                            break;
                    }
                }
            }
            code += _x + "," + _y + "," + _d + ");\n";
            break;
        case "p5.Text":
            code += "_p.text(";
            let _xt = 0;
            let _yt = 0;
            arr = jsn.prediction.entities;
            if (arr.hasOwnProperty('RawText')) {
                code += arr.RawText[0] + ',';
                if (arr.hasOwnProperty('param')) {
                    arr = arr.param
                    for (var i = 0; i < arr.length; i++) {
                        //console.log(arr[i].name);
                        if (arr[i].hasOwnProperty('name') && arr[i].hasOwnProperty('value')) {
                            switch (arr[i].name[0].toLowerCase()) {
                                case "horizontal":
                                case "x":
                                case "right":
                                case "left":
                                    _xt = arr[i].value[0];
                                    break;
                                case "vertical":
                                case "y":
                                case "up":
                                case "down":
                                    _yt = arr[i].value[0];
                                    break;
                            }
                        }
                    }
                }
            }
            code += _xt + "," + _yt + ");\n";
            break;
        case "Code":
            arr = jsn.prediction.entities;
            if (arr.hasOwnProperty('Raw')) {
                code += arr.Raw[0] + ";";
            }

            break;
        case "If":
            arr = jsn.prediction.entities;
            if (arr.hasOwnProperty('condition') && arr.hasOwnProperty('Conditionals')) {
                arr = arr.condition;
                let cond = arr.Conditionals[0];
                if (arr.hasOwnProperty('item1') && arr.hasOwnProperty('item2')) { // arr.hasOwnProperty('compare') && 
                    code += " if (" + arr.item1[0];
                    switch(cond[0]) {
                        case "equal":
                            cose += " == "
                            break;
                        case "not equal":
                            cose += " != "
                            break;
                        case "greater than":
                            cose += " > "
                            break;
                        case "greater than or equal to":
                            cose += " >= "
                            break;
                        case "less than":
                            cose += " < "
                            break;
                        case "less than or equal to":
                            cose += " <= "
                            break;
                    }
                    code += arr.item2[0] + ") ";
                }
            }

            break;
        case "Var":
            arr = jsn.prediction.entities;
            if (arr.hasOwnProperty('VarName2')) {
                code += "var " + arr.VarName2[0] + " = " ; // .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
                if (arr.hasOwnProperty('p5Variables')) {
                    //let st = arr.p5Variables[0][0];
                    switch (arr.p5Variables[0][0]) {
                        case "mousePressed":
                            code += "_p.mousePressed;"
                            break;
                        case "mouseX":
                            code += "_p.mouseX;"
                            break;
                        case "mouseY":
                            code += "_p.mouseY;"
                            break;
                        default :
                            code += "0;"
                    }
                }
                else if (arr.hasOwnProperty('VarValue')) {
                    code += arr.VarValue[0] + ";";
                }
                
            } else if (arr.hasOwnProperty('param')) {
                arr = arr.param;
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].hasOwnProperty('name') && arr[i].hasOwnProperty('value')) {
                        code += "var " + arr[i].name[0] + " = " + arr[i].value[0] + ";";
                    }
                }
            }

            break;
        default:
            cose = ";\n"
    }
    return code;
    //return (JSON.stringify(jsn) + '\n');
}


function processJSONX(jsn) {
    var conds = null;
    if (typeof jsn === 'string' || jsn instanceof String) {
        let code = jsn.match(/\[(.*?)\]/);
        let final = code[1].replaceAll('@', '_p.') + '\n';
        return final;
    }
    else if (jsn == null || jsn == "") {
        return ";\n";
    }
    //return ";\n";
    let intent = jsn.prediction.topIntent;
    let code = "";
    let arr = [];
    switch (intent) {
        case "p5.Background":
            code += "_p.background(";
            let _r = 0;
            let _g = 0;
            let _b = 0;
            arr = jsn.prediction.entities.param;
            for (var i = 0; i < arr.length; i++) {
                //console.log(arr[i].name);
                if (arr[i].hasOwnProperty('name') && arr[i].hasOwnProperty('value')) {
                    switch (arr[i].name[0].toLowerCase()) {
                        case "red":
                        case "r":
                            _r = arr[i].value[0];
                            break;
                        case "green":
                        case "g":
                            _g = arr[i].value[0];
                            break;
                        case "blue":
                        case "b":
                            _b = arr[i].value[0];
                            break;
                    }
                }
            }
            console.log(_r + "," + _g + "," + _b + ");\n");
            code += _r + "," + _g + "," + _b + ");\n";
            break;
        case "p5.Fill":
            code += "_p.fill(";
            let _rf = 0;
            let _gf = 0;
            let _bf = 0;
            arr = jsn.prediction.entities.param;
            for (var i = 0; i < arr.length; i++) {
                //console.log(arr[i].name);
                if (arr[i].hasOwnProperty('name') && arr[i].hasOwnProperty('value')) {
                    switch (arr[i].name[0].toLowerCase()) {
                        case "red":
                        case "r":
                            _rf = arr[i].value[0];
                            break;
                        case "green":
                        case "g":
                            _gf = arr[i].value[0];
                            break;
                        case "blue":
                        case "b":
                            _bf = arr[i].value[0];
                            break;
                    }
                }
            }
            console.log(_rf + "," + _gf + "," + _bf + ");\n");
            code += _rf + "," + _gf + "," + _bf + ");\n";
            break;
        case "p5.Rect":
            let _xr = 0;
            let _yr = 0;
            let _wr = 0;
            let _hr = 0;

            arr = jsn.prediction.entities;
            console.log(arr);
            if (arr.hasOwnProperty('condition') && arr.hasOwnProperty('Conditionals')) {
                conds = arr.Conditionals[0];
                arr = arr.condition[0];
                if (arr.hasOwnProperty('item1')) { // arr.hasOwnProperty('compare') && 
                    code += " if (" + arr.item1[0];
                    switch(conds[0]) {
                        case "equal":
                            code += " == "
                            break;
                        case "not equal":
                            code += " != "
                            break;
                        case "greater than":
                            code += " > "
                            break;
                        case "greater than or equal to":
                            code += " >= "
                            break;
                        case "less than":
                            code += " < "
                            break;
                        case "less than or equal to":
                            code += " <= "
                            break;
                    }
                    if ( arr.hasOwnProperty('item2') ) {
                        code += arr.item2[0] + ") ";
                    }
                    else if (arr.item1.length > 1) {
                        code += arr.item1[1] + ") ";
                    }
                    else {
                        code += " 0 ) ";
                    }
                }
                else {
                    console.log("NOT WORKS");                }
            }

            code += "_p.rect(";
            arr = jsn.prediction.entities.param;
            for (var i = 0; i < arr.length; i++) {
                //console.log(arr[i].name);
                if (arr[i].hasOwnProperty('name') && arr[i].hasOwnProperty('value')) {
                    switch (arr[i].name[0].toLowerCase()) {
                        case "horizontal":
                        case "x":
                        case "right":
                        case "left":
                            _xr = arr[i].value[0];
                            break;
                        case "vertical":
                        case "y":
                        case "up":
                        case "down":
                            _yr = arr[i].value[0];
                            break;
                        case "height":
                        case "h":
                        case "tall":
                            _hr = arr[i].value[0];
                            break;
                        case "width":
                        case "w":
                        case "long":
                        case "wide":
                            _wr = arr[i].value[0];
                            break;
                    }
                }

            }
            if (_wr == 0 && _hr == 0) {
                _wr = 50;
                _hr = 50;
            }
            else if (_wr == 0) {
                _wr = _hr;
            }
            else if (_hr == 0) {
                _hr = _wr;
            }
            code += _xr + "," + _yr + "," + _wr + "," + _hr + ");\n";
            break;
        case "p5.Circle":
            let _x = 0;
            let _y = 0;
            let _d = 30;

            arr = jsn.prediction.entities;
            console.log(arr);
            if (arr.hasOwnProperty('condition') && arr.hasOwnProperty('Conditionals')) {
                conds = arr.Conditionals[0];
                arr = arr.condition[0];
                if (arr.hasOwnProperty('item1')) { // arr.hasOwnProperty('compare') && 
                    code += " if (" + arr.item1[0];
                    switch(conds[0]) {
                        case "equal":
                            code += " == "
                            break;
                        case "not equal":
                            code += " != "
                            break;
                        case "greater than":
                            code += " > "
                            break;
                        case "greater than or equal to":
                            code += " >= "
                            break;
                        case "less than":
                            code += " < "
                            break;
                        case "less than or equal to":
                            code += " <= "
                            break;
                    }
                    if (arr.hasOwnProperty('item2') ) {
                        code += arr.item2[0] + ") ";
                    }
                    else if (arr.item1.length > 1) {
                        code += arr.item1[1] + ") ";

                    }
                    else {
                        code += " 0 ) ";
                    }
                }
                else {
                    console.log("NOT WORKS");                }
            }

            code += "_p.circle(";
            arr = jsn.prediction.entities.param;
            for (var i = 0; i < arr.length; i++) {
                //console.log(arr[i].name);
                if (arr[i].hasOwnProperty('name') && arr[i].hasOwnProperty('value')) {
                    switch (arr[i].name[0].toLowerCase()) {
                        case "horizontal":
                        case "x":
                        case "right":
                        case "left":
                            _x = arr[i].value[0];
                            break;
                        case "vertical":
                        case "y":
                        case "up":
                        case "down":
                            _y = arr[i].value[0];
                            break;
                        case "diameter":
                        case "d":
                        case "radius":
                        case "wide":
                            _d = arr[i].value[0];
                            break;
                    }
                }
            }
            code += _x + "," + _y + "," + _d + ");\n";
            break;
        case "p5.Text":
            code += "_p.text(";
            let _xt = 0;
            let _yt = 0;
            arr = jsn.prediction.entities;
            if (arr.hasOwnProperty('RawText')) {
                code += arr.RawText[0] + ',';
                if (arr.hasOwnProperty('param')) {
                    arr = arr.param
                    for (var i = 0; i < arr.length; i++) {
                        //console.log(arr[i].name);
                        if (arr[i].hasOwnProperty('name') && arr[i].hasOwnProperty('value')) {
                            switch (arr[i].name[0].toLowerCase()) {
                                case "horizontal":
                                case "x":
                                case "right":
                                case "left":
                                    _xt = arr[i].value[0];
                                    break;
                                case "vertical":
                                case "y":
                                case "up":
                                case "down":
                                    _yt = arr[i].value[0];
                                    break;
                            }
                        }
                    }
                }
            }
            code += _xt + "," + _yt + ");\n";
            break;
        case "Code":
            arr = jsn.prediction.entities;
            if (arr.hasOwnProperty('Raw')) {
                code += arr.Raw[0] + ";";
            }

            break;
        case "If":
            arr = jsn.prediction.entities;
            if (arr.hasOwnProperty('condition') && arr.hasOwnProperty('Conditionals')) {
                arr = arr.condition;
                let cond = arr.Conditionals[0];
                if (arr.hasOwnProperty('item1') && arr.hasOwnProperty('item2')) { // arr.hasOwnProperty('compare') && 
                    code += " if (" + arr.item1[0];
                    switch(cond[0]) {
                        case "equal":
                            cose += " == "
                            break;
                        case "not equal":
                            cose += " != "
                            break;
                        case "greater than":
                            cose += " > "
                            break;
                        case "greater than or equal to":
                            cose += " >= "
                            break;
                        case "less than":
                            cose += " < "
                            break;
                        case "less than or equal to":
                            cose += " <= "
                            break;
                    }
                    code += arr.item2[0] + ") ";
                }
            }

            break;
        case "Var":
            arr = jsn.prediction.entities;
            if (arr.hasOwnProperty('VarName2')) {
                code += "var " + arr.VarName2[0] + " = " ; // .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
                if (arr.hasOwnProperty('p5Variables')) {
                    //let st = arr.p5Variables[0][0];
                    switch (arr.p5Variables[0][0]) {
                        case "mousePressed":
                            code += "_p.mousePressed;"
                            break;
                        case "mouseX":
                            code += "_p.mouseX;"
                            break;
                        case "mouseY":
                            code += "_p.mouseY;"
                            break;
                        default :
                            code += "0;"
                    }
                }
                else if (arr.hasOwnProperty('VarValue')) {
                    code += arr.VarValue[0] + ";";
                }
                
            } else if (arr.hasOwnProperty('param')) {
                arr = arr.param;
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].hasOwnProperty('name') && arr[i].hasOwnProperty('value')) {
                        code += "var " + arr[i].name[0] + " = " + arr[i].value[0] + ";";
                    }
                }
            }

            break;
        default:
            cose = ";\n"
    }
    return code;
    //return (JSON.stringify(jsn) + '\n');
}