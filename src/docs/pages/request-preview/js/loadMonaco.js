/// <reference path="../../../../../node_modules/monaco-editor/monaco.d.ts" />
export default function loadMonaco() {
    return new Promise(function (resolve, reject) {
        // @ts-ignore
        require.config({
            paths: {
                vs: '/node_modules/monaco-editor/min/vs'
            }
        });
        // @ts-ignore
        require(['vs/editor/editor.main'], function () {
            resolve(monaco);
        });
    });
}
//# sourceMappingURL=loadMonaco.js.map