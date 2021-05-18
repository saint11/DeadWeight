const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { document } = (new JSDOM(`...`)).window;

module.exports = function print_plugin(md) {

    function addPages(state) {
        var tokens = [];  // output
        var Token = state.Token;
        var sections = [];
        var nestedLevel = 0;
        var pageNumber=0;

        function startPage(className) {
            pageNumber++;
            var t = new Token('section_open', `div class ="page ${className}"`, 1);
            t.block = true;
            return t;
        }

        function endPage() {
            var t = new Token('section_close', 'div', -1);
            t.block = true;
            return t;
        }

        function makePageNumber(number){
            var t = new Token('page_number', 'div');
            t.className = "page-number";
            t.content = pageNumber;
            return t;
        }

        tokens.push(startPage());
        var virtualDiv = document.createElement('DIV');

        var dummy = document.createElement('div');
        for (var i = 0, l = state.tokens.length; i < l; i++) {
            var token = state.tokens[i];
            if (token.type == 'html_block') {

                virtualDiv.innerHTML = token.content;
                if (virtualDiv.firstChild.tagName.toLowerCase() == 'pagebreak') {
                    // tokens.push(makePageNumber(pageNumber));
                    tokens.push(endPage());
                    
                    dummy.innerHTML = token.content;

                    tokens.push(startPage(dummy.childNodes[0].className));
                }
            }
            tokens.push(token);
        }  // end for every token

        tokens.push(endPage());
        // console.log(`Total pages: ${pageNumber} >`);
        state.tokens = tokens;
    }

    md.core.ruler.push('header_sections', addPages);
}