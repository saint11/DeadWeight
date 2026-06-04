const cheerio = require("cheerio");

module.exports = function print_plugin(md) {

    function addPages(state) {
        var tokens = [];  // output
        var Token = state.Token;
        var pageNumber = 0;

        function startPage(className) {
            pageNumber++;
            // console.log("-- Added page " + pageNumber);
            var t = new Token('section_open', `div class ="page ${className}"`, 1);
            t.block = true;
            return t;
        }

        function endPage() {
            var t = new Token('section_close', 'div', -1);
            t.block = true;

            return t;
        }

        function makePageNumber(number) {
            var t = Object.assign(new Token('html_block', '', 0), { content: `<div class="page-number${number%2==0?" left":""}">${number}</div>`});
            return t;
        }

        tokens.push(startPage("first"));

        for (var i = 0, l = state.tokens.length; i < l; i++) {
            var token = state.tokens[i];
            if (token.type == 'html_block') {
                const $ = cheerio.load(token.content, null, false);
                const $first = $.root().children().first();
                const tagName = $first.length ? ($first.prop('tagName') || '').toLowerCase() : null;
                if (tagName == 'pagebreak') {
                    tokens.push(makePageNumber(pageNumber));
                    tokens.push(endPage());
                    tokens.push(startPage($first.attr('class') || ''));
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
