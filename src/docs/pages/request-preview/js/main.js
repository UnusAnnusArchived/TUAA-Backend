/// <reference path="../../../../../node_modules/monaco-editor/monaco.d.ts" />
export default function main(Monaco, output) {
    var apiPath = '';
    var urlHasOptions = false;
    if (getQueryVariable('showparams') === 'true') {
        if (getQueryVariable('customparamsheight')) {
            document.getElementById('request-params').style.height = getQueryVariable('customparamsheight') + 'px';
        }
        document.getElementById('output').classList.add('withparams');
        var params = JSON.parse(decodeURIComponent(getQueryVariable('params')));
        urlHasOptions = true;
        document.getElementById('request-params').classList.remove('hidden');
        if (getQueryVariable('value')) {
            document.body.innerText = 'YOU CANNOT USE A VALUE WITH PARAMS!';
        }
        var path_1 = getQueryVariable('path');
        var defaultVarPath = '';
        var defaultQuery = [];
        for (var i = 0; i < params.length; i++) {
            if (params[i].type === 'query') {
                defaultQuery.push("".concat(params[i].id, "=").concat(params[i].default));
            }
            else {
                if (i === (params.length - 1)) {
                    defaultVarPath += params[i].default;
                }
                else {
                    defaultVarPath += params[i].default + '/';
                }
            }
        }
        var defaultQueryStr = '?' + defaultQuery.join('&');
        makeRequest("".concat(path_1).concat(path_1.endsWith('/') ? '' : '/').concat(defaultVarPath).concat(defaultQueryStr));
        var ids = [];
        for (var i = 0; i < params.length; i++) {
            if (params[i].name && params[i].default && params[i].id) {
                ids.push(params[i].id);
                var template = document.getElementById('param-template').content.cloneNode(true);
                var span = template.querySelector('span');
                span.innerText = params[i].name;
                span.id = "".concat(params[i].id, "-span");
                var input = template.querySelector('input');
                input.value = params[i].default;
                input.placeholder = params[i].default;
                input.id = "".concat(params[i].id, "-input");
                if (params[i].type) {
                    input.setAttribute('data-type', params[i].type);
                }
                document.getElementById('request-params').prepend(template);
            }
        }
        document.getElementById('submit').addEventListener('click', function () {
            var varPath = '';
            var varQuery = [];
            for (var i = 0; i < ids.length; i++) {
                var input = document.getElementById("".concat(ids[i], "-input"));
                var type = input.getAttribute('data-type');
                if (type === 'query') {
                    varQuery.push("".concat(ids[i], "=").concat(input.value));
                }
                else {
                    if (i === (params.length - 1)) {
                        varPath += encodeURIComponent(input.value);
                    }
                    else {
                        varPath += encodeURIComponent(input.value) + '/';
                    }
                }
            }
            var varQueryStr = '?' + varQuery.join('&');
            makeRequest("".concat(path_1).concat(path_1.endsWith('/') ? '' : '/').concat(varPath).concat(varQueryStr));
        });
    }
    if (!urlHasOptions) {
        if (getQueryVariable('value')) {
            if (getQueryVariable('language')) {
                if (getQueryVariable('language').toLowerCase() === 'json') {
                    var model = monaco.editor.createModel(JSON.stringify(JSON.parse(decodeURIComponent(getQueryVariable('value'))), null, 2), 'json');
                    output.setModel(model);
                }
                else {
                    var model = monaco.editor.createModel(decodeURIComponent(getQueryVariable('value')), getQueryVariable('language'));
                    output.setModel(model);
                }
            }
            else {
                try {
                    var model = monaco.editor.createModel(JSON.stringify(JSON.parse(decodeURIComponent(getQueryVariable('value'))), null, 2), 'json');
                    output.setModel(model);
                }
                catch (_a) {
                    var model = monaco.editor.createModel(decodeURIComponent(getQueryVariable('value')), undefined);
                    output.setModel(model);
                }
            }
        }
        else {
            makeRequest(getQueryVariable('path'));
        }
    }
    function makeRequest(path) {
        console.log();
        fetch("".concat(apiPath).concat(path)).then(function (res) { return res.text(); }).then(function (res) {
            try {
                res = JSON.stringify(JSON.parse(res), null, 2);
                var model = monaco.editor.createModel(res, 'json');
                output.setModel(model);
            }
            catch (err) {
                console.error(err);
                var model = monaco.editor.createModel(res, undefined);
                output.setModel(model);
            }
        });
    }
}
function getQueryVariable(variable) {
    var query = location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (pair[0] == variable) {
            return pair[1];
        }
    }
}
//# sourceMappingURL=main.js.map