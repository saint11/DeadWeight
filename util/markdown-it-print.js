const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { document } = (new JSDOM(`...`)).window;

module.exports = function print_plugin(md) {

    function addPages(state) {
        var tokens = [];  // output
        var Token = state.Token;
        var sections = [];
        var nestedLevel = 0;

        function startPage(attrs) {
            var t = new Token('section_open', 'div class ="page"', 1);
            t.block = true;
            // t.attrs = { 'page' };
            return t;
        }

        function endPage() {
            var t = new Token('section_close', 'div', -1);
            t.block = true;
            return t;
        }

        tokens.push(startPage());
        var virtualDiv = document.createElement('DIV');

        for (var i = 0, l = state.tokens.length; i < l; i++) {
            var token = state.tokens[i];
            if (token.type == 'html_block') {

                virtualDiv.innerHTML = token.content;
                if (virtualDiv.firstChild.tagName.toLowerCase() == 'pagebreak') {
                    tokens.push(endPage());
                    tokens.push(startPage());
                }
            }
            tokens.push(token);
        }  // end for every token

        tokens.push(endPage());
        state.tokens = tokens;
    }

    md.core.ruler.push('header_sections', addPages);
}